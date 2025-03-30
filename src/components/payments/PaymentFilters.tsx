
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const PaymentFilters = ({ 
  searchTerm, 
  setSearchTerm
}: PaymentFiltersProps) => {
  return (
    <div className="w-full">
      <div className="w-full md:w-1/3">
        <Label htmlFor="search">Search Payments</Label>
        <Input
          id="search"
          placeholder="Search by customer, room or amount..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default PaymentFilters;
