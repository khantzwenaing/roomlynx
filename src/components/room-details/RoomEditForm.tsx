
import React from "react";
import { Room } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoomEditFormProps {
  editedRoom: Partial<Room>;
  setEditedRoom: React.Dispatch<React.SetStateAction<Partial<Room>>>;
}

const RoomEditForm = ({ editedRoom, setEditedRoom }: RoomEditFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="roomNumber" className="text-lg">Room Number</Label>
        <Input
          id="roomNumber"
          value={editedRoom.roomNumber}
          onChange={(e) => setEditedRoom({...editedRoom, roomNumber: e.target.value})}
          className="text-lg h-12"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="roomType" className="text-lg">Room Type</Label>
        <Select 
          value={editedRoom.type} 
          onValueChange={(value: 'single' | 'double' | 'suite' | 'deluxe') => 
            setEditedRoom({...editedRoom, type: value})
          }
        >
          <SelectTrigger id="roomType" className="text-lg h-12">
            <SelectValue placeholder="Select room type" />
          </SelectTrigger>
          <SelectContent className="text-lg">
            <SelectItem value="single" className="text-lg py-3">Single</SelectItem>
            <SelectItem value="double" className="text-lg py-3">Double</SelectItem>
            <SelectItem value="suite" className="text-lg py-3">Suite</SelectItem>
            <SelectItem value="deluxe" className="text-lg py-3">Deluxe</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rate" className="text-lg">Rate per Night ($)</Label>
        <Input
          id="rate"
          type="number"
          value={editedRoom.rate}
          onChange={(e) => setEditedRoom({...editedRoom, rate: Number(e.target.value)})}
          min={1}
          className="text-lg h-12"
        />
      </div>
    </div>
  );
};

export default RoomEditForm;
