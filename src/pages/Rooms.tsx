import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getRooms, loadCustomersForRooms } from "@/services/dataService";
import { Room } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AddRoomForm from "@/components/AddRoomForm";
import { Plus } from "lucide-react";
import RoomGrid from "@/components/rooms/RoomGrid";
import RoomDetailsSheet from "@/components/rooms/RoomDetailsSheet";
import RoomFilters from "@/components/rooms/RoomFilters";
import { useRooms } from "@/hooks/useRooms";

const Rooms = () => {
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomIdFromQuery = queryParams.get("roomId");
  const actionFromQuery = queryParams.get("action");

  const { 
    rooms, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    statusFilter, 
    setStatusFilter,
    filteredRooms,
    selectedRoom,
    setSelectedRoom,
    loadRooms,
    roomCustomers,
    isRoomDetailsOpen,
    setIsRoomDetailsOpen,
    handleViewRoomDetails
  } = useRooms();

  useEffect(() => {
    if (roomIdFromQuery) {
      const room = rooms.find(r => r.id === roomIdFromQuery);
      if (room) {
        setSelectedRoom(room);
        if (actionFromQuery === "checkout") {
          const handleCheckout = async () => {
            if (room.status === "occupied") {
              setIsRoomDetailsOpen(true);
            }
          };
          handleCheckout();
        } else {
          setIsRoomDetailsOpen(true);
        }
      }
    }
  }, [roomIdFromQuery, actionFromQuery, rooms, setSelectedRoom, setIsRoomDetailsOpen]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Rooms</h1>
        <Button onClick={() => setIsAddRoomOpen(true)} size="lg">
          <Plus className="mr-2" size={20} />
          Add New Room
        </Button>
      </div>

      <RoomFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <RoomGrid 
        rooms={filteredRooms}
        isLoading={isLoading}
        roomCustomers={roomCustomers}
        onRoomClick={handleViewRoomDetails}
      />

      <RoomDetailsSheet 
        isOpen={isRoomDetailsOpen}
        onOpenChange={setIsRoomDetailsOpen}
        selectedRoom={selectedRoom}
        roomCustomers={roomCustomers}
        onRoomUpdated={loadRooms}
      />

      <AddRoomForm 
        isOpen={isAddRoomOpen} 
        onClose={() => setIsAddRoomOpen(false)} 
        onRoomAdded={loadRooms} 
      />
    </div>
  );
};

export default Rooms;
