
import { useState } from "react";
import { Room } from "@/types";
import { deleteRoom } from "@/services/rooms/roomDeletion";
import { toast } from "sonner";

export const useRoomDeletion = (room: Room) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteRoom = async () => {
    if (!room || !room.id) {
      toast.error("Cannot Delete Room", {
        description: "Room ID is missing"
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    if (room.status === 'occupied') {
      toast.error("Cannot Delete Room", {
        description: "This room is currently occupied. Check out the guest first."
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      setIsDeleting(true);
      console.log(`Attempting to delete room with ID: ${room.id}`);
      const success = await deleteRoom(room.id);
      
      if (success) {
        toast.success("Room Deleted", {
          description: `Room ${room.roomNumber} has been removed`
        });
        // Reload the page to refresh the room list
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error("Error", {
          description: "Failed to delete the room. It may have associated customers or payments."
        });
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Error", {
        description: "An unexpected error occurred while deleting the room"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return { 
    isDeleteDialogOpen, 
    setIsDeleteDialogOpen, 
    handleDeleteRoom,
    isDeleting 
  };
};
