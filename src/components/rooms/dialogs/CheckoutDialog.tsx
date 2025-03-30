
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Customer, Room } from "@/types";

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
            <div className="text-lg font-medium">Amount Due: ${calculateAmountDue()}</div>
            <div className="text-sm text-gray-600">
              (Total stay: ${calculateTotalStay()} - Deposit: ${customer?.depositAmount || 0})
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-method" className="text-lg">Payment Method</Label>
            <select
              id="payment-method"
              className="w-full h-12 px-3 border border-gray-300 rounded-md"
              value={checkoutDetails.paymentMethod}
              onChange={(e) => setCheckoutDetails({
                ...checkoutDetails, 
                paymentMethod: e.target.value as "cash" | "bank_transfer" | "other"
              })}
            >
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
                onChange={(e) => setCheckoutDetails({...checkoutDetails, bankRefNo: e.target.value})}
                className="text-lg h-12"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="collected-by" className="text-lg">Collected By</Label>
            <Input
              id="collected-by"
              placeholder="Enter staff name"
              value={checkoutDetails.collectedBy}
              onChange={(e) => setCheckoutDetails({...checkoutDetails, collectedBy: e.target.value})}
              className="text-lg h-12"
            />
          </div>
          
          <Button 
            onClick={onCheckout} 
            className="w-full py-6 text-xl bg-red-600 hover:bg-red-700"
          >
            Complete Checkout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
