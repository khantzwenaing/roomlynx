
import { supabase } from "@/integrations/supabase/client";
import { Room, Customer, RoomType, RoomStatus, PaymentMethod } from "@/types";

export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('roomnumber', { ascending: true }); // Sort rooms by room number in ascending order
  
  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
  
  // Transform data into Room objects
  return data.map(room => ({
    id: room.id,
    roomNumber: room.roomnumber,
    type: room.type as RoomType,
    rate: Number(room.rate),
    status: room.status as RoomStatus,
    lastCleaned: room.lastcleaned,
    cleanedBy: room.cleanedby,
    hasGas: room.hasgas || false
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
      type: roomData.type as RoomType,
      rate: Number(roomData.rate),
      status: roomData.status as RoomStatus,
      lastCleaned: roomData.lastcleaned,
      cleanedBy: roomData.cleanedby,
      hasGas: roomData.hasgas || false
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
          depositAmount: customerData.depositamount ? Number(customerData.depositamount) : 0,
          depositPaymentMethod: customerData.depositpaymentmethod as PaymentMethod,
          depositCollectedBy: customerData.depositcollectedby || '',
          bankRefNo: customerData.bankrefno || '',
          numberOfPersons: customerData.numberofpersons || 1,
          hasGas: customerData.hasgas || false,
          initialGasWeight: customerData.initialgasweight
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

export const getRoomWithCustomer = async (id: string): Promise<{ room: Room; customer: Customer | null } | null> => {
  try {
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (roomError) {
      console.error('Error fetching room:', roomError);
      return null;
    }

    const room: Room = {
      id: roomData.id,
      roomNumber: roomData.roomnumber,
      type: roomData.type as RoomType,
      rate: roomData.rate,
      status: roomData.status as RoomStatus,
      lastCleaned: roomData.lastcleaned,
      cleanedBy: roomData.cleanedby,
      hasGas: roomData.hasgas || false
    };

    // If room is occupied, fetch customer data
    if (room.status === 'occupied') {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('roomid', id)
        .single();

      if (customerError) {
        console.error('Error fetching customer for room:', customerError);
        return { room, customer: null };
      }

      const customer: Customer = {
        id: customerData.id,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        idNumber: customerData.idnumber,
        checkInDate: customerData.checkindate,
        checkOutDate: customerData.checkoutdate,
        roomId: customerData.roomid,
        depositAmount: customerData.depositamount,
        depositPaymentMethod: customerData.depositpaymentmethod as PaymentMethod,
        depositCollectedBy: customerData.depositcollectedby,
        bankRefNo: customerData.bankrefno,
        numberOfPersons: customerData.numberofpersons || 1,
        hasGas: customerData.hasgas || false,
        initialGasWeight: customerData.initialgasweight
      };

      return { room, customer };
    }

    return { room, customer: null };
  } catch (error) {
    console.error('Error in getRoomWithCustomer:', error);
    return null;
  }
};
