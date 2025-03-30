
import { supabase } from "@/integrations/supabase/client";
import { RentReminder } from "@/types";

// Get all checkout reminders
export const getCheckoutReminders = async (): Promise<RentReminder[]> => {
  try {
    const { data, error } = await supabase
      .from("rent_reminders")
      .select("*");
    
    if (error) {
      console.error("Error fetching checkout reminders:", error);
      return [];
    }
    
    return data.map(reminder => ({
      id: reminder.id,
      roomId: reminder.roomid,
      customerId: reminder.customerid,
      checkOutDate: reminder.checkoutdate,
      reminderDate: reminder.reminderdate,
      status: reminder.status as "pending" | "sent" | "acknowledged",
    }));
  } catch (error) {
    console.error("Error in getCheckoutReminders:", error);
    return [];
  }
};

// Get pending checkout reminders
export const getPendingReminders = async (): Promise<RentReminder[]> => {
  try {
    const today = new Date();
    
    const { data, error } = await supabase
      .from("rent_reminders")
      .select("*")
      .eq("status", "pending")
      .lte("reminderdate", today.toISOString());
    
    if (error) {
      console.error("Error fetching pending reminders:", error);
      return [];
    }
    
    return data.map(reminder => ({
      id: reminder.id,
      roomId: reminder.roomid,
      customerId: reminder.customerid,
      checkOutDate: reminder.checkoutdate,
      reminderDate: reminder.reminderdate,
      status: reminder.status as "pending" | "sent" | "acknowledged",
    }));
  } catch (error) {
    console.error("Error in getPendingReminders:", error);
    return [];
  }
};
