
import { useState } from "react";
import { Room, Customer } from "@/types";
import { processCheckout, addPayment, processEarlyCheckout } from "@/services/paymentsService";
import { updateRoom } from "@/services/roomsService";
import { toast } from "sonner";
import { isBefore, parseISO } from "date-fns";
import { CheckoutDetails } from "./types";
import { calculateTotalStay, calculateAmountDue } from "./roomCalculations";
import { supabase } from "@/integrations/supabase/client";

export const useRoomCheckout = (room: Room, customer: Customer | null) => {
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails>({
    paymentMethod: "cash",
    bankRefNo: "",
    collectedBy: "",
    showCheckoutForm: false
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
      
      if (isEarlyCheckout) {
        // Calculate refund amount for early checkout
        const checkInDate = parseISO(customer.checkInDate);
        
        // Calculate days stayed based on today
        const actualDaysStayed = Math.max(1, Math.ceil(
          (today.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
        ));
        
        // Amount due for actual stay
        const actualStayAmount = actualDaysStayed * room.rate;
        
        // Calculate potential refund (if deposit was more than actual stay cost)
        const depositAmount = customer.depositAmount || 0;
        const refundAmount = Math.max(0, depositAmount - actualStayAmount);
        
        if (refundAmount > 0) {
          // Process as early checkout with refund
          const success = await processEarlyCheckout(
            room.id,
            customer.id,
            today.toISOString(),
            refundAmount,
            {
              method: checkoutDetails.paymentMethod,
              collectedBy: checkoutDetails.collectedBy,
              notes: checkoutDetails.bankRefNo 
                ? `Bank Ref: ${checkoutDetails.bankRefNo}` 
                : "Early checkout refund"
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
            amount: Math.max(0, actualStayAmount - depositAmount),
            date: new Date().toISOString(),
            method: checkoutDetails.paymentMethod,
            collectedBy: checkoutDetails.collectedBy,
            status: "paid" as "paid" | "pending" | "partial",
            notes: checkoutDetails.bankRefNo 
              ? `Bank Ref: ${checkoutDetails.bankRefNo}` 
              : "Early checkout payment",
            paymentType: 'checkout' as 'deposit' | 'checkout' | 'refund' | 'other',
            isRefund: false
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
              method: checkoutDetails.paymentMethod,
              collectedBy: checkoutDetails.collectedBy
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
        // 1. Add payment record
        const paymentData = {
          customerId: customer.id,
          roomId: room.id,
          amount: calculateAmountDue(room, customer),
          date: new Date().toISOString(),
          method: checkoutDetails.paymentMethod,
          collectedBy: checkoutDetails.collectedBy,
          status: "paid" as "paid" | "pending" | "partial",
          notes: checkoutDetails.bankRefNo ? `Bank Ref: ${checkoutDetails.bankRefNo}` : "",
          paymentType: 'checkout' as 'deposit' | 'checkout' | 'refund' | 'other',
          isRefund: false
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

  return {
    isCheckoutDialogOpen, 
    setIsCheckoutDialogOpen,
    checkoutDetails,
    setCheckoutDetails,
    handleCheckout,
    calculateTotalStay: () => calculateTotalStay(room, customer),
    calculateAmountDue: () => calculateAmountDue(room, customer)
  };
};
