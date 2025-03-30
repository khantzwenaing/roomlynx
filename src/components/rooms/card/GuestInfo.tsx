
import React from "react";
import { Link } from "react-router-dom";
import { User, Clock } from "lucide-react";
import { Customer, Room } from "@/types";
import { calculateRemainingDays } from "@/utils/date-utils";

interface GuestInfoProps {
  customer: Customer;
}

const GuestInfo = ({ customer }: GuestInfoProps) => {
  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <User className="mr-2" size={20} />
        Current Guest
      </h3>
      <div className="space-y-2">
        <div className="font-medium text-lg">{customer.name}</div>
        <div>{customer.phone}</div>
        <div className="text-sm text-gray-600">
          Check-in: {new Date(customer.checkInDate).toLocaleDateString()}
        </div>
        <div className="text-sm font-semibold text-blue-800">
          Check-out: {new Date(customer.checkOutDate).toLocaleDateString()}
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
