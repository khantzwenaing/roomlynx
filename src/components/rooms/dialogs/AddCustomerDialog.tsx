
import React from "react";
import { Room } from "@/types";
import AddCustomerSidebar from "@/components/customers/AddCustomerSidebar";
import { updateRoom } from "@/services/dataService";

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
  const handleCustomerAdded = async (customer: any) => {
    // Update room status to occupied when customer is added
    await updateRoom(room.id, { status: "occupied" });
    onCustomerAdded();
    onOpenChange(false);
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
