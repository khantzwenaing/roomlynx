
import { supabase } from "@/integrations/supabase/client";
import { RentReminder } from "@/types";

// Create a reminder for a checkout
export const createCheckoutReminder = async (
  roomId: string,
  customerId: string,
  checkoutDate: string
): Promise<RentReminder | null> => {
  try {
    // Calculate reminder date (1 day before checkout)
    const checkoutDateTime = new Date(checkoutDate);
    const reminderDateTime = new Date(checkoutDateTime);
    reminderDateTime.setDate(reminderDateTime.getDate() - 1);
    
    const { data, error } = await supabase
      .from("rent_reminders")
      .insert({
        roomid: roomId,
        customerid: customerId,
        checkoutdate: checkoutDateTime.toISOString(),
        reminderdate: reminderDateTime.toISOString(),
        status: "pending"
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating checkout reminder:", error);
      return null;
    }
    
    return {
      id: data.id,
      roomId: data.roomid,
      customerId: data.customerid,
      checkOutDate: data.checkoutdate,
      reminderDate: data.reminderdate,
      status: data.status as "pending" | "sent" | "acknowledged",
    };
  } catch (error) {
    console.error("Error in createCheckoutReminder:", error);
    return null;
  }
};

// Delete a checkout reminder
export const deleteCheckoutReminder = async (customerId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("rent_reminders")
      .delete()
      .eq("customerid", customerId);
    
    if (error) {
      console.error("Error deleting checkout reminder:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteCheckoutReminder:", error);
    return false;
  }
};

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
