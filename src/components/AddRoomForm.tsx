
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
  const [rate, setRate] = useState(80);
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

    const newRoom = addRoom({
      roomNumber,
      type: roomType,
      rate,
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
    setRate(80);
    onRoomAdded();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. 101"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomType">Room Type</Label>
            <Select value={roomType} onValueChange={(value: 'single' | 'double' | 'suite' | 'deluxe') => setRoomType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="double">Double</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Rate per Night ($)</Label>
            <Input
              id="rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              min={1}
              required
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Room</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoomForm;
