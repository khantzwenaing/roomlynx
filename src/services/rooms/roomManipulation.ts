
import { supabase } from "@/integrations/supabase/client";
import { Room } from "@/types";

export const updateRoom = async (id: string, updates: Partial<Room>): Promise<Room | null> => {
  // Transform the updates to match database column names
  const dbUpdates: any = {};
  
  if (updates.roomNumber) dbUpdates.roomnumber = updates.roomNumber;
  if (updates.type) dbUpdates.type = updates.type;
  if (updates.rate) dbUpdates.rate = updates.rate;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.lastCleaned) dbUpdates.lastcleaned = updates.lastCleaned;
  if (updates.cleanedBy) dbUpdates.cleanedby = updates.cleanedBy;
  if (typeof updates.hasGas !== 'undefined') dbUpdates.hasgas = updates.hasGas;
  
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
    cleanedBy: data.cleanedby,
    hasGas: data.hasgas || false
  };
};

export const addRoom = async (room: Omit<Room, "id">): Promise<Room | null> => {
  const newRoom = {
    roomnumber: room.roomNumber,
    type: room.type,
    rate: room.rate,
    status: room.status,
    lastcleaned: room.lastCleaned,
    cleanedby: room.cleanedBy,
    hasgas: room.hasGas
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
    cleanedBy: data.cleanedby,
    hasGas: data.hasgas || false
  };
};
