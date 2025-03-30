
import { supabase } from "@/integrations/supabase/client";
import { Room, Customer, Payment, DailyReport, CleaningRecord } from "@/types";
import { v4 as uuidv4 } from 'uuid';

// Room functions
export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*');
  
  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
  
  return data as Room[];
};

export const getRoomDetails = async (roomId: string): Promise<Room | null> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();
  
  if (error) {
    console.error('Error fetching room details:', error);
    return null;
  }
  
  return data as Room;
};

export const updateRoom = async (id: string, updates: Partial<Room>): Promise<Room | null> => {
  const { data, error } = await supabase
    .from('rooms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating room:', error);
    return null;
  }
  
  return data as Room;
};

export const addRoom = async (room: Omit<Room, "id">): Promise<Room | null> => {
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      ...room,
      id: uuidv4()
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding room:', error);
    return null;
  }
  
  return data as Room;
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

// Similar pattern for other data types (Customers, Payments, etc.)
export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*');
  
  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  
  return data as Customer[];
};

export const getPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*');
  
  if (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
  
  return data as Payment[];
};

export const getDailyReports = async (): Promise<DailyReport[]> => {
  const { data, error } = await supabase
    .from('daily_reports')
    .select('*');
  
  if (error) {
    console.error('Error fetching daily reports:', error);
    return [];
  }
  
  return data as DailyReport[];
};

export const getCleaningRecords = async (): Promise<CleaningRecord[]> => {
  const { data, error } = await supabase
    .from('cleaning_records')
    .select('*');
  
  if (error) {
    console.error('Error fetching cleaning records:', error);
    return [];
  }
  
  return data as CleaningRecord[];
};

// Reset database functionality no longer needed with real Supabase backend
