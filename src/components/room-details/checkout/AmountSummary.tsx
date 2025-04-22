
import React, { useState, useEffect } from "react";
import { Room, Customer } from "@/types";
import { format, parseISO, isBefore } from "date-fns";
import { calculateExtraPersonCharge } from "@/services/settingsService";
import { calculateCurrentStayDuration, formatStayDuration } from "@/utils/date-utils";

interface AmountSummaryProps {
  room: Room;
  customer: Customer;
  isEarlyCheckout?: boolean;
  checkOutDate?: Date;
  gasCharge?: number;
}

const AmountSummary = ({ room, customer, isEarlyCheckout, checkOutDate, gasCharge = 0 }: AmountSummaryProps) => {
  const [extraPersonCharge, setExtraPersonCharge] = useState(0);
  const [stayDuration, setStayDuration] = useState<number>(0);
  
  useEffect(() => {
    const loadData = async () => {
      // Calculate current stay duration
      const duration = calculateCurrentStayDuration(customer.checkInDate);
      setStayDuration(duration);
      
      // Calculate extra person charges
      const personCharge = await calculateExtraPersonCharge(customer);
      setExtraPersonCharge(personCharge);
    };
    
    loadData();
    
    // Update stay duration every minute
    const interval = setInterval(() => {
      setStayDuration(calculateCurrentStayDuration(customer.checkInDate));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [customer]);

  const calculateTotalStay = (): number => {
    return stayDuration * room.rate;
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
      <div className="text-lg font-medium mb-1">
        Stay Duration: {formatStayDuration(stayDuration)}
      </div>
      <div className="text-lg font-medium">Amount Due: ₹{calculateAmountDue()}</div>
      <div className="space-y-1 mt-1">
        <div className="text-sm text-gray-600">
          Room charge: ₹{calculateTotalStay()} ({formatStayDuration(stayDuration)} @ ₹{room.rate}/day)
        </div>
        
        {extraPersonCharge > 0 && (
          <div className="text-sm text-gray-600">
            Extra person charge: ₹{extraPersonCharge}
          </div>
        )}
        
        {gasCharge > 0 && (
          <div className="text-sm text-gray-600">
            Gas usage charge: ₹{gasCharge}
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          Deposit: -₹{customer.depositAmount || 0}
        </div>
        
        <div className="text-sm font-medium border-t pt-1 mt-1">
          Total: ₹{totalWithAllCharges} - Deposit: ₹{customer.depositAmount || 0} = ₹{calculateAmountDue()}
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
