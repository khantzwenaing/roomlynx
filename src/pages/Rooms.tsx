
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddRoomForm from "@/components/AddRoomForm";
import RoomGrid from "@/components/rooms/RoomGrid";
import RoomFilters from "@/components/rooms/RoomFilters";
import { useRooms } from "@/hooks/useRooms";

const Rooms = () => {
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  const { 
    searchTerm, 
    setSearchTerm, 
    statusFilter, 
    setStatusFilter,
    filteredRooms,
    isLoading,
    loadRooms,
    roomCustomers,
  } = useRooms();

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
        onRoomClick={(room) => {
          window.location.href = `/room-details?roomId=${room.id}`;
        }}
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
