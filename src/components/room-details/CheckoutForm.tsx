import React from "react";
import { Room, Customer } from "@/types";
import EarlyCheckoutDialog from "./checkout/EarlyCheckoutDialog";

interface EarlyCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
  customer: Customer;
  onEarlyCheckout: (
    actualCheckoutDate: string,
    refundAmount: number,
    refundDetails: {
      method: 'cash' | 'bank_transfer' | 'other',
      collectedBy: string,
      notes?: string
    }
  ) => Promise<void>;
  gasCharge?: number;
  extraPersonCharge?: number;
}

const CheckoutForm = ({ 
  checkoutDetails, 
  setCheckoutDetails, 
  customer, 
  room,
  onCompleteCheckout,
  onEarlyCheckout
}: {
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
}) => {
  const { toast } = useToast();
  const [showEarlyCheckoutDialog, setShowEarlyCheckoutDialog] = useState(false);
  const [gasCharge, setGasCharge] = useState(0);
  const [finalGasWeight, setFinalGasWeight] = useState(0);
  const [extraPersonCharge, setExtraPersonCharge] = useState(0);
  
  useEffect(() => {
    const loadExtraCharges = async () => {
      if (customer) {
        const personCharge = await calculateExtraPersonsCharge(customer);
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
    
    // If gas is being used but no final weight entered, show an error
    if (customer.hasGas && customer.initialGasWeight && gasCharge === 0) {
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
    
    // Update the checkout details with gas usage information
    setCheckoutDetails(prev => ({
      ...prev,
      gasCharge: charge,
      finalGasWeight: weight
    }));
  };

  return (
    <div className="mt-6 space-y-4 bg-white p-5 rounded-lg border border-gray-200">
      <h4 className="text-xl font-semibold text-gray-800">Checkout Details</h4>
      
      <AmountSummary 
        room={room} 
        customer={customer}
        gasCharge={gasCharge}
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
        isEarlyCheckoutAvailable={isBefore(new Date(), parseISO(customer.checkOutDate)) && !!onEarlyCheckout}
      />
      
      {/* Early Checkout Dialog */}
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
