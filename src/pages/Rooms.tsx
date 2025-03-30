
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddRoomForm from "@/components/AddRoomForm";
import RoomGrid from "@/components/rooms/RoomGrid";
import RoomFilters from "@/components/rooms/RoomFilters";
import { useRooms } from "@/hooks/useRooms";
import AddCustomerSidebar from "@/components/customers/AddCustomerSidebar";

const Rooms = () => {
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);

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

  const handleAddCustomer = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-3xl font-bold text-gray-800">Rooms</h1>
        
        <div className="flex gap-2">
          <AddCustomerSidebar 
            rooms={filteredRooms}
            onCustomerAdded={() => loadRooms()}
            preselectedRoomId={selectedRoomId}
            triggerClassName="bg-blue-600 hover:bg-blue-700"
          />
          
          <Button onClick={() => setIsAddRoomOpen(true)} size="default">
            <Plus className="mr-2" size={18} />
            Add New Room
          </Button>
        </div>
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
