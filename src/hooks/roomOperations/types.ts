
export interface CheckoutDetails {
  paymentMethod: "cash" | "bank_transfer" | "other";
  bankRefNo: string;
  collectedBy: string;
  showCheckoutForm: boolean;
  gasCharge?: number; // Add these new optional properties
  finalGasWeight?: number;
  extraPersonCharge?: number;
}
