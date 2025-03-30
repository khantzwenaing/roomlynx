
import React from "react";
import { Room } from "@/types";
import AddCustomerSidebar from "@/components/customers/AddCustomerSidebar";

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
  return (
    <AddCustomerSidebar
      rooms={[room]}
      onCustomerAdded={() => {
        onCustomerAdded();
        onOpenChange(false);
      }}
      preselectedRoomId={room.id}
      open={isOpen}
      onOpenChange={onOpenChange}
    />
  );
};

export default AddCustomerDialog;
