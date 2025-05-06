
import React, { useState, useEffect } from "react";
import { Room, Customer } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { calculateExtraPersonCharge, calculateGasCharge } from "@/services/settingsService";
import { formatCurrency } from "@/utils/date-utils";
import PaymentMethodSelector from "./checkout/PaymentMethodSelector";
import BankReferenceInput from "./checkout/BankReferenceInput";
import CollectedByInput from "./checkout/CollectedByInput";
import CheckoutActions from "./checkout/CheckoutActions";
import AmountSummary from "./checkout/AmountSummary";
import EarlyCheckoutDialog from "./checkout/EarlyCheckoutDialog";
import type { RefundDetailsFormData } from "./checkout/early-checkout/RefundDetailsFormSchema";

interface CheckoutFormProps {
  checkoutDetails: {
    paymentMethod: "cash" | "bank_transfer" | "other";
    bankRefNo: string;
    collectedBy: string;
    showCheckoutForm: boolean;
  };
  setCheckoutDetails: React.Dispatch<React.SetStateAction<{
    paymentMethod: "cash" | "bank_transfer" | "other";
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
    refundDetails: RefundDetailsFormData
  ) => Promise<void>;
}

const CheckoutForm = ({
  customer,
  room,
  checkoutDetails,
  setCheckoutDetails,
  onCompleteCheckout,
  onEarlyCheckout,
}: CheckoutFormProps) => {
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
      const charge = await calculateGasCharge(customer.initialGasWeight, weight);
      setGasUsed(used);
      setGasCharge(charge);
    }
  };

  const calculateTotalCharges = () => {
    // Calculate room charges based on stay duration
    const checkInDate = new Date(customer.checkInDate);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - checkInDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const roomCharges = room.rate * Math.max(0.5, daysDiff);
    
    // Total all charges
    return roomCharges + gasCharge + extraPersonCharge;
  };

  const calculateFinalAmount = () => {
    const totalCharges = calculateTotalCharges();
    const depositAmount = customer.depositAmount || 0;
    return Math.max(0, totalCharges - depositAmount);
  };

  const isRefund = () => {
    const totalCharges = calculateTotalCharges();
    const depositAmount = customer.depositAmount || 0;
    return depositAmount > totalCharges;
  };

  const getRefundAmount = () => {
    const totalCharges = calculateTotalCharges();
    const depositAmount = customer.depositAmount || 0;
    return Math.max(0, depositAmount - totalCharges);
  };

  const handleCompleteCheckout = () => {
    // Validation
    if (!checkoutDetails.collectedBy) {
      toast.error("Please enter who collected the payment");
      return;
    }

    if (checkoutDetails.paymentMethod === "bank_transfer" && !checkoutDetails.bankRefNo) {
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

  const totalCharges = calculateTotalCharges();
  const depositAmount = customer.depositAmount || 0;
  const finalAmount = calculateFinalAmount();
  const refundAmount = getRefundAmount();

  return (
    <div className="mt-6 space-y-4 bg-white p-5 rounded-lg border border-gray-200">
      <h4 className="text-xl font-semibold text-gray-800">Checkout Details</h4>
      
      {/* Amount Summary */}
      <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Room Charges:</span>
          <span>{formatCurrency(room.rate * Math.max(0.5, Math.ceil(
            (new Date().getTime() - new Date(customer.checkInDate).getTime()) / (1000 * 3600 * 24)
          )))}</span>
        </div>

        {extraPersonCharge > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span>Extra Person Charges:</span>
            <span>{formatCurrency(extraPersonCharge)}</span>
          </div>
        )}

        {customer.hasGas && (
          <div className="space-y-2 border-t pt-2">
            <div className="flex justify-between items-center text-sm">
              <span>Initial Gas Weight:</span>
              <span>{customer.initialGasWeight} kg</span>
            </div>
            
            {finalGasWeight !== undefined && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span>Final Gas Weight:</span>
                  <span>{finalGasWeight} kg</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Gas Used:</span>
                  <span>{gasUsed.toFixed(2)} kg</span>
                </div>
              </>
            )}
            
            {gasCharge > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span>Gas Usage Charge:</span>
                <span>{formatCurrency(gasCharge)}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center text-sm font-medium border-t pt-2">
          <span>Total Charges:</span>
          <span>{formatCurrency(totalCharges)}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span>Deposit Amount:</span>
          <span className="text-purple-600">{formatCurrency(depositAmount)}</span>
        </div>

        {isRefund() ? (
          <div className="flex justify-between items-center text-lg font-bold text-green-600 border-t pt-2">
            <span>Refund Amount:</span>
            <span>{formatCurrency(refundAmount)}</span>
          </div>
        ) : (
          <div className="flex justify-between items-center text-lg font-bold text-blue-600 border-t pt-2">
            <span>Amount Due:</span>
            <span>{formatCurrency(finalAmount)}</span>
          </div>
        )}
      </div>

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
              <div className="text-sm">Gas Usage: {gasUsed.toFixed(2)} kg</div>
              <div className="text-lg font-bold">
                Gas Charge: {formatCurrency(gasCharge)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Method Selection */}
      <PaymentMethodSelector
        paymentMethod={checkoutDetails.paymentMethod}
        onPaymentMethodChange={(value) => setCheckoutDetails({
          ...checkoutDetails,
          paymentMethod: value as "cash" | "bank_transfer" | "other"
        })}
      />

      {/* Bank Reference Number */}
      {checkoutDetails.paymentMethod === "bank_transfer" && (
        <BankReferenceInput
          bankRefNo={checkoutDetails.bankRefNo}
          onBankRefNoChange={(value) => setCheckoutDetails({
            ...checkoutDetails,
            bankRefNo: value
          })}
        />
      )}

      {/* Collected By */}
      <CollectedByInput
        collectedBy={checkoutDetails.collectedBy}
        onCollectedByChange={(value) => setCheckoutDetails({
          ...checkoutDetails,
          collectedBy: value
        })}
      />

      {/* Action Buttons */}
      <CheckoutActions
        onCompleteCheckout={handleCompleteCheckout}
        onEarlyCheckoutClick={onEarlyCheckout ? () => setShowEarlyCheckoutDialog(true) : undefined}
        isEarlyCheckoutAvailable={!!onEarlyCheckout}
        disabled={(customer.hasGas && customer.initialGasWeight && finalGasWeight === undefined) ||
                 !checkoutDetails.collectedBy ||
                 (checkoutDetails.paymentMethod === "bank_transfer" && !checkoutDetails.bankRefNo)}
      />

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
