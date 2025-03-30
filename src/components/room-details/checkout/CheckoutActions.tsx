
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface CheckoutActionsProps {
  onCompleteCheckout: () => void;
  onEarlyCheckoutClick: () => void;
  isEarlyCheckoutAvailable: boolean;
}

const CheckoutActions = ({ 
  onCompleteCheckout, 
  onEarlyCheckoutClick,
  isEarlyCheckoutAvailable
}: CheckoutActionsProps) => {
  return (
    <div className="flex flex-col gap-3">
      <Button 
        className="w-full py-6 text-xl bg-red-600 hover:bg-red-700"
        onClick={onCompleteCheckout}
      >
        Complete Checkout
      </Button>
      
      {isEarlyCheckoutAvailable && (
        <Button
          variant="outline"
          className="w-full py-6 text-xl border-blue-500 text-blue-600 hover:bg-blue-50"
          onClick={onEarlyCheckoutClick}
        >
          <Calendar className="mr-2" />
          Early Checkout
        </Button>
      )}
    </div>
  );
};

export default CheckoutActions;
