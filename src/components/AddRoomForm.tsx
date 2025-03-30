
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addRoom } from "@/services/dataService";
import { useToast } from "@/hooks/use-toast";

type AddRoomFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onRoomAdded: () => void;
};

const AddRoomForm = ({ isOpen, onClose, onRoomAdded }: AddRoomFormProps) => {
  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState<'single' | 'double' | 'suite' | 'deluxe'>('single');
  const [rate, setRate] = useState("");  // Change to empty string
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomNumber.trim()) {
      toast({
        title: "Error",
        description: "Room number is required",
        variant: "destructive",
      });
      return;
    }

    // Convert rate to number only if it's not empty
    const roomRate = rate.trim() ? Number(rate) : 80;  // Default to 80 if empty

    const newRoom = addRoom({
      roomNumber,
      type: roomType,
      rate: roomRate,
      status: 'vacant',
      lastCleaned: new Date().toISOString(),
      cleanedBy: 'System',
    });

    toast({
      title: "Room Added",
      description: `Room ${newRoom.roomNumber} has been added successfully`,
    });

    // Reset form and close dialog
    setRoomNumber("");
    setRoomType('single');
    setRate("");  // Reset to empty string
    onRoomAdded();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="roomNumber" className="text-lg">Room Number</Label>
            <Input
              id="roomNumber"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. 101"
              className="text-lg h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomType" className="text-lg">Room Type</Label>
            <Select value={roomType} onValueChange={(value: 'single' | 'double' | 'suite' | 'deluxe') => setRoomType(value)}>
              <SelectTrigger className="text-lg h-12">
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent className="text-lg">
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate" className="text-lg">Rate per Night ($)</Label>
            <Input
              id="rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="Enter room rate"  // Add placeholder
              min={1}
              className="text-lg h-12"
              required
            />
          </div>
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="text-lg h-12"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="text-lg h-12"
            >
              Add Room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoomForm;
