
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
    method: payment.method as 'cash' | 'bank_transfer' | 'other',
    collectedBy: payment.collectedby,
    status: payment.status as 'paid' | 'pending' | 'partial',
    notes: payment.notes || '',
    paymentType: payment.paymenttype as 'deposit' | 'checkout' | 'other' || 'other',
    isRefund: payment.isrefund || false
  }));
};

export const addPayment = async (payment: Omit<Payment, "id">): Promise<Payment | null> => {
  // Remove paymentType field if it doesn't exist in the database
  const newPayment = {
    customerid: payment.customerId,
    roomid: payment.roomId,
    amount: payment.amount,
    date: payment.date,
    method: payment.method,
    collectedby: payment.collectedBy,
    status: payment.status,
    notes: payment.notes || null,
    isrefund: payment.isRefund || false
    // paymenttype field removed as it doesn't exist in the database
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
    status: data.status as 'paid' | 'pending' | 'partial',
    notes: data.notes || '',
    paymentType: 'checkout', // Default value since it's not in the database
    isRefund: data.isrefund || false
  };
};

export const processCheckout = async (roomId: string, paymentDetails: any) => {
  // This is a placeholder for the actual checkout process
  // In a real implementation, this would handle the checkout logic
  console.log("Processing checkout for room", roomId, "with payment details", paymentDetails);
  return true;
};

export const processEarlyCheckout = async (
  roomId: string, 
  customerId: string, 
  actualCheckoutDate: string, 
  refundAmount: number,
  refundDetails: {
    method: 'cash' | 'bank_transfer' | 'other',
    collectedBy: string,
    notes?: string
  }
): Promise<boolean> => {
  try {
    // 1. Create a refund payment record
    if (refundAmount > 0) {
      const refundPayment = {
        customerId,
        roomId,
        amount: refundAmount,
        date: new Date().toISOString(),
        method: refundDetails.method,
        collectedBy: refundDetails.collectedBy,
        status: 'paid' as 'paid', 
        notes: `Refund for early checkout: ${refundDetails.notes || ''}`,
        paymentType: 'checkout' as 'checkout',
        isRefund: true
      };
      
      const payment = await addPayment(refundPayment);
      if (!payment) return false;
    }
    
    // 2. Update customer's checkout date
    const { error } = await supabase
      .from('customers')
      .update({ checkoutdate: actualCheckoutDate })
      .eq('id', customerId);
      
    if (error) {
      console.error('Error updating customer checkout date:', error);
      return false;
    }
    
    // 3. Update or delete the checkout reminder
    const reminderResult = await supabase
      .from('rent_reminders')
      .update({ 
        status: 'acknowledged', 
        checkoutdate: actualCheckoutDate 
      })
      .eq('customerid', customerId);
    
    if (reminderResult.error) {
      console.error('Error updating checkout reminder:', reminderResult.error);
      // Don't fail the whole operation if this part fails
    }
    
    return true;
  } catch (error) {
    console.error('Error processing early checkout:', error);
    return false;
  }
};
