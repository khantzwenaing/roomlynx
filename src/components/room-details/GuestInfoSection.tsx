import React from "react";
import { Room, Customer } from "@/types";
import { User, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { calculateRemainingDays } from "@/utils/date-utils";

interface GuestInfoSectionProps {
  customer: Customer;
  room: Room;
}

const GuestInfoSection = ({ customer, room }: GuestInfoSectionProps) => {
  const calculateTotalStay = (
    currentRoom: Room,
    currentCustomer: Customer
  ): number => {
    const checkInDate = new Date(currentCustomer.checkInDate);
    const checkOutDate = new Date(currentCustomer.checkOutDate);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(1, days) * currentRoom.rate;
  };

  return (
    <>
      <h3 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
        <User className="mr-2" size={22} />
        Current Guest
      </h3>
      <div className="grid grid-cols-1 gap-4 mt-3">
        <div className="p-3 bg-white rounded-lg border border-blue-100">
          <h4 className="text-sm text-blue-600 font-medium">Guest Name</h4>
          <p className="text-lg font-semibold mt-1">{customer.name}</p>
        </div>

        <div className="p-3 bg-white rounded-lg border border-blue-100">
          <h4 className="text-sm text-blue-600 font-medium">Contact</h4>
          <p className="text-lg font-medium mt-1">{customer.phone}</p>
          {customer.email && (
            <p className="text-sm text-gray-500">{customer.email}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-blue-100">
            <h4 className="text-sm text-blue-600 font-medium">Check-in</h4>
            <p className="text-lg font-medium mt-1">
              {format(new Date(customer.checkInDate), "MMM dd, yyyy")}
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-blue-100">
            <h4 className="text-sm text-blue-600 font-medium">Check-out</h4>
            <p className="text-lg font-medium mt-1 text-blue-800">
              {format(new Date(customer.checkOutDate), "MMM dd, yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center p-3 text-lg font-medium bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
          <Clock className="mr-2" size={20} />
          <span>
            {calculateRemainingDays(customer.checkOutDate) === 0
              ? "Checkout today!"
              : `${calculateRemainingDays(
                  customer.checkOutDate
                )} days until checkout`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-blue-100">
            <h4 className="text-sm text-blue-600 font-medium">Total Stay</h4>
            <p className="text-lg font-semibold mt-1 text-green-700">
              ${calculateTotalStay(room, customer)}
            </p>
          </div>

          {customer.depositAmount && (
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <h4 className="text-sm text-blue-600 font-medium">Deposit</h4>
              <p className="text-lg font-semibold mt-1 text-purple-700">
                ${customer.depositAmount}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GuestInfoSection;
