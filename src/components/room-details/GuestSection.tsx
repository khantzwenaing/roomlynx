
import React from "react";
import { Room, Customer } from "@/types";
import { User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";

interface GuestSectionProps {
  room: Room;
  customer: Customer | null;
  onRefreshData: () => void;
}

const GuestSection = ({ room, customer, onRefreshData }: GuestSectionProps) => {
  if (customer) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <User className="mr-2 text-blue-500" />
            Current Guest
          </h2>
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
                <span className="font-medium text-green-600">${customer.depositAmount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else if (room.status === "occupied") {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <User className="mr-2 text-blue-500" />
            Current Guest
          </h2>
          <div className="p-8 flex flex-col items-center justify-center">
            <p className="text-amber-600 mb-4">
              The room is marked as occupied, but no customer data was found.
            </p>
            <Button onClick={onRefreshData} variant="outline">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
              </svg>
              Refresh Data
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

export default GuestSection;
