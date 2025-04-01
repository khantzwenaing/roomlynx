
import { useState } from "react";
import { Room } from "@/types";
import { updateRoom } from "@/services/dataService";
import { toast } from "sonner";

export const useRoomCleaning = (room: Room) => {
  const [cleanedBy, setCleanedBy] = useState("");

  const handleCleaningComplete = async (cleanerName: string) => {
    if (!cleanerName.trim()) {
      toast.error("Error", {
        description: "Please enter who cleaned the room"
      });
      return;
    }

    try {
      const updatedRoom = await updateRoom(room.id, {
        status: "vacant",
        lastCleaned: new Date().toISOString(),
        cleanedBy: cleanerName,
      });

      if (updatedRoom) {
        toast.success("Cleaning Completed", {
          description: `Room ${updatedRoom.roomNumber} has been marked as clean`
        });
        
        // Use a delay to ensure database updates complete before refreshing
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error("Failed to update room status");
      }
    } catch (error) {
      console.error("Error completing cleaning:", error);
      toast.error("Error", {
        description: "Failed to mark room as clean"
      });
    }
  };

  return { cleanedBy, setCleanedBy, handleCleaningComplete };
};
