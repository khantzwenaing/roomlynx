
import React from "react";
import { Room, Customer } from "@/types";
import { format, parseISO, isBefore } from "date-fns";

interface AmountSummaryProps {
  room: Room;
  customer: Customer;
  isEarlyCheckout?: boolean;
  checkOutDate?: Date;
}

const AmountSummary = ({ room, customer, isEarlyCheckout, checkOutDate }: AmountSummaryProps) => {
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
    return Math.max(0, totalStay - depositAmount);
  };

  // Check if early checkout and show original checkout date
  const originalCheckOut = parseISO(customer.checkOutDate);
  const today = new Date();
  const isEarlyCheckoutPossible = isBefore(today, originalCheckOut);

  return (
    <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
      <div className="text-lg font-medium">Amount Due: ${calculateAmountDue()}</div>
      <div className="text-sm text-gray-600">
        (Total stay: ${calculateTotalStay()} - Deposit: ${customer.depositAmount || 0})
      </div>
      
      {isEarlyCheckoutPossible && (
        <div className="mt-2 text-sm text-blue-600">
          Early checkout available. Original checkout: {format(originalCheckOut, 'PPP')}
        </div>
      )}
    </div>
  );
};

export default AmountSummary;
