import { supabase } from "@/integrations/supabase/client";
import { Customer, Room, Payment, PaymentStatus, PaymentMethod } from "@/types";

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

export const addPayment = async (payment: Omit<Payment, "id">): Promise<Payment | null> => {
  let paymentType = payment.paymentType || 'checkout';
  let notes = payment.notes || '';
  
  if (!notes.toLowerCase().includes(paymentType.toLowerCase())) {
    notes = `${paymentType}: ${notes}`.trim();
  }
  
  const newPayment = {
    customerid: payment.customerId,
    roomid: payment.roomId,
    amount: payment.amount,
    date: payment.date,
    method: payment.method,
    collectedby: payment.collectedBy,
    status: payment.status,
    notes: notes,
    isrefund: payment.isRefund || false,
    gasusagecharge: payment.gasUsageCharge || 0,
    extrapersonscharge: payment.extraPersonsCharge || 0
  };
  
  const { data, error } = await supabase
    .from('payments')
    .insert(newPayment)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding payment:', error);
    return null;
  }
  
  return {
    id: data.id,
    customerId: data.customerid,
    roomId: data.roomid,
    amount: Number(data.amount),
    date: data.date,
    method: data.method as 'cash' | 'bank_transfer' | 'other',
    collectedBy: data.collectedby,
    status: data.status as PaymentStatus,
    notes: data.notes || '',
    paymentType: data.notes?.toLowerCase().includes('deposit') ? 'deposit' : 
                data.notes?.toLowerCase().includes('refund') || data.isrefund ? 'refund' : 'checkout',
    isRefund: data.isrefund || false,
    gasUsageCharge: data.gasusagecharge,
    extraPersonsCharge: data.extrapersonscharge
  };
};

export const processEarlyCheckout = async (
  roomId: string, 
  customerId: string, 
  actualCheckoutDate: string, 
  refundAmount: number,
  refundDetails: {
    method: 'cash' | 'bank_transfer' | 'other',
    collectedBy: string,
    notes?: string,
    bankRefNo?: string
  }
): Promise<boolean> => {
  try {
    if (refundAmount > 0) {
      const refundPayment = {
        customerId,
        roomId,
        amount: refundAmount,
        date: new Date().toISOString(),
        method: refundDetails.method,
        collectedBy: refundDetails.collectedBy,
        status: 'completed' as PaymentStatus, 
        notes: `Refund for early checkout: ${refundDetails.notes || ''}`,
        paymentType: 'refund' as 'refund',
        isRefund: true
      };
      
      const payment = await addPayment(refundPayment);
      if (!payment) return false;
    }
    
    const { error: customerError } = await supabase
      .from('customers')
      .update({ 
        checkoutdate: actualCheckoutDate,
        roomid: null
      })
      .eq('id', customerId);
      
    if (customerError) {
      console.error('Error updating customer checkout date:', customerError);
      return false;
    }
    
    const { error: roomError } = await supabase
      .from('rooms')
      .update({ status: 'cleaning' })
      .eq('id', roomId);
      
    if (roomError) {
      console.error('Error updating room status:', roomError);
      return false;
    }
    
    const reminderResult = await supabase
      .from('rent_reminders')
      .update({ 
        status: 'acknowledged', 
        checkoutdate: actualCheckoutDate 
      })
      .eq('customerid', customerId);
    
    if (reminderResult.error) {
      console.error('Error updating checkout reminder:', reminderResult.error);
    }
    
    return true;
  } catch (error) {
    console.error('Error processing early checkout:', error);
    return false;
  }
};

export { resetDatabase } from "./utilityService";
export { deleteCheckoutReminder } from "./remindersService";
export { getDailyReports } from "./reportsService";
export { getCheckoutReminders } from "./remindersService";
export { loadCustomersForRooms } from "./roomsService";
export { updateRoom } from "./roomsService";
export { getPayments } from "./paymentsService";
export { generateDailyReport } from "./reportsService";
export { processCheckout } from "./rooms/roomCheckout";
