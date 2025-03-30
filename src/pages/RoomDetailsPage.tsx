
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getRoomDetails, updateRoom } from "@/services/roomsService";
import { Room, Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { User, Phone, Home, Calendar, ArrowLeft, Pencil, Save, Brush } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import RoomEditForm from "@/components/room-details/RoomEditForm";

const RoomDetailsPage = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoom, setEditedRoom] = useState<Partial<Room>>({});
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
        console.log(`RoomDetailsPage: Fetching details for room ID: ${roomId}`);
        const roomData = await getRoomDetails(roomId);
        console.log("RoomDetailsPage: Room data received:", roomData);
        console.log("RoomDetailsPage: Customer data:", roomData?.currentCustomer);
        
        setRoom(roomData);
        setEditedRoom({
          roomNumber: roomData?.roomNumber,
          type: roomData?.type,
          rate: roomData?.rate,
        });
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!room || !roomId) return;
    
    try {
      const updated = await updateRoom(roomId, editedRoom);
      if (updated) {
        setRoom({
          ...room,
          ...updated
        });
        toast.success("Room details updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error("Failed to update room details");
    }
  };

  const handleCancelEdit = () => {
    // Reset to original values
    if (room) {
      setEditedRoom({
        roomNumber: room.roomNumber,
        type: room.type,
        rate: room.rate,
      });
    }
    setIsEditing(false);
  };

  // For the refresh button
  const handleRefreshData = async () => {
    if (!roomId) return;
    
    setLoading(true);
    try {
      console.log(`RoomDetailsPage: Refreshing data for room ID: ${roomId}`);
      const refreshedRoomData = await getRoomDetails(roomId);
      console.log("RoomDetailsPage: Refreshed room data:", refreshedRoomData);
      console.log("RoomDetailsPage: Refreshed customer data:", refreshedRoomData?.currentCustomer);
      
      setRoom(refreshedRoomData);
    } catch (error) {
      console.error("Error refreshing room details:", error);
      toast.error("Failed to refresh room details");
    } finally {
      setLoading(false);
    }
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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" onClick={handleBackClick} className="mr-4">
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Room {room.roomNumber} Details</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefreshData} variant="outline" className="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
              <path d="M3 22v-6h6"></path>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
            </svg>
            Refresh
          </Button>
          {!isEditing ? (
            <Button onClick={handleEdit} variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Room
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancelEdit} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
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
        </div>

        {customer ? (
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
        ) : room.status === "occupied" ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <User className="mr-2 text-blue-500" />
                Current Guest
              </h2>
              <div className="p-8 flex flex-col items-center justify-center">
                <p className="text-amber-600 mb-4">
                  The room is marked as occupied, but no customer data was found.
                </p>
                <Button onClick={handleRefreshData} variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2v6h-6"></path>
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                    <path d="M3 22v-6h6"></path>
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                  </svg>
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RoomDetailsPage;
