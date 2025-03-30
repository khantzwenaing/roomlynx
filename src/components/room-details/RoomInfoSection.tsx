
import React from "react";
import { Room } from "@/types";
import { Bed, DollarSign, Info, Calendar, Brush } from "lucide-react";

interface RoomInfoSectionProps {
  room: Room;
}

const RoomInfoSection = ({ room }: RoomInfoSectionProps) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex gap-4 items-center">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700">
            <Bed className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Room Type</h3>
            <p className="text-xl font-semibold">{room.type.charAt(0).toUpperCase() + room.type.slice(1)}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex gap-4 items-center">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 text-green-700">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Rate per Night</h3>
            <p className="text-xl font-semibold">${room.rate}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex gap-4 items-center">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-700">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Status</h3>
            <div className={`text-xl font-semibold flex items-center ${
              room.status === "vacant" ? "text-green-600" : 
              room.status === "occupied" ? "text-blue-600" : 
              room.status === "cleaning" ? "text-amber-600" : "text-red-600"
            }`}>
              {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
            </div>
          </div>
        </div>
      </div>
      
      {room.lastCleaned && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex gap-4 items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-teal-100 text-teal-700">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Last Cleaned</h3>
              <p className="text-xl font-semibold">{new Date(room.lastCleaned).toLocaleDateString()}</p>
              {room.cleanedBy && (
                <p className="text-sm flex items-center text-gray-600">
                  <Brush className="h-4 w-4 mr-1" /> {room.cleanedBy}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomInfoSection;
