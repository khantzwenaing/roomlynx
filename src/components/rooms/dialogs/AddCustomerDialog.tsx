
import React from "react";
import { Room } from "@/types";
import AddCustomerSidebar from "@/components/customers/AddCustomerSidebar";

interface AddCustomerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
  onCustomerAdded: (customer: any) => void;
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
      onCustomerAdded={(newCustomer) => {
        onOpenChange(false);
        if (onCustomerAdded) {
          onCustomerAdded(newCustomer);
        }
      }}
      preselectedRoomId={room.id}
      open={isOpen}
      onOpenChange={onOpenChange}
    />
  );
};

export default AddCustomerDialog;
