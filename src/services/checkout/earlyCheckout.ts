
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethod, PaymentStatus } from "@/types";
import { addPayment } from "../payments/paymentCreation";

export const processEarlyCheckout = async (
  roomId: string, 
  customerId: string, 
  actualCheckoutDate: string, 
  refundAmount: number,
  refundDetails: {
    method: PaymentMethod,
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
        paymentType: 'refund' as const,
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
