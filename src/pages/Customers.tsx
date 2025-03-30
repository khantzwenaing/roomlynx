
import React, { useState, useEffect } from "react";
import { getCustomers, getRooms } from "@/services/dataService";
import { Customer, Room } from "@/types";
import CustomerCard from "@/components/customers/CustomerCard";
import CustomerSearch from "@/components/customers/CustomerSearch";
import AddCustomerDialog from "@/components/customers/AddCustomerDialog";

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCustomers(getCustomers());
    setRooms(getRooms());
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCustomerAdded = (newCustomer: Customer) => {
    setCustomers([...customers, newCustomer]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <AddCustomerDialog rooms={rooms} onCustomerAdded={handleCustomerAdded} />
      </div>

      <CustomerSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <CustomerCard 
            key={customer.id}
            customer={customer}
            rooms={rooms}
          />
        ))}
      </div>
    </div>
  );
};

export default Customers;
