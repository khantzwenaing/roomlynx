
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
