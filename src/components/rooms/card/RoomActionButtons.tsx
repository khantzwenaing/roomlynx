
import React from "react";
import { Button } from "@/components/ui/button";
import { Info, UserPlus, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Room } from "@/types";

interface RoomActionButtonsProps {
  room: Room;
  onAddCustomer: () => void;
  onCheckout: () => void;
}

const RoomActionButtons = ({ room, onAddCustomer, onCheckout }: RoomActionButtonsProps) => {
  const navigate = useNavigate();

  return (
    <div className="pt-4 space-y-3">
      <Button 
        className="w-full py-6 text-lg bg-gray-600 hover:bg-gray-700"
        variant="default"
        onClick={() => navigate(`/room-details?roomId=${room.id}`)}
      >
        <Info className="mr-2" size={20} />
        View Room Details
      </Button>
    
      {room.status === "vacant" && (
        <Button 
          className="w-full py-6 text-lg"
          variant="default"
          onClick={onAddCustomer}
        >
          <UserPlus className="mr-2" size={20} />
          Add Customer
        </Button>
      )}
      
      {room.status === "occupied" && (
        <Button 
          className="w-full py-6 text-lg bg-red-600 hover:bg-red-700"
          onClick={onCheckout}
          type="button"
        >
          <CreditCard className="mr-2" size={20} />
          Check-out & Payment
        </Button>
      )}
    </div>
  );
};

export default RoomActionButtons;
