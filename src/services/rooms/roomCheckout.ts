import { supabase } from "@/integrations/supabase/client";
import { CheckoutDetails, Customer, Payment, PaymentMethod } from "@/types";
import { addPayment } from "../paymentsService";

/**
 * Process a normal checkout for a room
 */
export const processCheckout = async (checkoutDetails: CheckoutDetails): Promise<boolean> => {
  try {
    const { roomId, customerId, finalGasWeight, gasCharge, extraPersonCharge, totalAmount, 
            paymentMethod, collectedBy, bankRefNo, notes } = checkoutDetails;

    console.log(`Processing checkout for room ${roomId}, customer ${customerId}`);
    
    // 1. Create payment record
    const payment: Omit<Payment, "id"> = {
      customerId,
      roomId,
      amount: totalAmount,
      method: paymentMethod,
      date: new Date().toISOString(),
      status: "completed",
      notes: notes || "Checkout payment",
      collectedBy,
      paymentType: "rent",
      isRefund: false,
      gasUsageCharge: gasCharge || 0,
      extraPersonsCharge: extraPersonCharge || 0
    };
    
    const paymentResult = await addPayment(payment);
    
    if (!paymentResult) {
      console.error("Failed to add payment record for checkout");
      return false;
    }
    
    // 2. Update room status to cleaning
    const { error: roomError } = await supabase
      .from('rooms')
      .update({ 
        status: 'cleaning',
        lastcleaned: null, 
        cleanedby: null 
      })
      .eq('id', roomId);
    
    if (roomError) {
      console.error("Failed to update room status:", roomError);
      return false;
    }
    
    // 3. Archive customer (no deletion needed as the database keeps history)
    
    console.log(`Checkout process completed for room ${roomId}`);
    return true;
  } catch (error) {
    console.error("Error in processCheckout:", error);
    return false;
  }
};

/**
 * Process an early checkout with possible refund
 */
export const processEarlyCheckout = async (
  roomId: string, 
  customerId: string,
  actualCheckoutDate: string,
  refundAmount: number,
  refundDetails: { 
    method: PaymentMethod, 
    collectedBy: string, 
    notes?: string 
  }
): Promise<boolean> => {
  try {
    console.log(`Processing early checkout for room ${roomId}, customer ${customerId}`);
    
    // 1. Update room status to cleaning
    const { error: roomError } = await supabase
      .from('rooms')
      .update({ 
        status: 'cleaning',
        lastcleaned: null, 
        cleanedby: null 
      })
      .eq('id', roomId);
    
    if (roomError) {
      console.error("Failed to update room status:", roomError);
      return false;
    }
    
    // 2. Create refund payment record if there's a refund
    if (refundAmount > 0) {
      const refundPayment: Omit<Payment, "id"> = {
        customerId,
        roomId,
        amount: refundAmount,
        method: refundDetails.method,
        date: new Date().toISOString(),
        status: "completed",
        notes: refundDetails.notes || "Early checkout refund",
        collectedBy: refundDetails.collectedBy,
        paymentType: "refund",
        isRefund: true
      };
      
      const paymentResult = await addPayment(refundPayment);
      
      if (!paymentResult) {
        console.error("Failed to add refund payment record");
        return false;
      }
    }
    
    console.log(`Early checkout completed for room ${roomId}`);
    return true;
  } catch (error) {
    console.error("Error in processEarlyCheckout:", error);
    return false;
  }
};
