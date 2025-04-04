
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Room } from "@/types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface RoomCardHeaderProps {
  room: Room;
  onDeleteClick?: (e: React.MouseEvent) => void;
}

const RoomCardHeader = ({ room, onDeleteClick }: RoomCardHeaderProps) => {
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
        <div className="flex items-center gap-2">
          {onDeleteClick && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onDeleteClick} 
              className="h-8 w-8 text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </Button>
          )}
          <Badge className={`px-3 py-1 text-lg ${getStatusColor(room.status)}`}>
            {room.status === "vacant" ? "Available" : 
              room.status === "occupied" ? "Occupied" : 
              "Needs Cleaning"}
          </Badge>
        </div>
      </div>
    </CardHeader>
  );
};

export default RoomCardHeader;
