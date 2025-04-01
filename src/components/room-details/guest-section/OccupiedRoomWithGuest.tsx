
import React from "react";
import { Room, Customer } from "@/types";
import { User } from "lucide-react";
import GuestInfoSection from "@/components/room-details/GuestInfoSection";

interface OccupiedRoomWithGuestProps {
  room: Room;
  customer: Customer;
}

const OccupiedRoomWithGuest = ({ room, customer }: OccupiedRoomWithGuestProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <GuestInfoSection customer={customer} room={room} />
      </div>
    </div>
  );
};

export default OccupiedRoomWithGuest;
