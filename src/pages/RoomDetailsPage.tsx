
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getRoomDetails } from "@/services/roomsService";
import { Room, Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { User, Phone, Home, Calendar, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const RoomDetailsPage = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const roomId = searchParams.get("roomId");

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!roomId) {
        toast.error("Room ID is missing");
        navigate("/rooms");
        return;
      }

      setLoading(true);
      try {
        const roomData = await getRoomDetails(roomId);
        setRoom(roomData);
      } catch (error) {
        console.error("Error fetching room details:", error);
        toast.error("Failed to load room details");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId, navigate]);

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center h-64 justify-center">
          <p className="text-lg mb-4">Room not found</p>
          <Button onClick={handleBackClick}>
            <ArrowLeft className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const customer = room.currentCustomer;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center">
        <Button variant="outline" onClick={handleBackClick} className="mr-4">
          <ArrowLeft className="mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Room {room.roomNumber} Details</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Home className="mr-2 text-blue-500" />
              Room Information
            </h2>
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
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Cleaned:</span>
                  <span className="font-medium">
                    {format(new Date(room.lastCleaned), "MMM dd, yyyy")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {customer && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <User className="mr-2 text-blue-500" />
                Current Guest
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">{customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium">{customer.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Check-in:</span>
                  <span className="font-medium">
                    {format(parseISO(customer.checkInDate), "MMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Check-out:</span>
                  <span className="font-medium">
                    {format(parseISO(customer.checkOutDate), "MMM dd, yyyy")}
                  </span>
                </div>
                {customer.depositAmount && customer.depositAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Deposit:</span>
                    <span className="font-medium text-green-600">${customer.depositAmount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetailsPage;
