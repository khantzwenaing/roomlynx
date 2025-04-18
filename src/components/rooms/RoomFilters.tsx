
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface RoomFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

const RoomFilters = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }: RoomFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="search" className="text-lg mb-2 block">Search Room</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            id="search"
            placeholder="Search by room number, type, customer name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-lg h-12 pl-10"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Find rooms by number, type, customer name or phone number
        </p>
      </div>
      <div>
        <Label htmlFor="status-filter" className="text-lg mb-2 block">Room Status</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="text-lg h-12">
            <SelectValue placeholder="All Rooms" />
          </SelectTrigger>
          <SelectContent className="text-lg">
            <SelectItem value="all">All Rooms</SelectItem>
            <SelectItem value="vacant">Available Rooms</SelectItem>
            <SelectItem value="occupied">Occupied Rooms</SelectItem>
            <SelectItem value="cleaning">Rooms To Clean</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RoomFilters;
