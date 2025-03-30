
import React from "react";
import { Room, Customer } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useRoomOperations } from "@/hooks/useRoomOperations";
import RoomCardHeader from "./card/RoomCardHeader";
import RoomCardInfo from "./card/RoomCardInfo";
import GuestInfo from "./card/GuestInfo";
import RoomActionButtons from "./card/RoomActionButtons";
import CleaningCompleteButton from "./card/CleaningCompleteButton";
import DeleteRoomDialog from "./dialogs/DeleteRoomDialog";
import CheckoutDialog from "./dialogs/CheckoutDialog";
import AddCustomerDialog from "./dialogs/AddCustomerDialog";

interface RoomCardProps {
  room: Room;
  customer: Customer | null;
  onRoomClick: (room: Room) => void;
}

const RoomCard = ({ room, customer, onRoomClick }: RoomCardProps) => {
  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isCheckoutDialogOpen,
    setIsCheckoutDialogOpen,
    isAddCustomerDialogOpen,
    setIsAddCustomerDialogOpen,
    checkoutDetails,
    setCheckoutDetails,
    calculateTotalStay,
    calculateAmountDue,
    handleDeleteRoom,
    handleCleaningComplete,
    handleCheckout,
  } = useRoomOperations(room, customer);

  return (
    <Card 
      key={room.id} 
      className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
    >
      <RoomCardHeader 
        room={room} 
        onDeleteClick={(e) => {
          e.stopPropagation();
          setIsDeleteDialogOpen(true);
        }} 
      />
      
      <CardContent className="p-5">
        <div className="space-y-4">
          <RoomCardInfo room={room} />
          
          {room.status === "occupied" && customer && (
            <GuestInfo customer={customer} />
          )}
          
          <RoomActionButtons 
            room={room} 
            onAddCustomer={() => setIsAddCustomerDialogOpen(true)}
            onCheckout={() => setIsCheckoutDialogOpen(true)}
          />
          
          {room.status === "cleaning" && (
            <CleaningCompleteButton 
              onCleaningComplete={handleCleaningComplete}
            />
          )}
        </div>
      </CardContent>

      {/* Dialogs */}
      <DeleteRoomDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteRoom}
      />

      <CheckoutDialog 
        isOpen={isCheckoutDialogOpen}
        onOpenChange={setIsCheckoutDialogOpen}
        room={room}
        customer={customer}
        checkoutDetails={checkoutDetails}
        setCheckoutDetails={setCheckoutDetails}
        onCheckout={handleCheckout}
        calculateAmountDue={calculateAmountDue}
        calculateTotalStay={calculateTotalStay}
      />

      <AddCustomerDialog 
        isOpen={isAddCustomerDialogOpen}
        onOpenChange={setIsAddCustomerDialogOpen}
        room={room}
        onCustomerAdded={() => {
          setIsAddCustomerDialogOpen(false);
          window.location.reload();
        }}
      />
    </Card>
  );
};

export default RoomCard;
