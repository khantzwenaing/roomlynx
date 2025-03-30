
import { supabase } from "@/integrations/supabase/client";

export const resetDatabase = async (): Promise<boolean> => {
  try {
    // Clear existing data
    await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('daily_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cleaning_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Reset room statuses to vacant
    const { data: rooms } = await supabase.from('rooms').select('id');
    if (rooms) {
      for (const room of rooms) {
        await supabase
          .from('rooms')
          .update({ status: 'vacant' })
          .eq('id', room.id);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    return false;
  }
};
