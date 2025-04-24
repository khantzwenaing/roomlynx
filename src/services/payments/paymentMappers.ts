
import { Payment, PaymentStatus, PaymentMethod } from "@/types";

export const mapDbPaymentToPayment = (data: any): Payment => ({
  id: data.id,
  customerId: data.customerid,
  roomId: data.roomid,
  amount: Number(data.amount),
  date: data.date,
  method: data.method as PaymentMethod,
  collectedBy: data.collectedby,
  status: data.status as PaymentStatus,
  notes: data.notes || '',
  paymentType: data.notes?.toLowerCase().includes('deposit') ? 'deposit' : 
              data.notes?.toLowerCase().includes('refund') || data.isrefund ? 'refund' : 'checkout',
  isRefund: data.isrefund || false,
  gasUsageCharge: data.gasusagecharge,
  extraPersonsCharge: data.extrapersonscharge
});
