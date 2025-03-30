
import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Valid phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  idNumber: z.string().optional().or(z.literal("")),
  roomId: z.string({required_error: "Room is required"}),
  checkInDate: z.date({required_error: "Check-in date is required"}),
  checkOutDate: z.date({required_error: "Check-out date is required"}),
  depositAmount: z.string().min(1, "Deposit amount is required").refine(val => val === '' || (Number(val) > 0), {
    message: "Deposit amount must be a positive number"
  }),
  depositPaymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'other']).optional(),
  depositCollectedBy: z.string().optional(),
  bankRefNo: z.string().optional()
}).refine(data => {
  // Ensure check-out date is after check-in date
  if (data.checkInDate && data.checkOutDate) {
    return data.checkOutDate > data.checkInDate;
  }
  return true;
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"]
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
