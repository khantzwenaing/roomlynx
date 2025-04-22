
import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Valid phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  idNumber: z.string().optional().or(z.literal("")),
  roomId: z.string({required_error: "Room is required"}),
  checkInDate: z.date({required_error: "Check-in date is required"}),
  depositAmount: z.string().min(1, "Deposit amount is required").refine(val => val === '' || (Number(val) > 0), {
    message: "Deposit amount must be a positive number"
  }),
  depositPaymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'other']).optional(),
  depositCollectedBy: z.string().optional(),
  bankRefNo: z.string().optional(),
  numberOfPersons: z.number().min(1, "Number of persons is required").default(1),
  hasGas: z.boolean().default(false),
  initialGasWeight: z.number().optional(),
}).refine(data => {
  // Ensure gas weight is provided if gas is selected
  if (data.hasGas) {
    return data.initialGasWeight !== undefined && data.initialGasWeight > 0;
  }
  return true;
}, {
  message: "Initial gas weight is required when gas is selected",
  path: ["initialGasWeight"]
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
