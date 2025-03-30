
import React from "react";
import { Payment, Customer, Room } from "@/types";
import PaymentCard from "./PaymentCard";

interface PaymentListProps {
  payments: Payment[];
  customers: Customer[];
  rooms: Room[];
  searchTerm: string;
}

const PaymentList = ({ payments, customers, rooms, searchTerm }: PaymentListProps) => {
  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown";
  };

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.roomNumber : "Unknown";
  };

  const filteredPayments = payments.filter((payment) => {
    const customer = customers.find((c) => c.id === payment.customerId);
    const room = rooms.find((r) => r.id === payment.roomId);
    
    const matchesSearch = (
      (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (room && room.roomNumber.includes(searchTerm)) ||
      payment.amount.toString().includes(searchTerm)
    );
    
    return matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredPayments.map((payment) => (
        <PaymentCard 
          key={payment.id} 
          payment={payment} 
          getCustomerName={getCustomerName} 
          getRoomNumber={getRoomNumber} 
        />
      ))}
    </div>
  );
};

export default PaymentList;
