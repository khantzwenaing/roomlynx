
import React from "react";
import { Room, Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Banknote, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
}

const CheckoutForm = ({ 
  checkoutDetails, 
  setCheckoutDetails, 
  customer, 
  room,
  onCompleteCheckout 
}: CheckoutFormProps) => {
  const { toast } = useToast();

  const calculateTotalStay = (currentRoom: Room, currentCustomer: Customer): number => {
    const checkInDate = new Date(currentCustomer.checkInDate);
    const checkOutDate = new Date(currentCustomer.checkOutDate);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(1, days) * currentRoom.rate;
  };

  const calculateAmountDue = (): number => {
    const totalStay = calculateTotalStay(room, customer);
    const depositAmount = customer.depositAmount || 0;
    return Math.max(0, totalStay - depositAmount);
  };

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

  return (
    <div className="mt-6 space-y-4 bg-white p-5 rounded-lg border border-gray-200">
      <h4 className="text-xl font-semibold text-gray-800">Checkout Details</h4>
      
      <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
        <div className="text-lg font-medium">Amount Due: ${calculateAmountDue()}</div>
        <div className="text-sm text-gray-600">
          (Total stay: ${calculateTotalStay(room, customer)} - Deposit: ${customer.depositAmount || 0})
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="payment-method" className="text-lg">Payment Method</Label>
        <RadioGroup 
          value={checkoutDetails.paymentMethod}
          onValueChange={(value) => setCheckoutDetails({...checkoutDetails, paymentMethod: value})}
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
        className="w-full py-6 text-xl bg-red-600 hover:bg-red-700"
        onClick={handleCompleteCheckout}
      >
        Complete Checkout
      </Button>
    </div>
  );
};

export default CheckoutForm;
