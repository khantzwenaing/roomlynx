
import { z } from 'zod';

export const refundDetailsSchema = z.object({
  method: z.enum(['cash', 'bank_transfer', 'other'], {
    required_error: "Please select a refund method"
  }),
  collectedBy: z.string().min(2, "Staff name must be at least 2 characters"),
  notes: z.string().optional(),
  bankRefNo: z.string().optional().refine(
    (val) => {
      if (val === undefined) return true;
      return val.length >= 3;
    },
    "Bank reference number must be at least 3 characters"
  )
});

export type RefundDetailsFormData = z.infer<typeof refundDetailsSchema>;
