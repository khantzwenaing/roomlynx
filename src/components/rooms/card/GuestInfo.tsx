
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Clock, Calendar } from "lucide-react";
import { Customer, Room } from "@/types";
import { calculateRemainingDays, calculateCurrentStayDuration, formatStayDuration } from "@/utils/date-utils";

interface GuestInfoProps {
  customer: Customer;
}

const GuestInfo = ({ customer }: GuestInfoProps) => {
  const [stayDuration, setStayDuration] = useState<number>(0);
  
  useEffect(() => {
    // Calculate initial stay duration
    setStayDuration(calculateCurrentStayDuration(customer.checkInDate));
    
    // Update stay duration every minute
    const interval = setInterval(() => {
      setStayDuration(calculateCurrentStayDuration(customer.checkInDate));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [customer.checkInDate]);

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <User className="mr-2" size={20} />
        Current Guest
      </h3>
      <div className="space-y-2">
        <div className="font-medium text-lg">{customer.name}</div>
        <div>{customer.phone}</div>
        <div className="text-sm text-gray-600 flex items-center">
          <Calendar className="mr-1" size={16} />
          Check-in: {new Date(customer.checkInDate).toLocaleDateString()}
        </div>
        <div className="text-sm font-semibold text-blue-800 flex items-center">
          <Calendar className="mr-1" size={16} />
          Check-out: {new Date(customer.checkOutDate).toLocaleDateString()}
        </div>
        
        <div className="flex items-center mt-1 text-sm font-medium bg-purple-50 text-purple-800 p-2 rounded-md border border-purple-200">
          <Clock className="mr-2" size={16} />
          <span>Current stay: {formatStayDuration(stayDuration)}</span>
        </div>
        
        <div className="flex items-center mt-1 text-sm font-medium bg-yellow-50 text-yellow-800 p-2 rounded-md border border-yellow-200">
          <Clock className="mr-2" size={16} />
          <span>
            {calculateRemainingDays(customer.checkOutDate) === 0 
              ? "Checkout today!" 
              : `${calculateRemainingDays(customer.checkOutDate)} days until checkout`}
          </span>
        </div>
        
        <Link 
          to={`/customers?id=${customer.id}`} 
          className="text-blue-600 hover:underline block text-lg font-medium mt-2"
        >
          View Customer Details
        </Link>
      </div>
    </div>
  );
};

export default GuestInfo;
