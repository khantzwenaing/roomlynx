
import { Room, Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddCustomerSidebar from "./AddCustomerSidebar";
import { useState } from "react";

interface AddCustomerDialogProps {
  rooms: Room[];
  onCustomerAdded: (customer: Customer) => void;
  preselectedRoomId?: string;
}

const AddCustomerDialog = ({ rooms, onCustomerAdded, preselectedRoomId }: AddCustomerDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2" size={18} />
        Add New Customer
      </Button>
      
      <AddCustomerSidebar
        rooms={rooms}
        onCustomerAdded={onCustomerAdded}
        preselectedRoomId={preselectedRoomId}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
};

export default AddCustomerDialog;
