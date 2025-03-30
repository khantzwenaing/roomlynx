
import { useState } from "react";
import { Room, Customer } from "@/types";
import { updateRoom, deleteRoom } from "@/services/dataService";
import { processCheckout, addPayment } from "@/services/paymentsService";
import { toast } from "sonner";

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
      // 1. Add payment record
      const paymentData = {
        customerId: customer.id,
        roomId: room.id,
        amount: calculateAmountDue(),
        date: new Date().toISOString(),
        method: checkoutDetails.paymentMethod,
        collectedBy: checkoutDetails.collectedBy,
        status: "paid" as "paid" | "pending" | "partial",
        notes: checkoutDetails.bankRefNo ? `Bank Ref: ${checkoutDetails.bankRefNo}` : ""
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
