
import React, { useState, useEffect } from "react";
import { Room, Customer } from "@/types";
import { format, parseISO } from "date-fns";
import { getGasSettings } from "@/services/settingsService";
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
  const [extraPersonChargePerDay, setExtraPersonChargePerDay] = useState(0);
  const [stayDuration, setStayDuration] = useState<number>(0);
  
  useEffect(() => {
    const loadData = async () => {
      // Calculate current stay duration
      const duration = calculateCurrentStayDuration(customer.checkInDate);
      setStayDuration(duration);
      
      // Calculate extra person charges
      if (customer.numberOfPersons > 1) {
        const settings = await getGasSettings();
        if (settings) {
          const extraPersons = Math.max(0, customer.numberOfPersons - 1);
          const chargePerDay = extraPersons * settings.extraPersonCharge;
          setExtraPersonChargePerDay(chargePerDay);
          setExtraPersonCharge(chargePerDay * duration);
        }
      }
    };
    
    loadData();
    
    // Update stay duration every minute
    const interval = setInterval(() => {
      const newDuration = calculateCurrentStayDuration(customer.checkInDate);
      setStayDuration(newDuration);
      
      // Update total extra person charge based on new duration
      if (extraPersonChargePerDay > 0) {
        setExtraPersonCharge(extraPersonChargePerDay * newDuration);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [customer, extraPersonChargePerDay]);

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
  
  // Calculate effective daily rate including extra person charges
  const effectiveDailyRate = room.rate + (customer.numberOfPersons > 1 ? extraPersonChargePerDay : 0);

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
        
        {customer.numberOfPersons > 1 && (
          <div className="text-sm text-gray-600">
            Extra person charge: ₹{extraPersonCharge} ({customer.numberOfPersons - 1} extra {customer.numberOfPersons - 1 === 1 ? 'person' : 'persons'} @ ₹{extraPersonChargePerDay}/day)
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
      
      {customer.numberOfPersons > 1 && (
        <div className="mt-2 text-sm bg-blue-50 p-2 rounded border border-blue-100">
          Effective daily rate: ₹{effectiveDailyRate}/day (Room: ₹{room.rate}/day + Extra persons: ₹{extraPersonChargePerDay}/day)
        </div>
      )}
      
      <div className="mt-2 text-sm">
        Number of persons: {customer.numberOfPersons}
      </div>
    </div>
  );
};

export default AmountSummary;
