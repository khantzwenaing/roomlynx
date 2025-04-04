
import { useState } from "react";
import { Room, Customer } from "@/types";
import { processCheckout, addPayment, processEarlyCheckout } from "@/services/paymentsService";
import { updateRoom } from "@/services/roomsService";
import { toast } from "sonner";
import { isBefore, parseISO } from "date-fns";
import { CheckoutDetails } from "./types";
import { calculateTotalStay, calculateExtraPersonsCharge } from "./roomCalculations";
import { supabase } from "@/integrations/supabase/client";
import { calculateGasCharge } from "@/services/settingsService";

export const useRoomCheckout = (room: Room, customer: Customer | null) => {
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails>({
    paymentMethod: "cash",
    bankRefNo: "",
    collectedBy: "",
    showCheckoutForm: false,
    gasCharge: 0,
    finalGasWeight: 0,
    extraPersonCharge: 0
  });

  const handleCheckout = async () => {
    if (!customer) {
      toast.error("Error", {
        description: "No customer information found"
      });
      setIsCheckoutDialogOpen(false);
      return;
    }
    
    if (!checkoutDetails.collectedBy) {
      toast.error("Error", {
        description: "Please enter who collected the payment"
      });
      return;
    }

    if (checkoutDetails.paymentMethod === "bank_transfer" && !checkoutDetails.bankRefNo) {
      toast.error("Error", {
        description: "Please enter bank reference number"
      });
      return;
    }

    try {
      // Check if this is an early checkout
      const today = new Date();
      const plannedCheckout = parseISO(customer.checkOutDate);
      const isEarlyCheckout = isBefore(today, plannedCheckout);
      
      // Calculate extra person charges
      const extraPersonCharge = await calculateExtraPersonsCharge(customer);
      
      // Calculate gas usage charge if applicable
      let gasCharge = 0;
      if (customer.hasGas && customer.initialGasWeight) {
        if (checkoutDetails.finalGasWeight > 0) {
          gasCharge = checkoutDetails.gasCharge || 0;
        } else if (customer.initialGasWeight) {
          // If final gas weight not entered, show error
          toast.error("Error", {
            description: "Please calculate gas usage before checkout"
          });
          return;
        }
      }
      
      if (isEarlyCheckout) {
        // Calculate refund amount for early checkout
        const checkInDate = parseISO(customer.checkInDate);
        
        // Calculate days stayed based on today
        const actualDaysStayed = Math.max(1, Math.ceil(
          (today.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
        ));
        
        // Amount due for actual stay
        const actualStayAmount = actualDaysStayed * room.rate;
        
        // Add extra person and gas charges
        const totalCharges = actualStayAmount + extraPersonCharge + gasCharge;
        
        // Calculate potential refund (if deposit was more than actual stay cost)
        const depositAmount = customer.depositAmount || 0;
        const refundAmount = Math.max(0, depositAmount - totalCharges);
        
        if (refundAmount > 0) {
          // Process as early checkout with refund
          const success = await processEarlyCheckout(
            room.id,
            customer.id,
            today.toISOString(),
            refundAmount,
            {
              method: checkoutDetails.paymentMethod as 'cash' | 'bank_transfer' | 'other',
              collectedBy: checkoutDetails.collectedBy,
              notes: checkoutDetails.bankRefNo 
                ? `Bank Ref: ${checkoutDetails.bankRefNo}, Gas: ${gasCharge}, Extra persons: ${extraPersonCharge}` 
                : `Early checkout refund, Gas: ${gasCharge}, Extra persons: ${extraPersonCharge}`
            }
          );
          
          if (success) {
            toast.success("Early Checkout Complete", {
              description: `Room ${room.roomNumber} has been checked out early with a refund of $${refundAmount}`
            });
          } else {
            throw new Error("Failed to process early checkout with refund");
          }
        } else {
          // Process as early checkout without refund (or additional payment needed)
          const paymentData = {
            customerId: customer.id,
            roomId: room.id,
            amount: Math.max(0, totalCharges - depositAmount),
            date: new Date().toISOString(),
            method: checkoutDetails.paymentMethod as 'cash' | 'bank_transfer' | 'other',
            collectedBy: checkoutDetails.collectedBy,
            status: "paid" as "paid" | "pending" | "partial",
            notes: checkoutDetails.bankRefNo 
              ? `Bank Ref: ${checkoutDetails.bankRefNo}, Gas: ${gasCharge}, Extra persons: ${extraPersonCharge}` 
              : `Early checkout payment, Gas: ${gasCharge}, Extra persons: ${extraPersonCharge}`,
            paymentType: 'checkout' as 'deposit' | 'checkout' | 'refund' | 'other',
            isRefund: false,
            extraPersonsCharge: extraPersonCharge,
            gasUsageCharge: gasCharge
          };
          
          // Add payment record if there's an amount due
          if (paymentData.amount > 0) {
            const payment = await addPayment(paymentData);
            if (!payment) throw new Error("Failed to record payment");
          }
          
          // Update customer checkout date and roomid and room status
          const earlyCheckoutSuccess = await processEarlyCheckout(
            room.id,
            customer.id,
            today.toISOString(),
            0, // No refund
            {
              method: checkoutDetails.paymentMethod as 'cash' | 'bank_transfer' | 'other',
              collectedBy: checkoutDetails.collectedBy,
              notes: `Gas: ${gasCharge}, Extra persons: ${extraPersonCharge}`
            }
          );
          
          if (earlyCheckoutSuccess) {
            toast.success("Early Checkout Complete", {
              description: `Room ${room.roomNumber} has been checked out early`
            });
          } else {
            throw new Error("Failed to process early checkout");
          }
        }
      } else {
        // Regular checkout (on planned date)
        // Calculate total amount due including extra charges
        const roomCharge = calculateTotalStay(room, customer);
        const totalCharges = roomCharge + extraPersonCharge + gasCharge;
        const depositAmount = customer.depositAmount || 0;
        const amountDue = Math.max(0, totalCharges - depositAmount);
        
        // 1. Add payment record
        const paymentData = {
          customerId: customer.id,
          roomId: room.id,
          amount: amountDue,
          date: new Date().toISOString(),
          method: checkoutDetails.paymentMethod as 'cash' | 'bank_transfer' | 'other',
          collectedBy: checkoutDetails.collectedBy,
          status: "paid" as "paid" | "pending" | "partial",
          notes: checkoutDetails.bankRefNo 
            ? `Bank Ref: ${checkoutDetails.bankRefNo}, Gas: ${gasCharge}, Extra persons: ${extraPersonCharge}` 
            : `Gas: ${gasCharge}, Extra persons: ${extraPersonCharge}`,
          paymentType: 'checkout' as 'deposit' | 'checkout' | 'refund' | 'other',
          isRefund: false,
          extraPersonsCharge: extraPersonCharge,
          gasUsageCharge: gasCharge
        };
        
        const payment = await addPayment(paymentData);
        
        if (!payment) throw new Error("Failed to record payment");
        
        // 2. Update room status to cleaning
        const updatedRoom = await updateRoom(room.id, {
          status: "cleaning"
        });
        
        if (!updatedRoom) throw new Error("Failed to update room status");
        
        // 3. Nullify customer roomid to allow room deletion
        const { error: customerError } = await supabase
          .from('customers')
          .update({ roomid: null })
          .eq('id', customer.id);
          
        if (customerError) {
          console.error('Error updating customer roomid:', customerError);
          throw new Error("Failed to update customer record");
        }
        
        // 4. Show success message
        toast.success("Checkout Complete", {
          description: `Room ${room.roomNumber} has been checked out and payment processed`
        });
      }
      
      // 5. Close dialog and reload page
      setIsCheckoutDialogOpen(false);
      
      // Add a small delay to ensure database operations are completed
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Checkout Failed", {
        description: "An unexpected error occurred during checkout"
      });
    }
  };

  const calculateAmountDue = async (): Promise<number> => {
    if (!customer) return 0;
    
    const totalStay = calculateTotalStay(room, customer);
    const depositAmount = customer.depositAmount || 0;
    
    // Calculate extra person charge
    const extraPersonCharge = await calculateExtraPersonsCharge(customer);
    
    // Get gas charge from checkout details or calculate it
    let gasCharge = checkoutDetails.gasCharge || 0;
    
    // Return total amount due
    return Math.max(0, totalStay + extraPersonCharge + gasCharge - depositAmount);
  };

  return {
    isCheckoutDialogOpen, 
    setIsCheckoutDialogOpen,
    checkoutDetails,
    setCheckoutDetails,
    handleCheckout,
    calculateTotalStay: () => calculateTotalStay(room, customer),
    calculateAmountDue
  };
};
