
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
import AddRoomForm from "@/components/AddRoomForm";
import RoomGrid from "@/components/rooms/RoomGrid";
import RoomFilters from "@/components/rooms/RoomFilters";
import { useRooms } from "@/hooks/useRooms";
import AddCustomerSidebar from "@/components/customers/AddCustomerSidebar";

const Rooms = () => {
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);

  const { 
    searchTerm, 
    setSearchTerm, 
    statusFilter, 
    setStatusFilter,
    filteredRooms,
    isLoading,
    loadRooms,
    loadCustomersForRooms,
    roomCustomers,
  } = useRooms();

  const handleAddCustomer = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleDataRefresh = () => {
    loadRooms();
    loadCustomersForRooms();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-3xl font-bold text-gray-800">Rooms</h1>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAddCustomerOpen(true)} 
            variant="outline"
            size="default"
          >
            <UserPlus className="mr-2" size={18} />
            Add Customer
          </Button>
          
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
        onCustomerAdded={handleDataRefresh}
      />

      <AddRoomForm 
        isOpen={isAddRoomOpen} 
        onClose={() => setIsAddRoomOpen(false)} 
        onRoomAdded={loadRooms} 
      />
      
      <AddCustomerSidebar
        rooms={filteredRooms.filter(room => room.status === 'vacant')}
        onCustomerAdded={() => {
          handleDataRefresh();
          setIsAddCustomerOpen(false);
        }}
        preselectedRoomId={selectedRoomId}
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
      />
    </div>
  );
};

export default Rooms;
