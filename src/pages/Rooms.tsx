
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
    setIsRefreshing(true);
    console.log("Triggering data refresh...");
    
    // Perform room data refresh
    loadRooms();
    
    // Make sure to refresh customer data for rooms with a delay
    // to ensure database updates are completed
    setTimeout(() => {
      console.log("Loading customers after delay...");
      loadCustomersForRooms();
      setIsRefreshing(false);
    }, 1500);
  };

  const handleResetDatabase = async () => {
    try {
      setIsResetting(true);
      toast.loading("Resetting database...");
      console.log("Starting database reset...");
      
      const success = await resetDatabase();
      
      if (success) {
        console.log("Database reset successful, refreshing data...");
        toast.success("Database reset successfully");
        
        // Force data refresh after a short delay to ensure the database operations complete
        setTimeout(() => {
          handleDataRefresh();
          setIsResetting(false);
        }, 1500);
      } else {
        console.error("Database reset failed");
        toast.error("Failed to reset database");
        setIsResetting(false);
      }
    } catch (error) {
      console.error("Error resetting database:", error);
      toast.error("An error occurred while resetting the database");
      setIsResetting(false);
    }
  };

  // Automatic refresh when loading the page
  useEffect(() => {
    handleDataRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        onRoomAdded={() => {
          loadRooms();
          setIsAddRoomOpen(false);
        }} 
      />
      
      {/* Keep this hidden sidebar for when needed, but don't show the button */}
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
