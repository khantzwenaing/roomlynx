
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Banknote, CreditCard } from "lucide-react";

interface PaymentMethodSelectorProps {
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
}

const PaymentMethodSelector = ({ paymentMethod, onPaymentMethodChange }: PaymentMethodSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="payment-method" className="text-lg">Payment Method</Label>
      <RadioGroup 
        value={paymentMethod}
        onValueChange={onPaymentMethodChange}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cash" id="payment-cash" />
          <Label htmlFor="payment-cash" className="flex items-center">
            <Banknote className="mr-2" size={20} />
            Cash
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bank_transfer" id="payment-bank" />
          <Label htmlFor="payment-bank" className="flex items-center">
            <CreditCard className="mr-2" size={20} />
            Bank Transfer
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="other" id="payment-other" />
          <Label htmlFor="payment-other" className="flex items-center">
            Other
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default PaymentMethodSelector;
