
import { supabase } from "@/integrations/supabase/client";
import { Customer, Room } from "@/types";

/**
 * Loads customer data for all occupied rooms
 * @returns A map of room IDs to customer data
 */
export const loadCustomersForRooms = async (): Promise<{[key: string]: Customer | null}> => {
  try {
    console.log('Loading customers for rooms...');

    // Get all rooms first
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*');
    
    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return {};
    }

    // Filter for occupied rooms only
    const occupiedRooms = rooms.filter(room => room.status === 'occupied');
    
    if (occupiedRooms.length === 0) {
      console.log('No occupied rooms found');
      return {};
    }

    const occupiedRoomIds = occupiedRooms.map(room => room.id);
    
    // Fetch all customers for these rooms
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .in('roomid', occupiedRoomIds);
    
    if (customersError) {
      console.error('Error fetching customers for rooms:', customersError);
      return {};
    }

    // Create a mapping of roomId -> customer
    const customerMap: {[key: string]: Customer | null} = {};
    
    // Initialize all occupied rooms with null (in case no customer found)
    occupiedRoomIds.forEach(roomId => {
      customerMap[roomId] = null;
    });
    
    // Map customers to their rooms
    customers.forEach(customer => {
      if (customer.roomid) {
        customerMap[customer.roomid] = {
          id: customer.id,
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone,
          address: customer.address || '',
          idNumber: customer.idnumber || '',
          checkInDate: customer.checkindate,
          checkOutDate: customer.checkoutdate,
          roomId: customer.roomid,
          depositAmount: customer.depositamount || 0,
          depositPaymentMethod: customer.depositpaymentmethod as "cash" | "card" | "bank_transfer" | "other",
          depositCollectedBy: customer.depositcollectedby,
          bankRefNo: customer.bankrefno,
          numberOfPersons: customer.numberofpersons || 1,
          hasGas: customer.hasgas || false,
          initialGasWeight: customer.initialgasweight
        };
      }
    });
    
    return customerMap;
  } catch (error) {
    console.error('Error in loadCustomersForRooms:', error);
    return {};
  }
};
