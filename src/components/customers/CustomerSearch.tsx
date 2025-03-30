
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const CustomerSearch = ({ searchTerm, onSearchChange }: CustomerSearchProps) => {
  return (
    <div className="w-full md:w-1/2 lg:w-1/3">
      <Label htmlFor="search">Search Customers</Label>
      <Input
        id="search"
        placeholder="Search by name, email or phone..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default CustomerSearch;
