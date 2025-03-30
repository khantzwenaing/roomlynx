
import { supabase } from "@/integrations/supabase/client";

// Mark a reminder as sent
export const markReminderAsSent = async (reminderId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("rent_reminders")
      .update({ status: "sent" })
      .eq("id", reminderId);
    
    if (error) {
      console.error("Error marking reminder as sent:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in markReminderAsSent:", error);
    return false;
  }
};
