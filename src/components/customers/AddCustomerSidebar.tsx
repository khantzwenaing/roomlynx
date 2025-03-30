
import { useState } from "react";
import { Customer, Room } from "@/types";
import AddCustomerForm from "./AddCustomerForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddCustomerSidebarProps {
  rooms: Room[];
  onCustomerAdded: (customer: Customer) => void;
  preselectedRoomId?: string;
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

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-md md:max-w-lg overflow-y-auto p-0" 
        side="right" 
        onClick={(e) => e.stopPropagation()}
      >
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-xl">Add New Customer</SheetTitle>
          <SheetDescription>
            Enter customer details to complete check-in
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-6">
            <AddCustomerForm 
              rooms={rooms} 
              onCustomerAdded={(customer) => {
                onCustomerAdded(customer);
              }}
              onClose={() => setIsOpen(false)}
              preselectedRoomId={preselectedRoomId}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default AddCustomerSidebar;
