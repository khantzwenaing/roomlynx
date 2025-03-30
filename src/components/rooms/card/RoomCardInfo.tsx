
import React from "react";
import { Room } from "@/types";

interface RoomCardInfoProps {
  room: Room;
}

const RoomCardInfo = ({ room }: RoomCardInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-lg">
        <span className="text-gray-600">Type:</span>
        <span className="font-medium">
          {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
        </span>
      </div>
      <div className="flex justify-between text-lg">
        <span className="text-gray-600">Rate:</span>
        <span className="font-medium">${room.rate}/night</span>
      </div>
      {room.lastCleaned && (
        <div className="flex justify-between text-lg">
          <span className="text-gray-600">Last Cleaned:</span>
          <span>
            {new Date(room.lastCleaned).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default RoomCardInfo;
