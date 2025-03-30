
import React, { useState } from "react";
import { Room, Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Banknote, CreditCard, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isBefore } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";

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
  const [earlyCheckoutDate, setEarlyCheckoutDate] = useState<Date | undefined>(new Date());
  const [refundDetails, setRefundDetails] = useState({
    method: 'cash' as 'cash' | 'bank_transfer' | 'other',
    collectedBy: '',
    notes: '',
    bankRefNo: ''
  });

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

  const calculateRefundAmount = (): number => {
    if (!earlyCheckoutDate) return 0;
    
    const originalCheckoutDate = new Date(customer.checkOutDate);
    const checkInDate = new Date(customer.checkInDate);
    
    // Calculate days stayed based on early checkout
    const actualDaysStayed = Math.ceil(
      (earlyCheckoutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
    );
    
    // Calculate original planned days
    const originalDays = Math.ceil(
      (originalCheckoutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
    );
    
    // Calculate days not staying
    const daysNotStaying = Math.max(0, originalDays - actualDaysStayed);
    
    // Calculate refund amount
    const refundAmount = daysNotStaying * room.rate;
    
    // Check if the refund is valid
    if (isBefore(earlyCheckoutDate, checkInDate)) return 0;
    
    return refundAmount;
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

  const handleEarlyCheckout = async () => {
    if (!onEarlyCheckout || !earlyCheckoutDate) {
      toast({
        title: "Error",
        description: "Early checkout functionality is not available",
        variant: "destructive"
      });
      return;
    }
    
    if (!refundDetails.collectedBy) {
      toast({
        title: "Error",
        description: "Please enter who is processing the refund",
        variant: "destructive"
      });
      return;
    }
    
    if (refundDetails.method === 'bank_transfer' && !refundDetails.bankRefNo) {
      toast({
        title: "Error",
        description: "Please enter bank reference number for the refund",
        variant: "destructive"
      });
      return;
    }
    
    const refundAmount = calculateRefundAmount();
    await onEarlyCheckout(
      earlyCheckoutDate.toISOString(),
      refundAmount,
      {
        method: refundDetails.method,
        collectedBy: refundDetails.collectedBy,
        notes: refundDetails.notes
      }
    );
    
    setShowEarlyCheckoutDialog(false);
  };

  const checkOutDate = parseISO(customer.checkOutDate);
  const today = new Date();
  const isEarlyCheckout = isBefore(today, checkOutDate);

  return (
    <div className="mt-6 space-y-4 bg-white p-5 rounded-lg border border-gray-200">
      <h4 className="text-xl font-semibold text-gray-800">Checkout Details</h4>
      
      <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
        <div className="text-lg font-medium">Amount Due: ${calculateAmountDue()}</div>
        <div className="text-sm text-gray-600">
          (Total stay: ${calculateTotalStay(room, customer)} - Deposit: ${customer.depositAmount || 0})
        </div>
        {isEarlyCheckout && (
          <div className="mt-2 text-sm text-blue-600">
            Early checkout available. Original checkout: {format(checkOutDate, 'PPP')}
          </div>
        )}
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
      
      <div className="flex flex-col gap-3">
        <Button 
          className="w-full py-6 text-xl bg-red-600 hover:bg-red-700"
          onClick={handleCompleteCheckout}
        >
          Complete Checkout
        </Button>
        
        {isEarlyCheckout && onEarlyCheckout && (
          <Button
            variant="outline"
            className="w-full py-6 text-xl border-blue-500 text-blue-600 hover:bg-blue-50"
            onClick={() => setShowEarlyCheckoutDialog(true)}
          >
            <Calendar className="mr-2" />
            Early Checkout
          </Button>
        )}
      </div>
      
      {/* Early Checkout Dialog */}
      <Dialog open={showEarlyCheckoutDialog} onOpenChange={setShowEarlyCheckoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Early Checkout & Refund</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="checkout-date">Actual Checkout Date</Label>
              <DatePicker 
                date={earlyCheckoutDate} 
                setDate={setEarlyCheckoutDate}
                className="w-full"
              />
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-md">
              <p className="font-medium">Refund Amount: ${calculateRefundAmount()}</p>
              <p className="text-sm text-gray-600">
                Based on {earlyCheckoutDate ? format(earlyCheckoutDate, 'PPP') : 'today'} checkout 
                (Original: {format(checkOutDate, 'PPP')})
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="refund-method">Refund Method</Label>
              <RadioGroup 
                value={refundDetails.method}
                onValueChange={(value: 'cash' | 'bank_transfer' | 'other') => 
                  setRefundDetails({...refundDetails, method: value})}
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
                  onChange={(e) => setRefundDetails({...refundDetails, bankRefNo: e.target.value})}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="refund-by">Processed By</Label>
              <Input
                id="refund-by"
                placeholder="Enter staff name"
                value={refundDetails.collectedBy}
                onChange={(e) => setRefundDetails({...refundDetails, collectedBy: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="refund-notes">Notes</Label>
              <Textarea
                id="refund-notes"
                placeholder="Add any additional notes about this refund"
                value={refundDetails.notes}
                onChange={(e) => setRefundDetails({...refundDetails, notes: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEarlyCheckoutDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEarlyCheckout}
              disabled={calculateRefundAmount() <= 0 || !refundDetails.collectedBy}
            >
              Process Early Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutForm;

