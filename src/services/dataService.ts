
// Re-export all service functions from the modular services
export * from './roomsService';
export * from './customersService';
export * from './paymentsService';
export * from './reportsService';
export * from './utilityService';
export * from './remindersService';

// Helper function to load customers for rooms
export const loadCustomersForRooms = async () => {
  const { getRooms, getRoomDetails } = await import('./roomsService');
  
  try {
    const allRooms = await getRooms();
    const customerMap: {[key: string]: import('@/types').Customer | null} = {};
    
    console.log("loadCustomersForRooms: processing rooms");
    
    for (const room of allRooms) {
      console.log(`Processing room ${room.roomNumber}, status: ${room.status}`);
      
      if (room.status === "occupied") {
        console.log(`Fetching customer details for occupied room ${room.roomNumber}`);
        const details = await getRoomDetails(room.id);
        
        if (details && details.currentCustomer) {
          console.log(`Found customer ${details.currentCustomer.name} for room ${room.roomNumber}`);
          customerMap[room.id] = details.currentCustomer;
        } else {
          console.log(`No customer found for occupied room ${room.roomNumber}`);
          customerMap[room.id] = null;
        }
      } else {
        console.log(`Room ${room.roomNumber} is not occupied, skipping customer lookup`);
      }
    }
    
    console.log(`Finished processing, found customers for ${Object.values(customerMap).filter(Boolean).length} rooms`);
    return customerMap;
  } catch (error) {
    console.error("Error loading customers for rooms:", error);
    return {};
  }
};
