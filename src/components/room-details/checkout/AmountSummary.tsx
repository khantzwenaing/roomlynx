
import React, { useState, useEffect } from "react";
import { Room, Customer } from "@/types";
import { format, parseISO, isBefore } from "date-fns";
import { calculateExtraPersonsCharge } from "@/hooks/roomOperations/roomCalculations";

interface AmountSummaryProps {
  room: Room;
  customer: Customer;
  isEarlyCheckout?: boolean;
  checkOutDate?: Date;
  gasCharge?: number;
}

const AmountSummary = ({ room, customer, isEarlyCheckout, checkOutDate, gasCharge = 0 }: AmountSummaryProps) => {
  const [extraPersonCharge, setExtraPersonCharge] = useState(0);
  
  useEffect(() => {
    const loadExtraCharges = async () => {
      const personCharge = await calculateExtraPersonsCharge(customer);
      setExtraPersonCharge(personCharge);
    };
    
    loadExtraCharges();
  }, [customer]);

  const calculateTotalStay = (): number => {
    const checkInDate = new Date(customer.checkInDate);
    const checkOutDateValue = new Date(customer.checkOutDate);
    const timeDiff = checkOutDateValue.getTime() - checkInDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(1, days) * room.rate;
  };

  const calculateAmountDue = (): number => {
    const totalStay = calculateTotalStay();
    const depositAmount = customer.depositAmount || 0;
    return Math.max(0, totalStay + extraPersonCharge + gasCharge - depositAmount);
  };

  // Calculate total with all charges
  const totalWithAllCharges = calculateTotalStay() + extraPersonCharge + gasCharge;

  // Check if early checkout and show original checkout date
  const originalCheckOut = parseISO(customer.checkOutDate);
  const today = new Date();
  const isEarlyCheckoutPossible = isBefore(today, originalCheckOut);

  return (
    <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
      <div className="text-lg font-medium">Amount Due: ${calculateAmountDue()}</div>
      <div className="space-y-1 mt-1">
        <div className="text-sm text-gray-600">
          Room charge: ${calculateTotalStay()}
        </div>
        
        {extraPersonCharge > 0 && (
          <div className="text-sm text-gray-600">
            Extra person charge: ${extraPersonCharge}
          </div>
        )}
        
        {gasCharge > 0 && (
          <div className="text-sm text-gray-600">
            Gas usage charge: ${gasCharge}
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          Deposit: -${customer.depositAmount || 0}
        </div>
        
        <div className="text-sm font-medium border-t pt-1 mt-1">
          Total: ${totalWithAllCharges} - Deposit: ${customer.depositAmount || 0} = ${calculateAmountDue()}
        </div>
      </div>
      
      {isEarlyCheckoutPossible && (
        <div className="mt-2 text-sm text-blue-600">
          Early checkout available. Original checkout: {format(originalCheckOut, 'PPP')}
        </div>
      )}
      
      {customer.numberOfPersons > 0 && (
        <div className="mt-2 text-sm">
          Number of persons: {customer.numberOfPersons}
        </div>
      )}
    </div>
  );
};

export default AmountSummary;
