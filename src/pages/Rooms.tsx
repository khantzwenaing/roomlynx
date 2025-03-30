
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import AddRoomForm from "@/components/AddRoomForm";
import RoomGrid from "@/components/rooms/RoomGrid";
import RoomFilters from "@/components/rooms/RoomFilters";
import { useRooms } from "@/hooks/useRooms";
import AddCustomerSidebar from "@/components/customers/AddCustomerSidebar";
import { useSearchParams } from "react-router-dom";
import { resetDatabase } from "@/services/utilityService";
import { toast } from "sonner";

const Rooms = () => {
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);
  const [searchParams] = useSearchParams();
  const [isResetting, setIsResetting] = useState(false);

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

  // Check URL parameters for actions
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
    loadRooms();
    loadCustomersForRooms();
  };

  const handleResetDatabase = async () => {
    try {
      setIsResetting(true);
      toast.loading("Resetting database...");
      
      const success = await resetDatabase();
      
      if (success) {
        toast.success("Database reset successfully");
        // Force reload to ensure everything is refreshed
        window.location.reload();
      } else {
        toast.error("Failed to reset database");
      }
    } catch (error) {
      console.error("Error resetting database:", error);
      toast.error("An error occurred while resetting the database");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-3xl font-bold text-gray-800">Rooms</h1>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleResetDatabase} 
            variant="outline" 
            size="default"
            disabled={isResetting}
          >
            <RefreshCw className={`mr-2 ${isResetting ? 'animate-spin' : ''}`} size={18} />
            Reset Database
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
      
      {/* Keep this hidden sidebar for when needed, but don't show the button */}
      <AddCustomerSidebar
        rooms={filteredRooms.filter(room => room.status === 'vacant')}
        onCustomerAdded={(customer) => {
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
