
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
import { Switch } from "@/components/ui/switch";
import { addRoom } from "@/services/rooms";
import { useToast } from "@/hooks/use-toast";

type AddRoomFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onRoomAdded: () => void;
};

const AddRoomForm = ({ isOpen, onClose, onRoomAdded }: AddRoomFormProps) => {
  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState<'single' | 'double' | 'suite' | 'deluxe'>('single');
  const [rate, setRate] = useState("");  // Keep as empty string for the input
  const [hasGas, setHasGas] = useState(true); // Default to true
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomNumber.trim()) {
      toast({
        title: "Error",
        description: "Room number is required",
        variant: "destructive",
      });
      return;
    }

    // Convert rate to number with a proper default
    const roomRate = rate.trim() ? Number(rate) : 80;  // Default to 80 if empty
    
    setIsSubmitting(true);
    
    try {
      const newRoom = await addRoom({
        roomNumber,
        type: roomType,
        rate: roomRate,
        status: 'vacant',
        lastCleaned: new Date().toISOString(),
        cleanedBy: 'System',
        hasGas: hasGas
      });
      
      if (newRoom) {
        toast({
          title: "Room Added",
          description: `Room ${newRoom.roomNumber} has been added successfully`,
        });
        
        // Reset form and close dialog
        setRoomNumber("");
        setRoomType('single');
        setRate("");
        setHasGas(true);
        onRoomAdded();
        onClose();
      } else {
        toast({
          title: "Error",
          description: "Failed to add room. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding room:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              placeholder="Enter room rate (default: $80)"
              min={1}
              className="text-lg h-12"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="hasGas" className="text-lg">Gas Available</Label>
              <Switch id="hasGas" checked={hasGas} onCheckedChange={setHasGas} />
            </div>
            <p className="text-sm text-gray-500">{hasGas ? "Room has gas facility" : "Room does not have gas"}</p>
          </div>
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="text-lg h-12"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="text-lg h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoomForm;
