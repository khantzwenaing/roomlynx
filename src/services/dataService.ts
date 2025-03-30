
// Re-export all service functions from the modular services
export * from './roomsService';
export * from './customersService';
export * from './paymentsService';
export * from './reportsService';
export * from './utilityService';

// Helper function to load customers for rooms
export const loadCustomersForRooms = async () => {
  const { getRooms, getRoomDetails } = await import('./roomsService');
  
  try {
    const allRooms = await getRooms();
    const customerMap: {[key: string]: import('@/types').Customer | null} = {};
    
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
    
    return customerMap;
  } catch (error) {
    console.error("Error loading customers for rooms:", error);
    return {};
  }
};
