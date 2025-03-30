
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Room } from "@/types";
import AddCustomerForm from "@/components/customers/AddCustomerForm";

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Customer to Room {room.roomNumber}</DialogTitle>
          <DialogDescription>
            Enter customer details for check-in
          </DialogDescription>
        </DialogHeader>
        <AddCustomerForm 
          rooms={[room]} 
          onCustomerAdded={(newCustomer) => {
            onOpenChange(false);
            window.location.reload();
          }} 
          onClose={() => onOpenChange(false)}
          preselectedRoomId={room.id}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerDialog;
