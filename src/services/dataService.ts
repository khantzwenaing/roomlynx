
// Re-export all service functions from the modular services
export * from './rooms';
export * from './customersService';
export * from './paymentsService';
export * from './reportsService';
export * from './utilityService';
export * from './remindersService';

// Helper function to load customers for rooms
export const loadCustomersForRooms = async () => {
  const { getRooms } = await import('./roomsService');
  
  try {
    const allRooms = await getRooms();
    const customerMap: {[key: string]: import('@/types').Customer | null} = {};
    
    console.log("loadCustomersForRooms: processing rooms");
    
    // Get customers for occupied rooms
    for (const room of allRooms) {
      console.log(`Processing room ${room.roomNumber}, status: ${room.status}`);
      
      if (room.status === "occupied") {
        console.log(`Fetching customer details for occupied room ${room.roomNumber}`);
        try {
          // Get customer information
          const { data: customers, error } = await import('@/integrations/supabase/client').then(
            module => module.supabase
              .from('customers')
              .select('*')
              .eq('roomid', room.id)
              .order('checkindate', { ascending: false })
              .limit(1)
          );
          
          if (error) {
            console.error(`Error fetching customer for room ${room.roomNumber}:`, error);
            customerMap[room.id] = null;
            continue;
          }
          
          if (customers && customers.length > 0) {
            const customerData = customers[0];
            const customer: import('@/types').Customer = {
              id: customerData.id,
              name: customerData.name,
              email: customerData.email || '',
              phone: customerData.phone,
              address: customerData.address || '',
              idNumber: customerData.idnumber || '',
              checkInDate: customerData.checkindate,
              checkOutDate: customerData.checkoutdate,
              roomId: customerData.roomid,
              depositAmount: customerData.depositamount ? Number(customerData.depositamount) : undefined,
              depositPaymentMethod: customerData.depositpaymentmethod as 'cash' | 'card' | 'bank_transfer' | 'other' | undefined,
              depositCollectedBy: customerData.depositcollectedby,
              bankRefNo: customerData.bankrefno
            };
            
            console.log(`Found customer ${customer.name} for room ${room.roomNumber}`);
            customerMap[room.id] = customer;
          } else {
            console.log(`No customer found for occupied room ${room.roomNumber}`);
            customerMap[room.id] = null;
            
            // Room is marked as occupied but has no customer - this is an inconsistency
            // Consider updating the room status to vacant
            console.warn(`Room ${room.roomNumber} is marked as occupied but has no customer. Consider fixing this inconsistency.`);
          }
        } catch (detailsError) {
          console.error(`Error fetching details for room ${room.roomNumber}:`, detailsError);
          customerMap[room.id] = null;
        }
      } else {
        console.log(`Room ${room.roomNumber} is not occupied, skipping customer lookup`);
        customerMap[room.id] = null;
      }
    }
    
    console.log(`Finished processing, found customers for ${Object.values(customerMap).filter(Boolean).length} rooms`);
    return customerMap;
  } catch (error) {
    console.error("Error loading customers for rooms:", error);
    return {};
  }
};
