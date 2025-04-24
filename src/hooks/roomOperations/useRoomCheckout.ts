
import { useState } from "react";
import { Room, Customer } from "@/types";
import { CheckoutDetails } from "./types";
import { useCheckoutValidation } from "./useCheckoutValidation";
import { useEarlyCheckout } from "./useEarlyCheckout";
import { calculateTotalStay, calculateAmountDue } from "./roomCalculations";
import { isBefore, parseISO } from "date-fns";
import type { RefundDetailsFormData } from "@/components/room-details/checkout/early-checkout/RefundDetailsFormSchema";

export const useRoomCheckout = (room: Room, customer: Customer | null) => {
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails>({
    paymentMethod: "cash",
    bankRefNo: "",
    collectedBy: "",
    showCheckoutForm: false,
    gasCharge: 0,
    finalGasWeight: 0,
    extraPersonCharge: 0
  });

  const { validateCheckoutDetails } = useCheckoutValidation();
  const { handleEarlyCheckout } = useEarlyCheckout(room, customer, () => {
    setIsCheckoutDialogOpen(false);
    setTimeout(() => window.location.reload(), 1000);
  });

  const handleCheckout = async () => {
    if (!validateCheckoutDetails(checkoutDetails, customer)) {
      return;
    }

    try {
      // Check if this is an early checkout
      const today = new Date();
      const plannedCheckout = customer ? parseISO(customer.checkOutDate) : null;
      const isEarlyCheckout = plannedCheckout && isBefore(today, plannedCheckout);

      if (isEarlyCheckout && customer) {
        // Handle early checkout with refund calculation
        const checkInDate = parseISO(customer.checkInDate);
        const actualDaysStayed = Math.max(1, Math.ceil(
          (today.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
        ));
        const actualStayAmount = actualDaysStayed * room.rate;
        const totalCharges = actualStayAmount + 
                           (checkoutDetails.extraPersonCharge || 0) + 
                           (checkoutDetails.gasCharge || 0);
        const depositAmount = customer.depositAmount || 0;
        const refundAmount = Math.max(0, depositAmount - totalCharges);

        if (refundAmount > 0) {
          const refundDetails: RefundDetailsFormData = {
            method: checkoutDetails.paymentMethod as 'cash' | 'bank_transfer' | 'other',
            collectedBy: checkoutDetails.collectedBy,
            notes: `Gas: ${checkoutDetails.gasCharge}, Extra persons: ${checkoutDetails.extraPersonCharge}`,
            bankRefNo: checkoutDetails.bankRefNo || ''
          };
          
          await handleEarlyCheckout(
            today.toISOString(),
            refundAmount,
            refundDetails
          );
        }
      }

      setIsCheckoutDialogOpen(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  return {
    isCheckoutDialogOpen,
    setIsCheckoutDialogOpen,
    checkoutDetails,
    setCheckoutDetails,
    handleCheckout,
    handleEarlyCheckout,
    calculateTotalStay: () => calculateTotalStay(room, customer),
    calculateAmountDue
  };
};
