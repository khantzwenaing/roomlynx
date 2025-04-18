
import { CheckoutDetails } from "./types";
import { toast } from "sonner";
import { Customer } from "@/types";

export const useCheckoutValidation = () => {
  const validateCheckoutDetails = (
    checkoutDetails: CheckoutDetails,
    customer: Customer | null
  ): boolean => {
    if (!customer) {
      toast.error("Error", {
        description: "No customer information found"
      });
      return false;
    }
    
    if (!checkoutDetails.collectedBy) {
      toast.error("Error", {
        description: "Please enter who collected the payment"
      });
      return false;
    }

    if (checkoutDetails.paymentMethod === "bank_transfer" && !checkoutDetails.bankRefNo) {
      toast.error("Error", {
        description: "Please enter bank reference number"
      });
      return false;
    }

    // Validate gas usage if applicable
    if (customer.hasGas && customer.initialGasWeight) {
      if (checkoutDetails.finalGasWeight === undefined || checkoutDetails.gasCharge === 0) {
        toast.error("Error", {
          description: "Please calculate gas usage before checkout"
        });
        return false;
      }
    }

    return true;
  };

  return { validateCheckoutDetails };
};
