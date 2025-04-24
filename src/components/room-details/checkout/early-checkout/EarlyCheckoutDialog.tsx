
import React from "react";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Room, Customer } from "@/types";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import RefundCalculation from "./RefundCalculation";
import RefundDetailsForm from "./RefundDetailsForm";
import { useRefundCalculation } from "@/hooks/roomOperations/useRefundCalculation";
import type { RefundDetailsFormData } from "./RefundDetailsFormSchema";

interface EarlyCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
  customer: Customer;
  onEarlyCheckout: (
    actualCheckoutDate: string,
    refundAmount: number,
    refundDetails: RefundDetailsFormData
  ) => Promise<void>;
  gasCharge?: number;
  extraPersonCharge?: number;
}

const EarlyCheckoutDialog = ({
  open,
  onOpenChange,
  room,
  customer,
  onEarlyCheckout,
  gasCharge = 0,
  extraPersonCharge = 0,
}: EarlyCheckoutDialogProps) => {
  const checkInDate = parseISO(customer.checkInDate);
  const originalCheckoutDate = parseISO(customer.checkOutDate);

  const {
    checkoutDate,
    setCheckoutDate,
    totalRefund,
    ...refundCalculation
  } = useRefundCalculation({
    checkInDate,
    originalCheckoutDate,
    roomRate: room.rate,
    extraPersonCharge,
    gasCharge
  });

  const handleSubmit = async (formData: RefundDetailsFormData) => {
    if (!checkoutDate) return;
    await onEarlyCheckout(
      checkoutDate.toISOString(),
      totalRefund,
      formData
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Early Checkout & Refund</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="checkout-date">Actual Checkout Date</Label>
            <DatePicker
              date={checkoutDate}
              onDateChange={setCheckoutDate}
              label="Checkout Date"
              className="w-full"
            />
          </div>

          <div className="p-4 bg-yellow-50 rounded-md">
            <p className="font-medium text-lg">
              Refund Amount: ₹{totalRefund.toFixed(2)}
            </p>
            {checkoutDate && (
              <RefundCalculation
                checkoutDate={checkoutDate}
                originalCheckoutDate={originalCheckoutDate}
                checkInDate={checkInDate}
                roomRate={room.rate}
                extraPersonCharge={extraPersonCharge}
                gasCharge={gasCharge}
                calculateRefundAmount={() => totalRefund}
              />
            )}
          </div>

          <RefundDetailsForm
            onSubmit={handleSubmit}
            disabled={totalRefund <= 0}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EarlyCheckoutDialog;
