
import React from "react";
import { Room } from "@/types";
import { Home, Brush } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import RoomEditForm from "./RoomEditForm";

interface RoomInformationProps {
  room: Room;
  isEditing: boolean;
  editedRoom: Partial<Room>;
  setEditedRoom: React.Dispatch<React.SetStateAction<Partial<Room>>>;
}

const RoomInformation = ({
  room,
  isEditing,
  editedRoom,
  setEditedRoom
}: RoomInformationProps) => {
  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Home className="mr-2 text-blue-500" />
        Room Information
      </h2>
      
      {isEditing ? (
        <RoomEditForm 
          editedRoom={editedRoom} 
          setEditedRoom={setEditedRoom} 
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Room Number:</span>
            <span className="font-medium">{room.roomNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Room Type:</span>
            <span className="font-medium capitalize">{room.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Daily Rate:</span>
            <span className="font-medium">${room.rate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status:</span>
            <Badge 
              className={
                room.status === 'vacant' ? 'bg-green-500' :
                room.status === 'occupied' ? 'bg-blue-500' :
                room.status === 'maintenance' ? 'bg-amber-500' : 'bg-gray-500'
              }
            >
              {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
            </Badge>
          </div>
          {room.lastCleaned && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Cleaned:</span>
                <span className="font-medium">
                  {format(new Date(room.lastCleaned), "MMM dd, yyyy")}
                </span>
              </div>
              {room.cleanedBy && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Cleaned By:</span>
                  <span className="font-medium flex items-center">
                    <Brush className="mr-2 h-4 w-4 text-purple-500" />
                    {room.cleanedBy}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomInformation;
