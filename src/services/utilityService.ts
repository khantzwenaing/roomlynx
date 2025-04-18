
import { supabase } from "@/integrations/supabase/client";

export const resetDatabase = async (): Promise<boolean> => {
  try {
    console.log("Starting database reset process...");
    
    // Clear existing data - order matters due to foreign key constraints
    console.log("Deleting payments...");
    await supabase.from('payments').delete().not('id', 'is', null);
    
    console.log("Deleting rent reminders...");
    await supabase.from('rent_reminders').delete().not('id', 'is', null);
    
    console.log("Deleting customers...");
    await supabase.from('customers').delete().not('id', 'is', null);
    
    console.log("Deleting daily reports...");
    await supabase.from('daily_reports').delete().not('id', 'is', null);
    
    console.log("Deleting cleaning records...");
    await supabase.from('cleaning_records').delete().not('id', 'is', null);
    
    console.log("Deleting rooms...");
    await supabase.from('rooms').delete().not('id', 'is', null);
    
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
