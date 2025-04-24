
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types";
import { mapDbPaymentToPayment } from "./paymentMappers";

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
  
  return mapDbPaymentToPayment(data);
};
