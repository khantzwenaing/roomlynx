
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
    
    // No longer creating initial rooms
    
    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    return false;
  }
};
