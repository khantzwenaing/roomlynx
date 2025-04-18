
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Customer, Room } from "@/types";
import { format, parseISO, isBefore } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";

interface CheckoutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
  customer: Customer | null;
  checkoutDetails: {
    paymentMethod: "cash" | "bank_transfer" | "other";
    bankRefNo: string;
    collectedBy: string;
  };
  setCheckoutDetails: React.Dispatch<React.SetStateAction<{
    paymentMethod: "cash" | "bank_transfer" | "other";
    bankRefNo: string;
    collectedBy: string;
    showCheckoutForm: boolean;
  }>>;
  onCheckout: () => void;
  calculateAmountDue: () => number;
  calculateTotalStay: () => number;
}

const CheckoutDialog = ({ 
  isOpen, 
  onOpenChange, 
  room, 
  customer, 
  checkoutDetails, 
  setCheckoutDetails, 
  onCheckout,
  calculateAmountDue,
  calculateTotalStay
}: CheckoutDialogProps) => {
  const [isEarlyCheckout, setIsEarlyCheckout] = useState(false);
  const [checkoutDate, setCheckoutDate] = useState<Date>(new Date());
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundNotes, setRefundNotes] = useState('');

  useEffect(() => {
    if (customer && isOpen) {
      const today = new Date();
      const plannedCheckout = parseISO(customer.checkOutDate);
      
      // Check if today is before the planned checkout date
      setIsEarlyCheckout(isBefore(today, plannedCheckout));
      
      // Calculate refund amount if it's an early checkout
      if (isBefore(today, plannedCheckout)) {
        const checkInDate = parseISO(customer.checkInDate);
        
        // Calculate days stayed based on today
        const actualDaysStayed = Math.ceil(
          (today.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
        );
        
        // Calculate original planned days
        const originalDays = Math.ceil(
          (plannedCheckout.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
        );
        
        // Calculate days not staying
        const daysNotStaying = Math.max(0, originalDays - actualDaysStayed);
        
        // Calculate refund amount
        const refundAmount = daysNotStaying * room.rate;
        setRefundAmount(refundAmount);
      }
    }
  }, [customer, isOpen, room.rate]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Check-out & Payment</DialogTitle>
          <DialogDescription>
            Complete the checkout process for Room {room.roomNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
            <div className="text-lg font-medium">Amount Due: ₹{calculateAmountDue()}</div>
            <div className="text-sm text-gray-600">
              (Total stay: ₹{calculateTotalStay()} - Deposit: ₹{customer?.depositAmount || 0})
            </div>
            
            {isEarlyCheckout && (
              <div className="mt-2 text-sm text-blue-600">
                This is an early checkout. {refundAmount > 0 && `Refund amount: ₹${refundAmount}`}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-method" className="text-lg">Payment Method</Label>
            <select
              id="payment-method"
              className="w-full h-12 px-3 border border-gray-300 rounded-md"
              value={checkoutDetails.paymentMethod}
              onChange={(e) => setCheckoutDetails({
                ...checkoutDetails, 
                paymentMethod: e.target.value as "cash" | "bank_transfer" | "other",
                showCheckoutForm: true
              })}
              required
            >
              <option value="">Select payment method</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {checkoutDetails.paymentMethod === "bank_transfer" && (
            <div className="space-y-2">
              <Label htmlFor="bank-ref" className="text-lg">Bank Reference Number</Label>
              <Input
                id="bank-ref"
                placeholder="Enter transaction reference"
                value={checkoutDetails.bankRefNo}
                onChange={(e) => setCheckoutDetails({
                  ...checkoutDetails, 
                  bankRefNo: e.target.value,
                  showCheckoutForm: true
                })}
                className="text-lg h-12"
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="collected-by" className="text-lg">Collected By</Label>
            <Input
              id="collected-by"
              placeholder="Enter staff name"
              value={checkoutDetails.collectedBy}
              onChange={(e) => setCheckoutDetails({
                ...checkoutDetails, 
                collectedBy: e.target.value,
                showCheckoutForm: true
              })}
              className="text-lg h-12"
              required
            />
          </div>
          
          {isEarlyCheckout && refundAmount > 0 && (
            <div className="space-y-2">
              <Label htmlFor="refund-notes" className="text-lg">Refund Notes</Label>
              <Textarea
                id="refund-notes"
                placeholder="Add any notes about the refund"
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                className="text-lg"
              />
            </div>
          )}
          
          <Button 
            onClick={onCheckout} 
            className="w-full py-6 text-xl bg-red-600 hover:bg-red-700"
            disabled={!checkoutDetails.collectedBy || 
                     (checkoutDetails.paymentMethod === "bank_transfer" && !checkoutDetails.bankRefNo)}
          >
            Complete Checkout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
