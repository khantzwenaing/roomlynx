import React from "react";
import { Room, Customer } from "@/types";
import { format, parseISO } from "date-fns";

interface GuestDetailsListProps {
  room: Room;
  customer: Customer;
}

const GuestDetailsList = ({ room, customer }: GuestDetailsListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-gray-500">Name:</span>
        <span className="font-medium">{customer.name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Phone:</span>
        <span className="font-medium">{customer.phone}</span>
      </div>
      {customer.email && (
        <div className="flex justify-between">
          <span className="text-gray-500">Email:</span>
          <span className="font-medium">{customer.email}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-gray-500">Check-in:</span>
        <span className="font-medium">
          {format(parseISO(customer.checkInDate), "MMM dd, yyyy")}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Check-out:</span>
        <span className="font-medium">
          {format(parseISO(customer.checkOutDate), "MMM dd, yyyy")}
        </span>
      </div>
      {customer.depositAmount && customer.depositAmount > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-500">Deposit:</span>
          <span className="font-medium text-green-600">
            ₹{customer.depositAmount}
          </span>
        </div>
      )}
    </div>
  );
};

export default GuestDetailsList;
