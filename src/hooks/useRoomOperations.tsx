
import { useState } from "react";
import { Room, Customer } from "@/types";
import { updateRoom, deleteRoom } from "@/services/dataService";
import { processCheckout, addPayment, processEarlyCheckout } from "@/services/paymentsService";
import { toast } from "sonner";
import { isBefore, parseISO } from "date-fns";

export const useRoomOperations = (room: Room, customer: Customer | null, onRoomUpdated?: () => void) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cleanedBy, setCleanedBy] = useState("");
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState({
    paymentMethod: "cash" as "cash" | "bank_transfer" | "other",
    bankRefNo: "",
    collectedBy: "",
    showCheckoutForm: false
  });

  const calculateTotalStay = (): number => {
    if (!customer) return 0;
    
    const checkInDate = new Date(customer.checkInDate);
    const checkOutDate = new Date(customer.checkOutDate);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(1, days) * room.rate;
  };

  const calculateAmountDue = (): number => {
    const totalStay = calculateTotalStay();
    const depositAmount = customer?.depositAmount || 0;
    return Math.max(0, totalStay - depositAmount);
  };

  const handleDeleteRoom = async () => {
    if (!room || !room.id) {
      toast.error("Cannot Delete Room", {
        description: "Room ID is missing"
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    if (room.status === 'occupied') {
      toast.error("Cannot Delete Room", {
        description: "This room is currently occupied. Check out the guest first."
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      console.log(`Attempting to delete room with ID: ${room.id}`);
      const success = await deleteRoom(room.id);
      
      if (success) {
        toast.success("Room Deleted", {
          description: `Room ${room.roomNumber} has been removed`
        });
        // Reload the page to refresh the room list
        window.location.reload();
      } else {
        toast.error("Error", {
          description: "Failed to delete the room. It may have associated customers or payments."
        });
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Error", {
        description: "An unexpected error occurred while deleting the room"
      });
    }
    
    setIsDeleteDialogOpen(false);
  };

  const handleCleaningComplete = async (cleanerName: string) => {
    if (!cleanerName.trim()) {
      toast.error("Error", {
        description: "Please enter who cleaned the room"
      });
      return;
    }

    try {
      const updatedRoom = await updateRoom(room.id, {
        status: "vacant",
        lastCleaned: new Date().toISOString(),
        cleanedBy: cleanerName,
      });

      if (updatedRoom) {
        toast.success("Cleaning Completed", {
          description: `Room ${updatedRoom.roomNumber} has been marked as clean`
        });
        
        // Use a delay to ensure database updates complete before refreshing
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error("Failed to update room status");
      }
    } catch (error) {
      console.error("Error completing cleaning:", error);
      toast.error("Error", {
        description: "Failed to mark room as clean"
      });
    }
  };

  const handleCheckout = async () => {
    if (!customer) {
      toast.error("Error", {
        description: "No customer information found"
      });
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
            isRefund: false
          };
          
          // Add payment record if there's an amount due
          if (paymentData.amount > 0) {
            const payment = await addPayment(paymentData);
            if (!payment) throw new Error("Failed to record payment");
          }
          
          // Update customer checkout date and room status
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
        // 1. Add payment record - removed paymentType field to match database schema
        const paymentData = {
          customerId: customer.id,
          roomId: room.id,
          amount: calculateAmountDue(),
          date: new Date().toISOString(),
          method: checkoutDetails.paymentMethod,
          collectedBy: checkoutDetails.collectedBy,
          status: "paid" as "paid" | "pending" | "partial",
          notes: checkoutDetails.bankRefNo ? `Bank Ref: ${checkoutDetails.bankRefNo}` : "",
          isRefund: false
        };
        
        const payment = await addPayment(paymentData);
        
        if (!payment) throw new Error("Failed to record payment");
        
        // 2. Update room status to cleaning
        const updatedRoom = await updateRoom(room.id, {
          status: "cleaning"
        });
        
        if (!updatedRoom) throw new Error("Failed to update room status");
        
        // 3. Show success message
        toast.success("Checkout Complete", {
          description: `Room ${room.roomNumber} has been checked out and payment processed`
        });
      }
      
      // 4. Close dialog and reload page
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
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    cleanedBy,
    setCleanedBy,
    isCheckoutDialogOpen,
    setIsCheckoutDialogOpen,
    isAddCustomerDialogOpen,
    setIsAddCustomerDialogOpen,
    checkoutDetails,
    setCheckoutDetails,
    calculateTotalStay,
    calculateAmountDue,
    handleDeleteRoom,
    handleCleaningComplete,
    handleCheckout,
  };
};
