
import React, { useState, useEffect } from "react";
import { Room, Customer } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { calculateExtraPersonCharge } from "@/services/settingsService";
import { formatCurrency, calculateCurrentStayDuration } from "@/utils/date-utils";
import PaymentMethodSelector from "./checkout/PaymentMethodSelector";
import BankReferenceInput from "./checkout/BankReferenceInput";
import CollectedByInput from "./checkout/CollectedByInput";
import AmountSummary from "./checkout/AmountSummary";
import EarlyCheckoutDialog from "./checkout/EarlyCheckoutDialog";
import { type RefundDetailsFormData } from "./checkout/early-checkout/RefundDetailsFormSchema";

interface CheckoutFormProps {
  room: Room;
  customer: Customer;
  onCompleteCheckout: () => void;
  onEarlyCheckout?: (
    actualCheckoutDate: string,
    refundAmount: number,
    refundDetails: RefundDetailsFormData
  ) => Promise<void>;
}

const CheckoutForm = ({
  customer,
  room,
  onCompleteCheckout,
  onEarlyCheckout,
}: CheckoutFormProps) => {
  // Form state
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer" | "other">("cash");
  const [bankRefNo, setBankRefNo] = useState("");
  const [collectedBy, setCollectedBy] = useState("");
  
  // Gas usage state
  const [finalGasWeight, setFinalGasWeight] = useState<number | undefined>();
  const [gasCharge, setGasCharge] = useState(0);
  const [gasUsed, setGasUsed] = useState(0);
  
  // Extra person charge state
  const [extraPersonCharge, setExtraPersonCharge] = useState(0);
  
  // Early checkout state
  const [showEarlyCheckoutDialog, setShowEarlyCheckoutDialog] = useState(false);
  
  // Load extra charges on component mount
  useEffect(() => {
    const loadExtraCharges = async () => {
      if (customer) {
        const personCharge = await calculateExtraPersonCharge(customer);
        setExtraPersonCharge(personCharge);
      }
    };

    loadExtraCharges();
  }, [customer]);

  const handleGasWeightChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const weight = parseFloat(e.target.value) || 0;
    setFinalGasWeight(weight);
    
    if (customer.initialGasWeight !== undefined && weight <= customer.initialGasWeight) {
      const used = customer.initialGasWeight - weight;
      setGasUsed(used);
      
      // Simple gas charge calculation (real implementation would call service)
      // This would be better handled by calling calculateGasCharge from service
      const gasRate = 80; // Default rate if service call fails
      const charge = used * gasRate;
      setGasCharge(charge);
    }
  };

  const calculateTotalCharges = () => {
    // Calculate room charges based on stay duration
    const checkInDate = new Date(customer.checkInDate);
    const currentDate = new Date();
    const daysDiff = calculateCurrentStayDuration(customer.checkInDate);
    const roomCharges = room.rate * Math.max(0.5, daysDiff);
    
    // Total all charges
    return roomCharges + gasCharge + extraPersonCharge;
  };

  const calculateFinalAmount = () => {
    const totalCharges = calculateTotalCharges();
    const depositAmount = customer.depositAmount || 0;
    return Math.max(0, totalCharges - depositAmount);
  };

  const getRefundAmount = () => {
    const totalCharges = calculateTotalCharges();
    const depositAmount = customer.depositAmount || 0;
    return Math.max(0, depositAmount - totalCharges);
  };

  const handleCompleteCheckout = () => {
    // Validation
    if (!collectedBy) {
      toast.error("Please enter who collected the payment");
      return;
    }

    if (paymentMethod === "bank_transfer" && !bankRefNo) {
      toast.error("Please enter bank reference number");
      return;
    }

    // If gas is being used but no final weight entered, show error
    if (customer.hasGas && customer.initialGasWeight && finalGasWeight === undefined) {
      toast.error("Please enter final gas weight before checking out");
      return;
    }

    onCompleteCheckout();
  };

  const handleEarlyCheckoutClick = () => {
    setShowEarlyCheckoutDialog(true);
  };

  const isRefund = getRefundAmount() > 0;
  const finalAmount = calculateFinalAmount();
  const refundAmount = getRefundAmount();

  return (
    <div className="mt-6 space-y-4 bg-white p-5 rounded-lg border border-gray-200">
      <h4 className="text-xl font-semibold text-gray-800">Checkout Details</h4>
      
      {/* Amount Summary */}
      <AmountSummary 
        room={room} 
        customer={customer}
        gasCharge={gasCharge}
        extraPersonCharge={extraPersonCharge}
        finalGasWeight={finalGasWeight}
      />

      {/* Gas Usage Fields */}
      {customer.hasGas && customer.initialGasWeight && (
        <div className="p-4 border border-blue-200 rounded-md bg-blue-50">
          <h3 className="font-medium text-lg mb-3">Gas Usage Calculation</h3>

          <div className="mb-4">
            <div className="text-sm font-medium">Initial Gas Weight:</div>
            <div className="text-lg font-bold">{customer.initialGasWeight} kg</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="final-gas-weight">Final Gas Weight (kg)</Label>
            <Input
              id="final-gas-weight"
              type="number"
              step="0.01"
              min="0"
              max={customer.initialGasWeight}
              placeholder="Enter final weight"
              onChange={handleGasWeightChange}
              className="h-10"
            />
            <p className="text-sm text-gray-500">
              Current weight of gas cylinder at checkout
            </p>
          </div>

          {gasCharge > 0 && (
            <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-md space-y-1">
              <div className="text-sm">Gas Used: {gasUsed.toFixed(2)} kg</div>
              <div className="text-lg font-bold">
                Gas Charge: {formatCurrency(gasCharge)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Method Selection */}
      <PaymentMethodSelector
        paymentMethod={paymentMethod}
        onPaymentMethodChange={(value) => setPaymentMethod(value as "cash" | "bank_transfer" | "other")}
      />

      {/* Bank Reference Number */}
      {paymentMethod === "bank_transfer" && (
        <BankReferenceInput
          bankRefNo={bankRefNo}
          onBankRefNoChange={setBankRefNo}
        />
      )}

      {/* Collected By */}
      <CollectedByInput
        collectedBy={collectedBy}
        onCollectedByChange={setCollectedBy}
      />

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={handleCompleteCheckout} 
          className="w-full py-6 text-xl bg-red-600 hover:bg-red-700"
          disabled={(customer.hasGas && customer.initialGasWeight && finalGasWeight === undefined) ||
                   !collectedBy ||
                   (paymentMethod === "bank_transfer" && !bankRefNo)}
        >
          Complete Checkout
        </Button>
        
        {onEarlyCheckout && (
          <Button 
            onClick={handleEarlyCheckoutClick}
            variant="outline" 
            className="w-full"
          >
            Process Early Checkout
          </Button>
        )}
      </div>

      {/* Early Checkout Dialog */}
      {onEarlyCheckout && showEarlyCheckoutDialog && (
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
