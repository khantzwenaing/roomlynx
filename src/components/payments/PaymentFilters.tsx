
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogIn, LogOut, WalletCards } from "lucide-react";

interface PaymentFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  paymentTypeFilter: string;
  setPaymentTypeFilter: (value: string) => void;
}

const PaymentFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  paymentTypeFilter, 
  setPaymentTypeFilter 
}: PaymentFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
      <div className="w-full md:w-1/3">
        <Label htmlFor="search">Search Payments</Label>
        <Input
          id="search"
          placeholder="Search by customer, room or amount..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="w-full md:w-1/4">
        <Label htmlFor="payment-type-filter">Filter by Type</Label>
        <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Payment Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center">
                <WalletCards className="mr-2" size={16} />
                All Payments
              </div>
            </SelectItem>
            <SelectItem value="deposit">
              <div className="flex items-center">
                <LogIn className="mr-2" size={16} />
                Check-in Deposits
              </div>
            </SelectItem>
            <SelectItem value="checkout">
              <div className="flex items-center">
                <LogOut className="mr-2" size={16} />
                Checkout Payments
              </div>
            </SelectItem>
            <SelectItem value="other">
              <div className="flex items-center">
                <WalletCards className="mr-2" size={16} />
                Other Payments
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PaymentFilters;
