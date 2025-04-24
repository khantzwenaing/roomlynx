
import { useState } from "react";
import { Room, Customer } from "@/types";
import { processEarlyCheckout } from "@/services/dataService";
import { toast } from "sonner";
import type { RefundDetailsFormData } from "@/components/room-details/checkout/early-checkout/RefundDetailsFormSchema";

export const useEarlyCheckout = (room: Room, customer: Customer | null, onSuccess: () => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEarlyCheckout = async (
    actualCheckoutDate: string,
    refundAmount: number,
    refundDetails: RefundDetailsFormData
  ) => {
    if (!room || !customer) return;
    setIsProcessing(true);

    try {
      const success = await processEarlyCheckout(
        room.id,
        customer.id,
        actualCheckoutDate,
        refundAmount,
        refundDetails
      );

      if (success) {
        toast.success("Early Checkout Complete", {
          description: `Room ${room.roomNumber} has been checked out early with a refund of ₹${refundAmount}`
        });
        onSuccess();
      } else {
        throw new Error("Failed to process early checkout with refund");
      }
    } catch (error) {
      console.error("Error during early checkout:", error);
      toast.error("Checkout Failed", {
        description: "An unexpected error occurred during early checkout"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleEarlyCheckout,
    isProcessing
  };
};
