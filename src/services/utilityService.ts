
import { supabase } from "@/integrations/supabase/client";

export const resetDatabase = async (): Promise<boolean> => {
  try {
    // Clear existing data - order matters due to foreign key constraints
    await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('rent_reminders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('daily_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cleaning_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Delete all existing rooms
    await supabase.from('rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Create initial rooms
    const initialRooms = [
      { roomnumber: '101', type: 'single', rate: 80, status: 'vacant' },
      { roomnumber: '102', type: 'single', rate: 80, status: 'vacant' },
      { roomnumber: '103', type: 'double', rate: 120, status: 'vacant' },
      { roomnumber: '201', type: 'double', rate: 120, status: 'vacant' },
      { roomnumber: '202', type: 'suite', rate: 200, status: 'vacant' },
      { roomnumber: '301', type: 'deluxe', rate: 250, status: 'vacant' }
    ];
    
    await supabase.from('rooms').insert(initialRooms);
    
    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    return false;
  }
};
