
import { supabase } from "@/integrations/supabase/client";
import { Customer, Room, Payment } from "@/types";
import { deleteCheckoutReminder } from "./reminders";

export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  
  return data.map(customer => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    idNumber: customer.idnumber,
    checkInDate: customer.checkindate,
    checkOutDate: customer.checkoutdate,
    roomId: customer.roomid,
    depositAmount: customer.depositamount,
    depositPaymentMethod: customer.depositpaymentmethod as "cash" | "card" | "bank_transfer" | "other",
    depositCollectedBy: customer.depositcollectedby,
    bankRefNo: customer.bankrefno,
    numberOfPersons: customer.numberofpersons || 1,
    hasGas: customer.hasgas || false,
    initialGasWeight: customer.initialgasweight
  }));
};

export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('roomnumber');
  
  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
  
  return data.map(room => ({
    id: room.id,
    roomNumber: room.roomnumber,
    type: room.type as 'single' | 'double' | 'suite' | 'deluxe',
    rate: room.rate,
    status: room.status as 'vacant' | 'occupied' | 'maintenance' | 'cleaning',
    lastCleaned: room.lastcleaned,
    cleanedBy: room.cleanedby,
    hasGas: room.hasgas || false
  }));
};

export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer | null> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        idnumber: customer.idNumber,
        checkindate: customer.checkInDate,
        checkoutdate: customer.checkOutDate,
        roomid: customer.roomId,
        depositamount: customer.depositAmount || 0,
        depositpaymentmethod: customer.depositPaymentMethod,
        depositcollectedby: customer.depositCollectedBy,
        bankrefno: customer.bankRefNo,
        numberofpersons: customer.numberOfPersons || 1,
        hasgas: customer.hasGas || false,
        initialgasweight: customer.initialGasWeight || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding customer:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      idNumber: data.idnumber,
      checkInDate: data.checkindate,
      checkOutDate: data.checkoutdate,
      roomId: data.roomid,
      depositAmount: data.depositamount,
      depositPaymentMethod: data.depositpaymentmethod as "cash" | "card" | "bank_transfer" | "other",
      depositCollectedBy: data.depositcollectedby,
      bankRefNo: data.bankrefno,
      numberOfPersons: data.numberofpersons || 1,
      hasGas: data.hasgas || false,
      initialGasWeight: data.initialgasweight || undefined
    };
  } catch (error) {
    console.error('Error in addCustomer:', error);
    return null;
  }
};

export const resetDatabase = async (): Promise<boolean> => {
  try {
    // Delete all records from customers table
    const { error: deleteCustomersError } = await supabase
      .from('customers')
      .delete()
      .neq('id', null); // Delete all records

    if (deleteCustomersError) {
      console.error('Error deleting customers:', deleteCustomersError);
      return false;
    }

    // Delete all records from payments table
    const { error: deletePaymentsError } = await supabase
      .from('payments')
      .delete()
      .neq('id', null); // Delete all records

    if (deletePaymentsError) {
      console.error('Error deleting payments:', deletePaymentsError);
      return false;
    }
    
    // Delete all records from rent_reminders table
    const { error: deleteRemindersError } = await supabase
      .from('rent_reminders')
      .delete()
      .neq('id', null); // Delete all records

    if (deleteRemindersError) {
      console.error('Error deleting rent reminders:', deleteRemindersError);
      return false;
    }

    // Reset rooms to initial state
    const { error: updateRoomsError } = await supabase
      .from('rooms')
      .update({ 
        status: 'vacant', 
        cleanedby: null, 
        lastcleaned: null, 
        hasgas: true 
      })
      .in('id', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);

    if (updateRoomsError) {
      console.error('Error updating rooms:', updateRoomsError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    return false;
  }
};

// Re-export functions from other services
export { deleteCheckoutReminder } from './reminders';
export { getDailyReports, getCheckoutReminders } from './reportsService';
export { loadCustomersForRooms } from './rooms';
export { updateRoom } from './rooms';
export { getPayments, addPayment } from './paymentsService';
export { generateDailyReport } from './reportsService';
export { processCheckout, processEarlyCheckout } from './rooms/roomCheckout';
