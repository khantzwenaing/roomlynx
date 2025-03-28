
import React, { useState, useEffect } from "react";
import { getCustomers, getRooms } from "@/services/dataService";
import { Customer, Room } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setCustomers(getCustomers());
    setRooms(getRooms());
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCheckoutStatus = (checkOutDate: string) => {
    const today = new Date();
    const checkout = new Date(checkOutDate);
    const diffTime = checkout.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Checked Out", color: "bg-gray-500" };
    if (diffDays === 0) return { label: "Today", color: "bg-hotel-warning" };
    if (diffDays <= 2) return { label: `${diffDays} days`, color: "bg-hotel-primary" };
    return { label: `${diffDays} days`, color: "bg-hotel-success" };
  };

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.roomNumber : "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <Button>Add New Customer</Button>
      </div>

      <div className="w-full md:w-1/2 lg:w-1/3">
        <Label htmlFor="search">Search Customers</Label>
        <Input
          id="search"
          placeholder="Search by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => {
          const checkoutStatus = getCheckoutStatus(customer.checkOutDate);
          
          return (
            <Card key={customer.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{customer.name}</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Customer Details</DialogTitle>
                      </DialogHeader>
                      {selectedCustomer && (
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label>Name</Label>
                              <div className="border p-2 rounded-md bg-gray-50">
                                {selectedCustomer.name}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Phone</Label>
                              <div className="border p-2 rounded-md bg-gray-50">
                                {selectedCustomer.phone}
                              </div>
                            </div>
                            {selectedCustomer.email && (
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <div className="border p-2 rounded-md bg-gray-50">
                                  {selectedCustomer.email}
                                </div>
                              </div>
                            )}
                            {selectedCustomer.address && (
                              <div className="space-y-2">
                                <Label>Address</Label>
                                <div className="border p-2 rounded-md bg-gray-50">
                                  {selectedCustomer.address}
                                </div>
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label>Room</Label>
                              <div className="border p-2 rounded-md bg-gray-50">
                                Room {getRoomNumber(selectedCustomer.roomId)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Check-in / Check-out</Label>
                              <div className="border p-2 rounded-md bg-gray-50">
                                {new Date(selectedCustomer.checkInDate).toLocaleDateString()} to {new Date(selectedCustomer.checkOutDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">
                    {customer.phone} {customer.email && `• ${customer.email}`}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Room {getRoomNumber(customer.roomId)}</span>
                    <Badge className={checkoutStatus.color}>
                      {checkoutStatus.label}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Check-in: {new Date(customer.checkInDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Check-out: {new Date(customer.checkOutDate).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Customers;
