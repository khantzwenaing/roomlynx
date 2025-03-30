
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddCustomerForm from "./AddCustomerForm";
import { Room, Customer } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] overflow-y-auto pr-3">
          <AddCustomerForm 
            rooms={rooms} 
            onCustomerAdded={onCustomerAdded} 
            onClose={() => setOpen(false)} 
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerDialog;
