
import { supabase } from "@/integrations/supabase/client";

export const deleteRoom = async (id: string): Promise<boolean> => {
  console.log(`Attempting to delete room with ID: ${id}`);
  
  if (!id) {
    console.error('Error deleting room: Room ID is missing');
    return false;
  }
  
  try {
    // First, check if there are any active customers associated with this room
    // Active customers are those who have a roomid that matches this room's id
    const { data: activeCustomers, error: customerCheckError } = await supabase
      .from('customers')
      .select('id')
      .eq('roomid', id);
    
    if (customerCheckError) {
      console.error('Error checking for customers associated with room:', customerCheckError);
      return false;
    }
    
    if (activeCustomers && activeCustomers.length > 0) {
      console.error('Cannot delete room: Room has associated customers');
      return false;
    }
    
    // Check for pending payments associated with this room
    const { data: pendingPayments, error: paymentsCheckError } = await supabase
      .from('payments')
      .select('id')
      .eq('roomid', id)
      .eq('status', 'pending');
    
    if (paymentsCheckError) {
      console.error('Error checking for payments associated with room:', paymentsCheckError);
      return false;
    }
    
    if (pendingPayments && pendingPayments.length > 0) {
      console.error('Cannot delete room: Room has pending payments');
      return false;
    }
    
    // Now that we've confirmed there are no active customers or pending payments, we can delete the room
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting room:', error);
      return false;
    }
    
    console.log(`Successfully deleted room with ID: ${id}`);
    return true;
  } catch (error) {
    console.error('Unexpected error during room deletion:', error);
    return false;
  }
};
