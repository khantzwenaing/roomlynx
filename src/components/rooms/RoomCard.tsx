
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Room, Customer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { User, UserPlus, CreditCard, Trash2, Info, Clock, Home } from "lucide-react";
import { updateRoom, deleteRoom } from "@/services/dataService";

interface RoomCardProps {
  room: Room;
  customer: Customer | null;
  onRoomClick: (room: Room) => void;
}

const RoomCard = ({ room, customer, onRoomClick }: RoomCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cleanedBy, setCleanedBy] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const calculateRemainingDays = (checkOutDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const checkOut = new Date(checkOutDate);
    checkOut.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const timeDiff = checkOut.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return Math.max(0, daysDiff); // Ensure we don't return negative days
  };

  const handleDeleteRoom = async () => {
    if (room.status === 'occupied') {
      toast({
        title: "Cannot Delete Room",
        description: "This room is currently occupied. Check out the guest first.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      const success = await deleteRoom(room.id);
      
      if (success) {
        toast({
          title: "Room Deleted",
          description: `Room ${room.roomNumber} has been removed`,
        });
        // Reload the page to refresh the room list
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the room",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the room",
        variant: "destructive",
      });
    }
    
    setIsDeleteDialogOpen(false);
  };

  const handleCleaningComplete = async () => {
    if (!cleanedBy.trim()) {
      toast({
        title: "Error",
        description: "Please enter who cleaned the room",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedRoom = await updateRoom(room.id, {
        status: "vacant",
        lastCleaned: new Date().toISOString(),
        cleanedBy,
      });

      if (updatedRoom) {
        window.location.reload();
        toast({
          title: "Cleaning Completed",
          description: `Room ${updatedRoom.roomNumber} has been marked as clean`,
        });
      }
    } catch (error) {
      console.error("Error completing cleaning:", error);
      toast({
        title: "Error",
        description: "Failed to mark room as clean",
        variant: "destructive",
      });
    }
  };

  const openAddCustomerDialog = () => {
    navigate(`/room-details?roomId=${room.id}&action=checkin`);
  };

  const handleCheckout = () => {
    navigate(`/room-details?roomId=${room.id}&action=checkout`);
  };

  return (
    <Card 
      key={room.id} 
      className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
    >
      <CardHeader className="p-5 bg-gray-50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Room {room.roomNumber}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`px-3 py-1 text-lg ${getStatusColor(room.status)}`}>
              {room.status === "vacant" ? "Available" : 
                room.status === "occupied" ? "Occupied" : 
                "Needs Cleaning"}
            </Badge>
            
            <Button 
              variant="destructive" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">
              {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
            </span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Rate:</span>
            <span className="font-medium">${room.rate}/night</span>
          </div>
          {room.lastCleaned && (
            <div className="flex justify-between text-lg">
              <span className="text-gray-600">Last Cleaned:</span>
              <span>
                {new Date(room.lastCleaned).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {room.status === "occupied" && customer && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <User className="mr-2" size={20} />
                Current Guest
              </h3>
              <div className="space-y-2">
                <div className="font-medium text-lg">{customer.name}</div>
                <div>{customer.phone}</div>
                <div className="text-sm text-gray-600">
                  Check-in: {new Date(customer.checkInDate).toLocaleDateString()}
                </div>
                <div className="text-sm font-semibold text-blue-800">
                  Check-out: {new Date(customer.checkOutDate).toLocaleDateString()}
                </div>
                
                <div className="flex items-center mt-1 text-sm font-medium bg-yellow-50 text-yellow-800 p-2 rounded-md border border-yellow-200">
                  <Clock className="mr-2" size={16} />
                  <span>
                    {calculateRemainingDays(customer.checkOutDate) === 0 
                      ? "Checkout today!" 
                      : `${calculateRemainingDays(customer.checkOutDate)} days until checkout`}
                  </span>
                </div>
                
                <Link 
                  to={`/customers?id=${customer.id}`} 
                  className="text-blue-600 hover:underline block text-lg font-medium mt-2"
                >
                  View Customer Details
                </Link>
              </div>
            </div>
          )}
          
          <div className="pt-4 space-y-3">
            <Button 
              className="w-full py-6 text-lg bg-gray-600 hover:bg-gray-700"
              variant="default"
              onClick={() => onRoomClick(room)}
            >
              <Info className="mr-2" size={20} />
              View Room Details
            </Button>
          
            {room.status === "vacant" && (
              <Button 
                className="w-full py-6 text-lg"
                variant="default"
                onClick={openAddCustomerDialog}
              >
                <UserPlus className="mr-2" size={20} />
                Add Customer
              </Button>
            )}
            
            {room.status === "occupied" && (
              <Button 
                className="w-full py-6 text-lg bg-red-600 hover:bg-red-700"
                onClick={handleCheckout}
                type="button"
              >
                <CreditCard className="mr-2" size={20} />
                Check-out & Payment
              </Button>
            )}
            
            {room.status === "cleaning" && (
              <Button 
                className="w-full py-6 text-lg bg-green-600 hover:bg-green-700"
                onClick={handleCleaningComplete}
              >
                Complete Cleaning
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this room?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the room
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoom}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default RoomCard;
