
import { supabase } from "@/integrations/supabase/client";

export const resetDatabase = async (): Promise<boolean> => {
  try {
    console.log("Starting database reset process...");
    
    // Clear existing data - order matters due to foreign key constraints
    console.log("Deleting payments...");
    await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log("Deleting rent reminders...");
    await supabase.from('rent_reminders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log("Deleting customers...");
    await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log("Deleting daily reports...");
    await supabase.from('daily_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log("Deleting cleaning records...");
    await supabase.from('cleaning_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log("Deleting rooms...");
    await supabase.from('rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Verification step
    const { data: remainingRooms } = await supabase.from('rooms').select('count');
    const { data: remainingCustomers } = await supabase.from('customers').select('count');
    
    console.log("Database reset completed successfully");
    console.log("Remaining rooms:", remainingRooms);
    console.log("Remaining customers:", remainingCustomers);
    
    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    return false;
  }
};
