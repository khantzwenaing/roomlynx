
import React from "react";
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
  const handleCustomerAdded = async (customer: Customer) => {
    try {
      console.log("Customer added successfully:", customer);
      console.log("Updating room status to occupied for room ID:", room.id);
      
      // Update room status to occupied when customer is added
      const updatedRoom = await updateRoom(room.id, { status: "occupied" });
      
      if (updatedRoom) {
        console.log("Room status updated successfully to occupied");
        toast.success("Customer checked in successfully");
      } else {
        console.error("Failed to update room status");
        toast.error("Failed to update room status");
      }
      
      // Notify parent to refresh data
      onCustomerAdded();
      
      // Close the dialog after successful operation
      onOpenChange(false);
    } catch (error) {
      console.error("Error in handleCustomerAdded:", error);
      toast.error("An error occurred during check-in");
    }
  };

  return (
    <AddCustomerSidebar
      rooms={[room]}
      onCustomerAdded={handleCustomerAdded}
      preselectedRoomId={room.id}
      open={isOpen}
      onOpenChange={onOpenChange}
    />
  );
};

export default AddCustomerDialog;
