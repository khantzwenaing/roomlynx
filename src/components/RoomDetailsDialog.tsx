
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Room, Customer } from "@/types";
import { Pencil, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import RoomInfoSection from "./room-details/RoomInfoSection";
import GuestInfoSection from "./room-details/GuestInfoSection";
import CheckoutForm from "./room-details/CheckoutForm";
import RoomEditForm from "./room-details/RoomEditForm";
import type { RefundDetailsFormData } from "./room-details/checkout/early-checkout/RefundDetailsFormSchema";

interface RoomDetailsDialogProps {
  room: Room | null;
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onEdit: (updatedRoom: Partial<Room>) => void;
  onEarlyCheckout?: (
    actualCheckoutDate: string, 
    refundAmount: number, 
    refundDetails: RefundDetailsFormData
  ) => Promise<void>;
}

const RoomDetailsDialog = ({
  room,
  customer,
  isOpen,
  onClose,
  onCheckout,
  onEdit,
  onEarlyCheckout,
}: RoomDetailsDialogProps) => {
  const [editing, setEditing] = useState(false);
  const [editedRoom, setEditedRoom] = useState<Partial<Room>>({});
  const [checkoutDetails, setCheckoutDetails] = useState({
    paymentMethod: "cash",
    bankRefNo: "",
    collectedBy: "",
    showCheckoutForm: false
  });

  // Early return if room is null
  if (!room) return null;

  const handleEdit = () => {
    if (editing) {
      // Save changes
      onEdit(editedRoom);
      setEditing(false);
    } else {
      // Start editing
      setEditedRoom({
        roomNumber: room.roomNumber,
        type: room.type,
        rate: room.rate,
      });
      setEditing(true);
    }
  };

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event propagation
    setCheckoutDetails({
      ...checkoutDetails,
      showCheckoutForm: true
    });
  };

  const handleCompleteCheckout = () => {
    onCheckout();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader className="border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl flex items-center">
              <Home className="mr-2 h-6 w-6" />
              {editing ? "Edit Room " : "Room "}{room.roomNumber}
            </DrawerTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleEdit}>
                {editing ? "Save" : <Pencil className="h-5 w-5" />}
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm">Close</Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>
        
        <div className="p-6 space-y-6">
          {editing ? (
            <RoomEditForm 
              editedRoom={editedRoom} 
              setEditedRoom={setEditedRoom} 
            />
          ) : (
            <RoomInfoSection room={room} />
          )}

          {customer && room.status === "occupied" && (
            <div className="mt-6 p-5 bg-blue-50 rounded-lg border border-blue-100">
              <GuestInfoSection 
                customer={customer} 
                room={room} 
              />

              {!checkoutDetails.showCheckoutForm ? (
                <Button 
                  className="w-full mt-6 py-6 text-xl bg-red-600 hover:bg-red-700"
                  onClick={handleCheckoutClick}
                >
                  Check-out & Payment
                </Button>
              ) : (
                <CheckoutForm 
                  checkoutDetails={checkoutDetails}
                  setCheckoutDetails={setCheckoutDetails}
                  customer={customer}
                  room={room}
                  onCompleteCheckout={handleCompleteCheckout}
                  onEarlyCheckout={onEarlyCheckout}
                />
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default RoomDetailsDialog;
