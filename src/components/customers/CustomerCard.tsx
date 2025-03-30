
import { Customer, Room } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Banknote, CreditCard, Eye, Clock } from "lucide-react";
import CustomerDetailsDialog from "./CustomerDetailsDialog";
import { useState } from "react";
import { format, parseISO } from "date-fns";

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
    <Card key={customer.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{customer.name}</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedCustomer(customer)}
                className="flex items-center"
              >
                <Eye className="mr-1 h-4 w-4" />
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
        <div className="space-y-3">
          <div className="text-sm text-gray-500">
            {customer.phone} {customer.email && `• ${customer.email}`}
          </div>
          
          <div className="flex justify-between text-sm items-center">
            <span className="font-medium">Room {getRoomNumber(customer.roomId)}</span>
            <Badge className={`${checkoutStatus.color} flex items-center`}>
              <Clock className="mr-1 h-3 w-3" />
              {checkoutStatus.label}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <div className="text-xs text-gray-500">Check-in</div>
              <div>{format(parseISO(customer.checkInDate), "MMM dd, yyyy")}</div>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <div className="text-xs text-gray-500">Check-out</div>
              <div>{format(parseISO(customer.checkOutDate), "MMM dd, yyyy")}</div>
            </div>
          </div>
          
          {customer.depositAmount && customer.depositAmount > 0 && (
            <div className="text-sm text-green-600 mt-2 flex items-center">
              {customer.depositPaymentMethod === 'cash' && (
                <Banknote className="mr-1" size={14} />
              )}
              {customer.depositPaymentMethod === 'card' && (
                <CreditCard className="mr-1" size={14} />
              )}
              {customer.depositPaymentMethod === 'bank_transfer' && (
                <CreditCard className="mr-1" size={14} />
              )}
              Deposit: ${customer.depositAmount}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerCard;
