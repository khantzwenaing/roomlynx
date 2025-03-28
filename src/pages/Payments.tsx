
import React, { useState, useEffect } from "react";
import { getPayments, getCustomers, getRooms } from "@/services/dataService";
import { Payment, Customer, Room } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setPayments(getPayments());
    setCustomers(getCustomers());
    setRooms(getRooms());
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const customer = customers.find((c) => c.id === payment.customerId);
    const room = rooms.find((r) => r.id === payment.roomId);
    
    return (
      (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (room && room.roomNumber.includes(searchTerm)) ||
      payment.amount.toString().includes(searchTerm)
    );
  });

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown";
  };

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.roomNumber : "Unknown";
  };

  const getPaymentStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return "bg-hotel-success";
      case "pending":
        return "bg-hotel-warning";
      case "partial":
        return "bg-hotel-primary";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
        <Button>Add New Payment</Button>
      </div>

      <div className="w-full md:w-1/2 lg:w-1/3">
        <Label htmlFor="search">Search Payments</Label>
        <Input
          id="search"
          placeholder="Search by customer, room or amount..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">${payment.amount}</CardTitle>
                <Badge className={getPaymentStatusColor(payment.status)}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {getCustomerName(payment.customerId)}
                </div>
                <div className="text-sm text-gray-500">
                  Room {getRoomNumber(payment.roomId)}
                </div>
                <div className="text-sm text-gray-500">
                  Date: {new Date(payment.date).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-500">
                  Method: {payment.method.replace('_', ' ').charAt(0).toUpperCase() + payment.method.replace('_', ' ').slice(1)}
                </div>
                <div className="text-sm text-gray-500">
                  Collected by: {payment.collectedBy}
                </div>
                {payment.notes && (
                  <div className="text-sm text-gray-500">
                    Notes: {payment.notes}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Payments;
