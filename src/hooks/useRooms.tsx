
import { useState, useEffect, useCallback } from "react";
import { getRooms, loadCustomersForRooms as fetchRoomCustomers } from "@/services/dataService";
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
      console.log("Loading rooms data...");
      const roomsData = await getRooms();
      console.log("Loaded rooms:", roomsData.length);
      console.log("Room statuses:", roomsData.map(r => `${r.roomNumber}: ${r.status}`).join(', '));
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
      console.log("Loading customer data for rooms...");
      const customerMap = await fetchRoomCustomers();
      console.log("Loaded customers map:", Object.keys(customerMap).length);
      
      // Debug the customer data
      Object.entries(customerMap).forEach(([roomId, customer]) => {
        if (customer) {
          console.log(`Room ${roomId} has customer: ${customer.name}`);
        } else {
          console.log(`Room ${roomId} has no customer`);
        }
      });
      
      setRoomCustomers(customerMap);
    } catch (error) {
      console.error("Error loading customers for rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load customer information.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const filteredRooms = rooms.filter((room) => {
    const roomNumber = room.roomNumber.toLowerCase();
    const roomType = room.type.toLowerCase();
    const roomRate = room.rate.toString();
    const roomStatus = room.status.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    // Basic room property matching
    const matchesRoomProperties = 
      roomNumber.includes(searchTermLower) || 
      roomType.includes(searchTermLower) || 
      roomRate.includes(searchTermLower) || 
      roomStatus.includes(searchTermLower);
    
    // Customer matching (for occupied rooms)
    let matchesCustomer = false;
    if (room.status === "occupied" && roomCustomers[room.id]) {
      const customer = roomCustomers[room.id];
      if (customer) {
        const customerName = customer.name.toLowerCase();
        const customerPhone = customer.phone.toLowerCase();
        
        matchesCustomer = 
          customerName.includes(searchTermLower) || 
          customerPhone.includes(searchTermLower);
      }
    }
      
    const matchesSearch = matchesRoomProperties || matchesCustomer;
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
