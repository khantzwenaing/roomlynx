
import { Room, Customer } from "@/types";
import AddCustomerSidebar from "./AddCustomerSidebar";

interface AddCustomerDialogProps {
  rooms: Room[];
  onCustomerAdded: (customer: Customer) => void;
}

const AddCustomerDialog = ({ rooms, onCustomerAdded }: AddCustomerDialogProps) => {
  return (
    <AddCustomerSidebar
      rooms={rooms}
      onCustomerAdded={onCustomerAdded}
    />
  );
};

export default AddCustomerDialog;
