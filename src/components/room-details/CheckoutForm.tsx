
import React, { useState } from "react";
import { Room, Customer } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isBefore } from "date-fns";

import AmountSummary from "./checkout/AmountSummary";
import PaymentMethodSelector from "./checkout/PaymentMethodSelector";
import BankReferenceInput from "./checkout/BankReferenceInput";
import CollectedByInput from "./checkout/CollectedByInput";
import CheckoutActions from "./checkout/CheckoutActions";
import EarlyCheckoutDialog from "./checkout/EarlyCheckoutDialog";

interface CheckoutFormProps {
  checkoutDetails: {
    paymentMethod: string;
    bankRefNo: string;
    collectedBy: string;
    showCheckoutForm: boolean;
  };
  setCheckoutDetails: React.Dispatch<React.SetStateAction<{
    paymentMethod: string;
    bankRefNo: string;
    collectedBy: string;
    showCheckoutForm: boolean;
  }>>;
  customer: Customer;
  room: Room;
  onCompleteCheckout: () => void;
  onEarlyCheckout?: (
    actualCheckoutDate: string, 
    refundAmount: number, 
    refundDetails: {
      method: 'cash' | 'bank_transfer' | 'other',
      collectedBy: string,
      notes?: string
    }
  ) => Promise<void>;
}

const CheckoutForm = ({ 
  checkoutDetails, 
  setCheckoutDetails, 
  customer, 
  room,
  onCompleteCheckout,
  onEarlyCheckout
}: CheckoutFormProps) => {
  const { toast } = useToast();
  const [showEarlyCheckoutDialog, setShowEarlyCheckoutDialog] = useState(false);

  const handleCompleteCheckout = () => {
    if (!checkoutDetails.collectedBy) {
      toast({
        title: "Error",
        description: "Please enter who collected the payment",
        variant: "destructive"
      });
      return;
    }

    if (checkoutDetails.paymentMethod === "bank_transfer" && !checkoutDetails.bankRefNo) {
      toast({
        title: "Error",
        description: "Please enter bank reference number",
        variant: "destructive"
      });
      return;
    }

    onCompleteCheckout();
  };

  // Check if early checkout is possible
  const checkOutDate = parseISO(customer.checkOutDate);
  const today = new Date();
  const isEarlyCheckout = isBefore(today, checkOutDate);

  return (
    <div className="mt-6 space-y-4 bg-white p-5 rounded-lg border border-gray-200">
      <h4 className="text-xl font-semibold text-gray-800">Checkout Details</h4>
      
      <AmountSummary 
        room={room} 
        customer={customer} 
      />
      
      <PaymentMethodSelector 
        paymentMethod={checkoutDetails.paymentMethod}
        onPaymentMethodChange={(value) => setCheckoutDetails({...checkoutDetails, paymentMethod: value})}
      />
      
      {checkoutDetails.paymentMethod === "bank_transfer" && (
        <BankReferenceInput 
          bankRefNo={checkoutDetails.bankRefNo}
          onBankRefNoChange={(value) => setCheckoutDetails({...checkoutDetails, bankRefNo: value})}
        />
      )}
      
      <CollectedByInput 
        collectedBy={checkoutDetails.collectedBy}
        onCollectedByChange={(value) => setCheckoutDetails({...checkoutDetails, collectedBy: value})}
      />
      
      <CheckoutActions 
        onCompleteCheckout={handleCompleteCheckout}
        onEarlyCheckoutClick={() => setShowEarlyCheckoutDialog(true)}
        isEarlyCheckoutAvailable={isEarlyCheckout && !!onEarlyCheckout}
      />
      
      {/* Early Checkout Dialog */}
      {onEarlyCheckout && (
        <EarlyCheckoutDialog
          open={showEarlyCheckoutDialog}
          onOpenChange={setShowEarlyCheckoutDialog}
          room={room}
          customer={customer}
          onEarlyCheckout={onEarlyCheckout}
        />
      )}
    </div>
  );
};

export default CheckoutForm;
