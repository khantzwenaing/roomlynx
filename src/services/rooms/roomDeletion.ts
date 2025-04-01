
import { supabase } from "@/integrations/supabase/client";

export const deleteRoom = async (id: string): Promise<boolean> => {
  console.log(`Attempting to delete room with ID: ${id}`);
  
  if (!id) {
    console.error('Error deleting room: Room ID is missing');
    return false;
  }
  
  try {
    // First, check if there are any customers associated with this room
    const { data: customers, error: customerCheckError } = await supabase
      .from('customers')
      .select('id')
      .eq('roomid', id);
    
    if (customerCheckError) {
      console.error('Error checking for customers associated with room:', customerCheckError);
      return false;
    }
    
    if (customers && customers.length > 0) {
      console.error('Cannot delete room: Room has associated customers');
      return false;
    }
    
    // Now that we've confirmed there are no customers, we can delete the room
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
