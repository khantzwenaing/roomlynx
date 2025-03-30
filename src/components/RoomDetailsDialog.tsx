
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Room, Customer } from "@/types";
import { User, CreditCard, Pencil, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoomDetailsDialogProps {
  room: Room | null;
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onEdit: (updatedRoom: Partial<Room>) => void;
}

const RoomDetailsDialog = ({
  room,
  customer,
  isOpen,
  onClose,
  onCheckout,
  onEdit,
}: RoomDetailsDialogProps) => {
  const [editing, setEditing] = useState(false);
  const [editedRoom, setEditedRoom] = useState<Partial<Room>>({});

  if (!room) return null;

  const handleEdit = () => {
    if (editing) {
      // Save changes
      onEdit(editedRoom);
      setEditing(false);
    } else {
      // Start editing
      setEditedRoom({
        roomNumber: room.roomNumber,
        type: room.type,
        rate: room.rate,
      });
      setEditing(true);
    }
  };

  const calculateTotalStay = () => {
    if (!customer) return 0;
    const checkInDate = new Date(customer.checkInDate);
    const checkOutDate = new Date(customer.checkOutDate);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(1, days) * room.rate;
  };

  const calculateRemainingDays = (): number => {
    if (!customer) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const checkOut = new Date(customer.checkOutDate);
    checkOut.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const timeDiff = checkOut.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return Math.max(0, daysDiff); // Ensure we don't return negative days
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            {editing ? "Edit Room " : "Room "}{room.roomNumber}
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              {editing ? "Save" : <Pencil className="h-5 w-5" />}
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {editing ? (
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
          ) : (
            <div className="grid grid-cols-2 gap-4 text-lg">
              <div className="font-semibold">Type:</div>
              <div>{room.type.charAt(0).toUpperCase() + room.type.slice(1)}</div>
              
              <div className="font-semibold">Rate:</div>
              <div>${room.rate}/night</div>
              
              <div className="font-semibold">Status:</div>
              <div>{room.status.charAt(0).toUpperCase() + room.status.slice(1)}</div>
              
              {room.lastCleaned && (
                <>
                  <div className="font-semibold">Last Cleaned:</div>
                  <div>{new Date(room.lastCleaned).toLocaleDateString()}</div>
                  
                  <div className="font-semibold">Cleaned By:</div>
                  <div>{room.cleanedBy}</div>
                </>
              )}
            </div>
          )}

          {customer && room.status === "occupied" && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <User className="mr-2" size={24} />
                Current Guest
              </h3>
              <div className="space-y-3">
                <div className="font-medium text-xl">{customer.name}</div>
                <div className="text-lg">{customer.phone}</div>
                {customer.email && <div className="text-lg">{customer.email}</div>}
                <div className="text-lg text-gray-700">
                  Check-in: {new Date(customer.checkInDate).toLocaleDateString()}
                </div>
                <div className="text-lg font-semibold text-blue-800">
                  Check-out: {new Date(customer.checkOutDate).toLocaleDateString()}
                </div>
                
                <div className="flex items-center mt-1 text-lg font-medium bg-yellow-50 text-yellow-800 p-3 rounded-md border border-yellow-200">
                  <Clock className="mr-2" size={20} />
                  <span>
                    {calculateRemainingDays() === 0 
                      ? "Checkout today!" 
                      : `${calculateRemainingDays()} days until checkout`}
                  </span>
                </div>
                
                <div className="text-lg font-semibold text-green-700">
                  Total Stay: ${calculateTotalStay()}
                </div>
                {customer.depositAmount && (
                  <div className="text-lg font-semibold text-purple-700">
                    Deposit: ${customer.depositAmount}
                  </div>
                )}
                <Link 
                  to={`/customers?id=${customer.id}`}
                  className="text-blue-600 hover:underline block text-xl font-medium mt-2"
                >
                  View Customer Details
                </Link>
              </div>

              <Button 
                className="w-full mt-6 py-6 text-xl bg-red-600 hover:bg-red-700"
                onClick={onCheckout}
              >
                <CreditCard className="mr-2" size={24} />
                Check-out & Payment
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailsDialog;
