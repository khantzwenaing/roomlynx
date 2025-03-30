
import { useState, useEffect, useCallback } from "react";
import { getRooms, getRoomDetails } from "@/services/dataService";
import { Room, Customer } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roomCustomers, setRoomCustomers] = useState<{[key: string]: Customer | null}>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const roomsData = await getRooms();
      setRooms(roomsData);
    } catch (error) {
      console.error("Error loading rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load rooms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadCustomersForRooms = useCallback(async () => {
    try {
      const allRooms = await getRooms();
      const customerMap: {[key: string]: Customer | null} = {};
      
      for (const room of allRooms) {
        if (room.status === "occupied") {
          const details = await getRoomDetails(room.id);
          if (details && details.currentCustomer) {
            customerMap[room.id] = details.currentCustomer;
          } else {
            customerMap[room.id] = null;
          }
        }
      }
      
      setRoomCustomers(customerMap);
    } catch (error) {
      console.error("Error loading customers for rooms:", error);
    }
  }, []);

  useEffect(() => {
    loadRooms();
    loadCustomersForRooms();
  }, [loadRooms, loadCustomersForRooms]);

  const filteredRooms = rooms.filter((room) => {
    const roomNumber = room.roomNumber.toLowerCase();
    const roomType = room.type.toLowerCase();
    const roomRate = room.rate.toString();
    const roomStatus = room.status.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      roomNumber.includes(searchTermLower) || 
      roomType.includes(searchTermLower) || 
      roomRate.includes(searchTermLower) || 
      roomStatus.includes(searchTermLower);
      
    const matchesFilter = statusFilter === "all" || room.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return {
    rooms,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredRooms,
    loadRooms,
    loadCustomersForRooms,
    roomCustomers
  };
};
