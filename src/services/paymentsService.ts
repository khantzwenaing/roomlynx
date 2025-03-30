
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types";

export const getPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*');
  
  if (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
  
  return data.map(payment => ({
    id: payment.id,
    customerId: payment.customerid,
    roomId: payment.roomid,
    amount: Number(payment.amount),
    date: payment.date,
    method: payment.method as 'cash' | 'card' | 'bank_transfer' | 'other',
    collectedBy: payment.collectedby,
    status: payment.status as 'paid' | 'pending' | 'partial',
    notes: payment.notes || ''
  }));
};

export const addPayment = async (payment: Omit<Payment, "id">): Promise<Payment | null> => {
  const newPayment = {
    customerid: payment.customerId,
    roomid: payment.roomId,
    amount: payment.amount,
    date: payment.date,
    method: payment.method,
    collectedby: payment.collectedBy,
    status: payment.status,
    notes: payment.notes || null
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
    method: data.method as 'cash' | 'card' | 'bank_transfer' | 'other',
    collectedBy: data.collectedby,
    status: data.status as 'paid' | 'pending' | 'partial',
    notes: data.notes || ''
  };
};

export const processCheckout = async (roomId: string, paymentDetails: any) => {
  // This is a placeholder for the actual checkout process
  // In a real implementation, this would handle the checkout logic
  console.log("Processing checkout for room", roomId, "with payment details", paymentDetails);
  return true;
};
