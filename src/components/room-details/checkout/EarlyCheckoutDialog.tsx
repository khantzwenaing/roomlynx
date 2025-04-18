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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Banknote, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const [checkoutDate, setCheckoutDate] = useState<Date | undefined>(
    new Date()
  );
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

    // Calculate days stayed based on early checkout
    const actualDaysStayed = Math.ceil(
      (checkoutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
    );

    // Calculate original planned days
    const originalDays = Math.ceil(
      (originalCheckoutDate.getTime() - checkInDate.getTime()) /
        (1000 * 3600 * 24)
    );

    // Calculate days not staying
    const daysNotStaying = Math.max(0, originalDays - actualDaysStayed);

    // Calculate refund amount for room charge
    const roomRefund = daysNotStaying * room.rate;

    // Prorate extra person charge based on actual days stayed
    const originalExtraPersonCharge = extraPersonCharge;
    const proratedExtraPersonCharge =
      originalExtraPersonCharge * (actualDaysStayed / originalDays);
    const extraPersonRefund = Math.max(
      0,
      originalExtraPersonCharge - proratedExtraPersonCharge
    );

    // Subtract gas charge (not prorated since it's based on actual usage)
    const netRefund = Math.max(0, roomRefund + extraPersonRefund - gasCharge);

    // Check if the refund is valid
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
            <div className="text-sm text-gray-600 mt-2 space-y-1">
              <p>
                Checkout on{" "}
                {checkoutDate ? format(checkoutDate, "PPP") : "today"}
                (Original: {format(checkOutDate, "PPP")})
              </p>

              {/* Calculate the values for display */}
              {(() => {
                if (!checkoutDate) return null;

                const originalCheckoutDate = new Date(customer.checkOutDate);
                const checkInDate = new Date(customer.checkInDate);

                const actualDaysStayed = Math.ceil(
                  (checkoutDate.getTime() - checkInDate.getTime()) /
                    (1000 * 3600 * 24)
                );

                const originalDays = Math.ceil(
                  (originalCheckoutDate.getTime() - checkInDate.getTime()) /
                    (1000 * 3600 * 24)
                );

                const daysNotStaying = Math.max(
                  0,
                  originalDays - actualDaysStayed
                );
                const roomRefund = daysNotStaying * room.rate;

                const originalExtraPersonCharge = extraPersonCharge;
                const proratedExtraPersonCharge =
                  originalExtraPersonCharge * (actualDaysStayed / originalDays);
                const extraPersonRefund = Math.max(
                  0,
                  originalExtraPersonCharge - proratedExtraPersonCharge
                );

                return (
                  <>
                    <div className="border-t pt-1 mt-1">
                      <p>
                        Original stay: {originalDays} days × ₹{room.rate}/day =
                        ₹{originalDays * room.rate}
                      </p>
                      <p>
                        Actual stay: {actualDaysStayed} days × ₹{room.rate}/day
                        = ₹{actualDaysStayed * room.rate}
                      </p>
                      <p>Room charge refund: ₹{roomRefund}</p>
                    </div>

                    {extraPersonCharge > 0 && (
                      <div className="border-t pt-1 mt-1">
                        <p>
                          Original extra person charge: ₹
                          {originalExtraPersonCharge}
                        </p>
                        <p>
                          Prorated extra person charge: ₹
                          {proratedExtraPersonCharge.toFixed(2)}
                        </p>
                        <p>
                          Extra person refund: ₹{extraPersonRefund.toFixed(2)}
                        </p>
                      </div>
                    )}

                    {gasCharge > 0 && (
                      <div className="border-t pt-1 mt-1">
                        <p>Gas charge: -₹{gasCharge} (based on actual usage)</p>
                      </div>
                    )}

                    <div className="border-t pt-1 mt-1 font-medium">
                      <p>
                        Total refund: ₹{roomRefund.toFixed(2)} + ₹
                        {extraPersonRefund.toFixed(2)} - ₹{gasCharge.toFixed(2)}{" "}
                        = ₹{calculateRefundAmount().toFixed(2)}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund-method">Refund Method</Label>
            <RadioGroup
              value={refundDetails.method}
              onValueChange={(value: "cash" | "bank_transfer" | "other") =>
                setRefundDetails({ ...refundDetails, method: value })
              }
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="refund-cash" />
                <Label htmlFor="refund-cash" className="flex items-center">
                  <Banknote className="mr-2" size={20} />
                  Cash
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank_transfer" id="refund-bank" />
                <Label htmlFor="refund-bank" className="flex items-center">
                  <CreditCard className="mr-2" size={20} />
                  Bank Transfer
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="refund-other" />
                <Label htmlFor="refund-other" className="flex items-center">
                  Other
                </Label>
              </div>
            </RadioGroup>
          </div>

          {refundDetails.method === "bank_transfer" && (
            <div className="space-y-2">
              <Label htmlFor="refund-bank-ref">Bank Reference Number</Label>
              <Input
                id="refund-bank-ref"
                placeholder="Enter transaction reference"
                value={refundDetails.bankRefNo}
                onChange={(e) =>
                  setRefundDetails({
                    ...refundDetails,
                    bankRefNo: e.target.value,
                  })
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="refund-by">Processed By</Label>
            <Input
              id="refund-by"
              placeholder="Enter staff name"
              value={refundDetails.collectedBy}
              onChange={(e) =>
                setRefundDetails({
                  ...refundDetails,
                  collectedBy: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund-notes">Notes</Label>
            <Textarea
              id="refund-notes"
              placeholder="Add any additional notes about this refund"
              value={refundDetails.notes}
              onChange={(e) =>
                setRefundDetails({ ...refundDetails, notes: e.target.value })
              }
            />
          </div>
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
