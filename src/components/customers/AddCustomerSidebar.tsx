
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Customer, Room } from "@/types";
import AddCustomerForm from "./AddCustomerForm";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddCustomerSidebarProps {
  rooms: Room[];
  onCustomerAdded: (customer: Customer) => void;
  preselectedRoomId?: string;
  triggerClassName?: string;
}

const AddCustomerSidebar = ({ 
  rooms, 
  onCustomerAdded, 
  preselectedRoomId,
  triggerClassName
}: AddCustomerSidebarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className={triggerClassName}>
          <Plus className="mr-2" size={18} />
          Add New Customer
        </Button>
      </DrawerTrigger>
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
                setOpen(false);
              }}
              onClose={() => setOpen(false)}
              preselectedRoomId={preselectedRoomId}
            />
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AddCustomerSidebar;
