
import React, { useState } from "react";
import { Room, Customer } from "@/types";
import AddCustomerSidebar from "@/components/customers/AddCustomerSidebar";
import { updateRoom } from "@/services/dataService";
import { toast } from "sonner";

interface AddCustomerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
  onCustomerAdded: () => void;
}

const AddCustomerDialog = ({ 
  isOpen, 
  onOpenChange, 
  room, 
  onCustomerAdded
}: AddCustomerDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Guard against undefined room
  if (!room) {
    console.error("AddCustomerDialog: Room prop is undefined");
    return null;
  }

  const handleCustomerAdded = async (customer: Customer) => {
    try {
      setIsProcessing(true);
      console.log("Customer added successfully:", customer);
      console.log("Updating room status to occupied for room ID:", room.id);
      
      // Update room status to occupied when customer is added
      const updatedRoom = await updateRoom(room.id, { status: "occupied" });
      
      if (updatedRoom) {
        console.log("Room status updated successfully to occupied");
        toast.success("Customer checked in successfully");
        
        // Notify parent to refresh data with a delay to ensure DB operations complete
        setTimeout(() => {
          console.log("Triggering data refresh after customer added");
          onCustomerAdded();
          
          // Give a small delay before closing to ensure data updates are processed
          setTimeout(() => {
            // Close the dialog after successful operation
            onOpenChange(false);
            setIsProcessing(false);
          }, 500);
        }, 1000);
      } else {
        console.error("Failed to update room status");
        toast.error("Failed to update room status");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error in handleCustomerAdded:", error);
      toast.error("An error occurred during check-in");
      setIsProcessing(false);
    }
  };

  return (
    <AddCustomerSidebar
      rooms={[room]}
      onCustomerAdded={handleCustomerAdded}
      preselectedRoomId={room.id}
      open={isOpen}
      onOpenChange={(open) => {
        if (!isProcessing) {
          onOpenChange(open);
        }
      }}
    />
  );
};

export default AddCustomerDialog;
