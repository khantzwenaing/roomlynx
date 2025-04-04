
import React from "react";
import { Button } from "@/components/ui/button";

interface CheckoutActionsProps {
  onCompleteCheckout: () => void;
  onEarlyCheckoutClick?: () => void;
  isEarlyCheckoutAvailable?: boolean;
  disabled?: boolean;
}

const CheckoutActions = ({ 
  onCompleteCheckout, 
  onEarlyCheckoutClick,
  isEarlyCheckoutAvailable,
  disabled 
}: CheckoutActionsProps) => {
  return (
    <div className="space-y-3">
      <Button 
        onClick={onCompleteCheckout} 
        className="w-full py-6 text-xl bg-red-600 hover:bg-red-700"
        disabled={disabled}
      >
        Complete Checkout
      </Button>
      
      {isEarlyCheckoutAvailable && onEarlyCheckoutClick && (
        <Button 
          onClick={onEarlyCheckoutClick}
          variant="outline" 
          className="w-full"
        >
          Process Early Checkout
        </Button>
      )}
    </div>
  );
};

export default CheckoutActions;
