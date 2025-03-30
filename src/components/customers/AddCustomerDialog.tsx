
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddCustomerForm from "./AddCustomerForm";
import { Room, Customer } from "@/types";

interface AddCustomerDialogProps {
  rooms: Room[];
  onCustomerAdded: (customer: Customer) => void;
}

const AddCustomerDialog = ({ rooms, onCustomerAdded }: AddCustomerDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Customer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <AddCustomerForm 
          rooms={rooms} 
          onCustomerAdded={onCustomerAdded} 
          onClose={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerDialog;
