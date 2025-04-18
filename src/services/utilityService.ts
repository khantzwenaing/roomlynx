
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    
    // Reset rooms to vacant status instead of deleting them
    // Fix: Update the field names to match the database schema (lowercase)
    console.log("Resetting rooms to vacant status...");
    const { error: roomResetError } = await supabase
      .from('rooms')
      .update({ 
        status: 'vacant',
        lastcleaned: null,  // Changed from lastCleaned to lastcleaned
        cleanedby: null     // Changed from cleanedBy to cleanedby
      })
      .not('id', 'is', null);
      
    if (roomResetError) {
      console.error('Error resetting rooms:', roomResetError);
      return false;
    }
    
    // Verification step
    const { data: roomsCount } = await supabase.from('rooms').select('count');
    const { data: customersCount } = await supabase.from('customers').select('count');
    const { data: paymentsCount } = await supabase.from('payments').select('count');
    
    console.log("Database reset completed successfully");
    console.log("Rooms count:", roomsCount);
    console.log("Customers count:", customersCount);
    console.log("Payments count:", paymentsCount);
    
    toast("Database has been reset successfully");
    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    toast.error("Failed to reset database: " + (error as Error).message);
    return false;
  }
};
