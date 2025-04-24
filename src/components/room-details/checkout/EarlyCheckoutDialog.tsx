
import React, { useState } from "react";
import { format, parseISO, isBefore } from "date-fns";
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
import RefundCalculation from "./early-checkout/RefundCalculation";
import RefundDetailsForm from "./early-checkout/RefundDetailsForm";

interface EarlyCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
  customer: Customer;
  onEarlyCheckout: (
    actualCheckoutDate: string,
    refundAmount: number,
    refundDetails: {
      method: "cash" | "bank_transfer" | "other";
      collectedBy: string;
      notes?: string;
    }
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
  const [checkoutDate, setCheckoutDate] = useState<Date | undefined>(new Date());
  const [refundDetails, setRefundDetails] = useState({
    method: "cash" as "cash" | "bank_transfer" | "other",
    collectedBy: "",
    notes: "",
    bankRefNo: "",
  });

  const calculateRefundAmount = (): number => {
    if (!checkoutDate) return 0;
    
    const originalCheckoutDate = new Date(customer.checkOutDate);
    const checkInDate = new Date(customer.checkInDate);
    
    const actualDaysStayed = Math.ceil(
      (checkoutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
    );
    
    const originalDays = Math.ceil(
      (originalCheckoutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
    );
    
    const daysNotStaying = Math.max(0, originalDays - actualDaysStayed);
    const roomRefund = daysNotStaying * room.rate;
    
    const originalExtraPersonCharge = extraPersonCharge;
    const proratedExtraPersonCharge = originalExtraPersonCharge * (actualDaysStayed / originalDays);
    const extraPersonRefund = Math.max(0, originalExtraPersonCharge - proratedExtraPersonCharge);
    
    const netRefund = Math.max(0, roomRefund + extraPersonRefund - gasCharge);
    
    if (isBefore(checkoutDate, checkInDate)) return 0;
    
    return netRefund;
  };

  const handleEarlyCheckout = async () => {
    if (!checkoutDate) return;

    const refundAmount = calculateRefundAmount();
    await onEarlyCheckout(checkoutDate.toISOString(), refundAmount, {
      method: refundDetails.method,
      collectedBy: refundDetails.collectedBy,
      notes: refundDetails.notes,
    });

    onOpenChange(false);
  };

  const checkOutDate = parseISO(customer.checkOutDate);
  const checkInDate = parseISO(customer.checkInDate);

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
              Refund Amount: ₹{calculateRefundAmount().toFixed(2)}
            </p>
            {checkoutDate && (
              <RefundCalculation
                checkoutDate={checkoutDate}
                originalCheckoutDate={checkOutDate}
                checkInDate={checkInDate}
                roomRate={room.rate}
                extraPersonCharge={extraPersonCharge}
                gasCharge={gasCharge}
                calculateRefundAmount={calculateRefundAmount}
              />
            )}
          </div>

          <RefundDetailsForm
            refundDetails={refundDetails}
            setRefundDetails={setRefundDetails}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleEarlyCheckout}
            disabled={
              calculateRefundAmount() <= 0 || !refundDetails.collectedBy
            }
          >
            Process Early Checkout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EarlyCheckoutDialog;
