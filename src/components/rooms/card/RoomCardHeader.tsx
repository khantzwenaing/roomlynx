
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Room } from "@/types";

interface RoomCardHeaderProps {
  room: Room;
}

const RoomCardHeader = ({ room }: RoomCardHeaderProps) => {
  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case "vacant":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-blue-100 text-blue-800";
      case "cleaning":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <CardHeader className="p-5 bg-gray-50">
      <div className="flex justify-between items-center">
        <CardTitle className="text-2xl">Room {room.roomNumber}</CardTitle>
        <Badge className={`px-3 py-1 text-lg ${getStatusColor(room.status)}`}>
          {room.status === "vacant" ? "Available" : 
            room.status === "occupied" ? "Occupied" : 
            "Needs Cleaning"}
        </Badge>
      </div>
    </CardHeader>
  );
};

export default RoomCardHeader;
