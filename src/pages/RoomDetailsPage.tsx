
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getRoomDetails, updateRoom } from "@/services/rooms";
import { Room } from "@/types";
import { toast } from "sonner";
import RoomHeader from "@/components/room-details/RoomHeader";
import RoomInformation from "@/components/room-details/RoomInformation";
import GuestSection from "@/components/room-details/GuestSection";
import LoadingState from "@/components/room-details/LoadingState";
import NotFoundState from "@/components/room-details/NotFoundState";

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
    fetchRoomDetails();
  }, [roomId]);

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

  const handleRefreshData = async () => {
    await fetchRoomDetails();
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!room) {
    return <NotFoundState onBackClick={handleBackClick} />;
  }

  return (
    <div className="container mx-auto p-6">
      <RoomHeader 
        roomNumber={room.roomNumber}
        isEditing={isEditing}
        onBackClick={handleBackClick}
        onEditClick={handleEdit}
        onRefreshData={handleRefreshData}
        onSave={handleSave}
        onCancelEdit={handleCancelEdit}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <RoomInformation 
            room={room}
            isEditing={isEditing}
            editedRoom={editedRoom}
            setEditedRoom={setEditedRoom}
          />
        </div>

        <GuestSection 
          room={room}
          customer={room.currentCustomer || null}
          onRefreshData={handleRefreshData}
        />
      </div>
    </div>
  );
};

export default RoomDetailsPage;
