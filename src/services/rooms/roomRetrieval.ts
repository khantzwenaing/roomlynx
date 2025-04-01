
import { supabase } from "@/integrations/supabase/client";
import { Room, Customer } from "@/types";

export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*');
  
  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
  
  return data.map(room => ({
    id: room.id,
    roomNumber: room.roomnumber,
    type: room.type as 'single' | 'double' | 'suite' | 'deluxe',
    rate: Number(room.rate),
    status: room.status as 'vacant' | 'occupied' | 'maintenance' | 'cleaning',
    lastCleaned: room.lastcleaned,
    cleanedBy: room.cleanedby
  }));
};

export const getRoomDetails = async (roomId: string): Promise<Room | null> => {
  console.log(`Fetching details for room ID: ${roomId}`);
  
  try {
    // First, get the room data
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (roomError) {
      console.error('Error fetching room details:', roomError);
      return null;
    }
    
    console.log(`Room details retrieved, status: ${roomData.status}`);
    
    // Create the room object
    const room: Room = {
      id: roomData.id,
      roomNumber: roomData.roomnumber,
      type: roomData.type as 'single' | 'double' | 'suite' | 'deluxe',
      rate: Number(roomData.rate),
      status: roomData.status as 'vacant' | 'occupied' | 'maintenance' | 'cleaning',
      lastCleaned: roomData.lastcleaned,
      cleanedBy: roomData.cleanedby
    };
    
    // Get the customer for this room if it's occupied
    if (roomData.status === 'occupied') {
      console.log(`Room is occupied, fetching customer data...`);
      
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('roomid', roomId)
        .order('checkindate', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      console.log(`Customer query result:`, customerData ? "Found" : "Not found");
      
      if (!customerError && customerData) {
        console.log(`Customer found: ${customerData.name}`);
        const customer: Customer = {
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
          bankRefNo: customerData.bankrefno
        };
        
        room.currentCustomer = customer;
      } else if (customerError) {
        console.error('Error fetching customer for room:', customerError);
      } else {
        console.log(`No customer found for occupied room ${roomData.roomnumber}`);
      }
    }
    
    return room;
  } catch (error) {
    console.error('Unexpected error in getRoomDetails:', error);
    return null;
  }
};
