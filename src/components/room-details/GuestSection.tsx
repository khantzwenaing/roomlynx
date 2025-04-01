
import React from "react";
import { Room, Customer } from "@/types";
import OccupiedRoomWithGuest from "./guest-section/OccupiedRoomWithGuest";
import OccupiedRoomNoGuest from "./guest-section/OccupiedRoomNoGuest";

interface GuestSectionProps {
  room: Room;
  customer: Customer | null;
  onRefreshData: () => void;
}

const GuestSection = ({ room, customer, onRefreshData }: GuestSectionProps) => {
  if (customer) {
    return <OccupiedRoomWithGuest room={room} customer={customer} />;
  } else if (room.status === "occupied") {
    return <OccupiedRoomNoGuest onRefreshData={onRefreshData} />;
  }
  
  return null;
};

export default GuestSection;
