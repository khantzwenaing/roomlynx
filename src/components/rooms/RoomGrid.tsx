
import React from "react";
import { Room, Customer } from "@/types";
import RoomCard from "./RoomCard";

interface RoomGridProps {
  rooms: Room[];
  isLoading: boolean;
  roomCustomers: {[key: string]: Customer | null};
  onRoomClick: (room: Room) => void;
  onCustomerAdded: () => void;
}

const RoomGrid = ({ rooms, isLoading, roomCustomers, onRoomClick, onCustomerAdded }: RoomGridProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-xl text-gray-500">Loading rooms...</div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-xl text-gray-500">No rooms found</div>
        <div className="mt-2 text-gray-400">Try adjusting your search or filter criteria</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard 
          key={room.id} 
          room={room} 
          customer={roomCustomers[room.id] || null}
          onRoomClick={onRoomClick}
          onCustomerAdded={onCustomerAdded}
        />
      ))}
    </div>
  );
};

export default RoomGrid;
