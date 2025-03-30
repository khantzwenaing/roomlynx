
import { useState } from "react";
import { Customer, Room } from "@/types";
import AddCustomerForm from "./AddCustomerForm";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddCustomerSidebarProps {
  rooms: Room[];
  onCustomerAdded: (customer: Customer) => void;
  preselectedRoomId?: string;
  triggerClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AddCustomerSidebar = ({ 
  rooms, 
  onCustomerAdded, 
  preselectedRoomId,
  open,
  onOpenChange
}: AddCustomerSidebarProps) => {
  const [localOpen, setLocalOpen] = useState(false);
  
  // Use either controlled or uncontrolled state
  const isOpen = open !== undefined ? open : localOpen;
  const setIsOpen = onOpenChange || setLocalOpen;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="h-[90vh] md:h-[85vh] max-w-md mx-auto">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-xl">Add New Customer</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="h-[calc(100vh-150px)] px-4">
            <AddCustomerForm 
              rooms={rooms} 
              onCustomerAdded={(customer) => {
                onCustomerAdded(customer);
                setIsOpen(false);
              }}
              onClose={() => setIsOpen(false)}
              preselectedRoomId={preselectedRoomId}
            />
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AddCustomerSidebar;
