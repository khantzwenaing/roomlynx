
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Room, Customer } from "@/types";
import { useNavigate } from "react-router-dom";
import CleaningCompleteButton from "./card/CleaningCompleteButton";
import RoomActionButtons from "./card/RoomActionButtons";
import RoomCardHeader from "./card/RoomCardHeader";
import RoomCardInfo from "./card/RoomCardInfo";
import GuestInfo from "./card/GuestInfo";
import CheckoutDialog from "./dialogs/CheckoutDialog";
import DeleteRoomDialog from "./dialogs/DeleteRoomDialog";
import { useRoomOperations } from "@/hooks/useRoomOperations";
import AddCustomerDialog from "./dialogs/AddCustomerDialog";

interface RoomCardProps {
  room: Room;
  customer: Customer | null;
  onRoomUpdated: () => void;
}

const RoomCard = ({ room, customer, onRoomUpdated }: RoomCardProps) => {
  const navigate = useNavigate();

  console.log(
    `RoomCard ${room.roomNumber} - Status: ${room.status}, Customer:`,
    customer ? customer.name : "None"
  );

  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    cleanedBy,
    setCleanedBy,
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
  } = useRoomOperations(room, customer, onRoomUpdated);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    navigate(`/room-details?roomId=${room.id}`);
  };

  const handleAddCustomer = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    console.log(`Opening add customer dialog for room ${room.roomNumber}`);
    setIsAddCustomerDialogOpen(true);
  };

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    if (!customer) {
      console.error("Cannot checkout: no customer found for room", room.id);
      return;
    }
    console.log(
      `Opening checkout dialog for customer ${customer.name} in room ${room.roomNumber}`
    );
    setIsCheckoutDialogOpen(true);
  };

  const handleCleaningSubmit = async (cleanerName: string) => {
    setCleanedBy(cleanerName);
    await handleCleaningComplete();
  };

  return (
    <>
      <Card
        className={`h-full cursor-pointer hover:shadow-md transition-shadow duration-300 ${
          room.status === "vacant"
            ? "bg-white"
            : room.status === "occupied"
            ? "bg-blue-50"
            : room.status === "cleaning"
            ? "bg-yellow-50"
            : room.status === "maintenance"
            ? "bg-red-50"
            : ""
        }`}
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          <RoomCardHeader room={room} />

          <div className="p-4">
            <RoomCardInfo room={room} />

            {room.status === "occupied" && customer && (
              <GuestInfo customer={customer} />
            )}

            {room.status === "cleaning" && (
              <CleaningCompleteButton
                onComplete={handleCleaningSubmit}
                cleanedBy={cleanedBy}
                setCleanedBy={setCleanedBy}
              />
            )}

            <RoomActionButtons
              room={room}
              onAddCustomer={handleAddCustomer}
              onCheckout={handleCheckoutClick}
            />
          </div>
        </CardContent>
      </Card>

      <DeleteRoomDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteRoom}
        roomNumber={room.roomNumber}
      />

      {room.status === "occupied" && customer && (
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
      )}

      {isAddCustomerDialogOpen && room && (
        <AddCustomerDialog
          isOpen={isAddCustomerDialogOpen}
          onOpenChange={setIsAddCustomerDialogOpen}
          room={room}
          onCustomerAdded={onRoomUpdated}
        />
      )}
    </>
  );
};

export default RoomCard;
