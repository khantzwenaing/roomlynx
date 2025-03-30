
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
  
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();
  
  if (error) {
    console.error('Error fetching room details:', error);
    return null;
  }
  
  console.log(`Room details retrieved, status: ${data.status}`);
  
  // Get the customer for this room if it's occupied
  let currentCustomer = null;
  if (data.status === 'occupied') {
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
      currentCustomer = {
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
    } else if (customerError) {
      console.error('Error fetching customer for room:', customerError);
    } else {
      console.log(`No customer found for occupied room ${data.roomnumber}`);
    }
  }
  
  return {
    id: data.id,
    roomNumber: data.roomnumber,
    type: data.type as 'single' | 'double' | 'suite' | 'deluxe',
    rate: Number(data.rate),
    status: data.status as 'vacant' | 'occupied' | 'maintenance' | 'cleaning',
    lastCleaned: data.lastcleaned,
    cleanedBy: data.cleanedby,
    currentCustomer
  };
};

export const updateRoom = async (id: string, updates: Partial<Room>): Promise<Room | null> => {
  // Transform the updates to match database column names
  const dbUpdates: any = {};
  
  if (updates.roomNumber) dbUpdates.roomnumber = updates.roomNumber;
  if (updates.type) dbUpdates.type = updates.type;
  if (updates.rate) dbUpdates.rate = updates.rate;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.lastCleaned) dbUpdates.lastcleaned = updates.lastCleaned;
  if (updates.cleanedBy) dbUpdates.cleanedby = updates.cleanedBy;
  
  const { data, error } = await supabase
    .from('rooms')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating room:', error);
    return null;
  }
  
  return {
    id: data.id,
    roomNumber: data.roomnumber,
    type: data.type as 'single' | 'double' | 'suite' | 'deluxe',
    rate: Number(data.rate),
    status: data.status as 'vacant' | 'occupied' | 'maintenance' | 'cleaning',
    lastCleaned: data.lastcleaned,
    cleanedBy: data.cleanedby
  };
};

export const addRoom = async (room: Omit<Room, "id">): Promise<Room | null> => {
  const newRoom = {
    roomnumber: room.roomNumber,
    type: room.type,
    rate: room.rate,
    status: room.status,
    lastcleaned: room.lastCleaned,
    cleanedby: room.cleanedBy
  };
  
  const { data, error } = await supabase
    .from('rooms')
    .insert(newRoom)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding room:', error);
    return null;
  }
  
  return {
    id: data.id,
    roomNumber: data.roomnumber,
    type: data.type as 'single' | 'double' | 'suite' | 'deluxe',
    rate: Number(data.rate),
    status: data.status as 'vacant' | 'occupied' | 'maintenance' | 'cleaning',
    lastCleaned: data.lastcleaned,
    cleanedBy: data.cleanedby
  };
};

export const deleteRoom = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting room:', error);
    return false;
  }
  
  return true;
};
