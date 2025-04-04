
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Room } from "@/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";

interface RoomInformationProps {
  room: Room;
  isEditing: boolean;
  editedRoom: Partial<Room>;
  setEditedRoom: React.Dispatch<React.SetStateAction<Partial<Room>>>;
}

const RoomInformation = ({ room, isEditing, editedRoom, setEditedRoom }: RoomInformationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="roomNumber">Room Number</Label>
            {isEditing ? (
              <Input
                id="roomNumber"
                value={editedRoom.roomNumber || ""}
                onChange={(e) => setEditedRoom({ ...editedRoom, roomNumber: e.target.value })}
                placeholder="Room number"
              />
            ) : (
              <div className="mt-1 text-lg">{room.roomNumber}</div>
            )}
          </div>

          <div>
            <Label htmlFor="type">Room Type</Label>
            {isEditing ? (
              <Select
                value={editedRoom.type}
                onValueChange={(value) => setEditedRoom({ ...editedRoom, type: value as Room["type"] })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select a room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-1 text-lg capitalize">{room.type}</div>
            )}
          </div>

          <div>
            <Label htmlFor="rate">Daily Rate</Label>
            {isEditing ? (
              <Input
                id="rate"
                type="number"
                value={editedRoom.rate || ""}
                onChange={(e) => setEditedRoom({ ...editedRoom, rate: Number(e.target.value) })}
                placeholder="Daily rate"
              />
            ) : (
              <div className="mt-1 text-lg">${room.rate}</div>
            )}
          </div>
          
          <div>
            <Label htmlFor="hasGas">Gas Available</Label>
            {isEditing ? (
              <div className="flex items-center space-x-2 mt-1">
                <Switch
                  id="hasGas"
                  checked={editedRoom.hasGas || false}
                  onCheckedChange={(checked) => setEditedRoom({ ...editedRoom, hasGas: checked })}
                />
                <span>{editedRoom.hasGas ? "Yes" : "No"}</span>
              </div>
            ) : (
              <div className="mt-1 text-lg">{room.hasGas ? "Yes" : "No"}</div>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <div className="mt-1 text-lg capitalize">{room.status}</div>
          </div>

          {room.lastCleaned && (
            <div>
              <Label htmlFor="lastCleaned">Last Cleaned</Label>
              <div className="mt-1">
                {format(new Date(room.lastCleaned), "PPP")}
                {room.cleanedBy && <span className="ml-2 text-gray-500">by {room.cleanedBy}</span>}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomInformation;
