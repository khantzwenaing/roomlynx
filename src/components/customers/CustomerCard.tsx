
import { Customer, Room } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Banknote, CreditCard } from "lucide-react";
import CustomerDetailsDialog from "./CustomerDetailsDialog";
import { useState } from "react";

interface CustomerCardProps {
  customer: Customer;
  rooms: Room[];
}

export const CustomerCard = ({ customer, rooms }: CustomerCardProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.roomNumber : "Unknown";
  };

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
            <CustomerDetailsDialog 
              customer={selectedCustomer} 
              getRoomNumber={getRoomNumber} 
            />
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
          {customer.depositAmount && customer.depositAmount > 0 && (
            <div className="text-sm text-green-600 mt-2">
              Deposit: ${customer.depositAmount}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerCard;
