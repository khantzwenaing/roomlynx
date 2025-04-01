import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import AddRoomForm from "@/components/AddRoomForm";
import RoomGrid from "@/components/rooms/RoomGrid";
import RoomFilters from "@/components/rooms/RoomFilters";
import { useRooms } from "@/hooks/useRooms";
import AddCustomerSidebar from "@/components/customers/AddCustomerSidebar";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Room } from "@/types";

const Rooms = () => {
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);
  const [searchParams] = useSearchParams();
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    refreshData
  } = useRooms();

  useEffect(() => {
    const roomId = searchParams.get('roomId');
    const action = searchParams.get('action');
    
    if (roomId) {
      setSelectedRoomId(roomId);
      if (action === 'checkout') {
        // Handle checkout action if needed
      }
    }
  }, [searchParams]);

  const handleDataRefresh = () => {
    setIsRefreshing(true);
    console.log("Triggering full data refresh...");
    
    refreshData().finally(() => {
      setIsRefreshing(false);
      console.log("Data refresh complete");
    });
  };

  useEffect(() => {
    handleDataRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoomClick = (room: Room) => {
    window.location.href = `/room-details?roomId=${room.id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-3xl font-bold text-gray-800">Rooms</h1>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleDataRefresh} 
            variant="outline" 
            size="default"
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} size={18} />
            Refresh Data
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
        onRoomClick={handleRoomClick}
        onCustomerAdded={handleDataRefresh}
      />

      <AddRoomForm 
        isOpen={isAddRoomOpen} 
        onClose={() => setIsAddRoomOpen(false)} 
        onRoomAdded={() => {
          loadRooms();
          setIsAddRoomOpen(false);
        }} 
      />
      
      <AddCustomerSidebar
        rooms={filteredRooms.filter(room => room.status === 'vacant')}
        onCustomerAdded={(customer) => {
          console.log("Customer added from sidebar:", customer);
          setTimeout(handleDataRefresh, 1000);
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
