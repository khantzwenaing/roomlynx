
import React, { useState, useEffect } from "react";
import { getCustomers, getRooms } from "@/services/dataService";
import { Customer, Room } from "@/types";
import CustomerCard from "@/components/customers/CustomerCard";
import CustomerSearch from "@/components/customers/CustomerSearch";
import AddCustomerDialog from "@/components/customers/AddCustomerDialog";
import { useToast } from "@/hooks/use-toast";

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const customersData = await getCustomers();
        const roomsData = await getRooms();
        setCustomers(customersData);
        setRooms(roomsData);
      } catch (error) {
        console.error("Error loading customer data:", error);
        toast({
          title: "Error",
          description: "Failed to load customer data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

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

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-500">Loading customers...</div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-xl text-gray-500">No customers found</div>
          {searchTerm ? (
            <div className="mt-2 text-gray-400">Try adjusting your search criteria</div>
          ) : (
            <div className="mt-2 text-gray-400">Add your first customer to get started</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard 
              key={customer.id}
              customer={customer}
              rooms={rooms}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Customers;
