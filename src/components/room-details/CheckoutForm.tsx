
import React, { useState, useEffect } from "react";
import { Room, Customer } from "@/types";
import { useToast } from "@/hooks/use-toast";
import EarlyCheckoutDialog from "./checkout/EarlyCheckoutDialog";
import PaymentMethodSelector from "./checkout/PaymentMethodSelector";
import BankReferenceInput from "./checkout/BankReferenceInput";
import CollectedByInput from "./checkout/CollectedByInput";
import CheckoutActions from "./checkout/CheckoutActions";
import GasUsageFields from "./checkout/GasUsageFields";
import AmountSummary from "./checkout/AmountSummary";
import { calculateExtraPersonCharge } from "@/services/settingsService";

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
  const [gasCharge, setGasCharge] = useState(0);
  const [finalGasWeight, setFinalGasWeight] = useState<number | undefined>();
  const [extraPersonCharge, setExtraPersonCharge] = useState(0);
  
  useEffect(() => {
    const loadExtraCharges = async () => {
      if (customer) {
        const personCharge = await calculateExtraPersonCharge(customer);
        setExtraPersonCharge(personCharge);
      }
    };
    
    loadExtraCharges();
  }, [customer]);

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
    
    // If gas is being used but no final weight entered, show error
    if (customer.hasGas && customer.initialGasWeight && !finalGasWeight) {
      toast({
        title: "Error",
        description: "Please calculate gas usage charge before checking out",
        variant: "destructive"
      });
      return;
    }

    onCompleteCheckout();
  };

  const handleGasChargeCalculated = (charge: number, weight: number) => {
    setGasCharge(charge);
    setFinalGasWeight(weight);
  };

  return (
    <div className="mt-6 space-y-4 bg-white p-5 rounded-lg border border-gray-200">
      <h4 className="text-xl font-semibold text-gray-800">Checkout Details</h4>
      
      <AmountSummary 
        room={room} 
        customer={customer}
        gasCharge={gasCharge}
        extraPersonCharge={extraPersonCharge}
        finalGasWeight={finalGasWeight}
      />
      
      {/* Show gas usage calculation if applicable */}
      {customer.hasGas && customer.initialGasWeight && (
        <GasUsageFields
          initialWeight={customer.initialGasWeight}
          onGasChargeCalculated={handleGasChargeCalculated}
        />
      )}
      
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
        isEarlyCheckoutAvailable={true}
      />
      
      {onEarlyCheckout && (
        <EarlyCheckoutDialog
          open={showEarlyCheckoutDialog}
          onOpenChange={setShowEarlyCheckoutDialog}
          room={room}
          customer={customer}
          onEarlyCheckout={onEarlyCheckout}
          gasCharge={gasCharge}
          extraPersonCharge={extraPersonCharge}
        />
      )}
    </div>
  );
};

export default CheckoutForm;
