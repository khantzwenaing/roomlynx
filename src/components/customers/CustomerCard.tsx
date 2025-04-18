import { Customer, Room } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Eye, Clock, Banknote, Home } from "lucide-react";
import CustomerDetailsDialog from "./CustomerDetailsDialog";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

interface CustomerCardProps {
  customer: Customer;
  rooms: Room[];
}

export const CustomerCard = ({ customer, rooms }: CustomerCardProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const navigate = useNavigate();

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
    if (diffDays <= 2)
      return { label: `${diffDays} days`, color: "bg-hotel-primary" };
    return { label: `${diffDays} days`, color: "bg-hotel-success" };
  };

  const checkoutStatus = getCheckoutStatus(customer.checkOutDate);

  const handleViewDetails = () => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  const handleRoomDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/room-details?roomId=${customer.roomId}`);
  };

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate directly to the rooms page with checkout action
    navigate(`/rooms?roomId=${customer.roomId}&action=checkout`);
  };

  const handleCloseDrawer = () => {
    setIsDetailsOpen(false);
  };

  return (
    <Card key={customer.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{customer.name}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="flex items-center"
          >
            <Eye className="mr-1 h-4 w-4" />
            View
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-gray-500">
            {customer.phone} {customer.email && `• ${customer.email}`}
          </div>

          <div className="flex justify-between text-sm items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRoomDetailsClick}
              className="p-0 h-auto hover:bg-transparent hover:underline"
            >
              <Home className="mr-1 h-3 w-3" />
              Room {getRoomNumber(customer.roomId)}
            </Button>
            <Badge className={`${checkoutStatus.color} flex items-center`}>
              <Clock className="mr-1 h-3 w-3" />
              {checkoutStatus.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <div className="text-xs text-gray-500">Check-in</div>
              <div>
                {format(parseISO(customer.checkInDate), "MMM dd, yyyy")}
              </div>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <div className="text-xs text-gray-500">Check-out</div>
              <div>
                {format(parseISO(customer.checkOutDate), "MMM dd, yyyy")}
              </div>
            </div>
          </div>

          {customer.depositAmount && customer.depositAmount > 0 && (
            <div className="text-sm text-green-600 mt-2 flex items-center">
              {customer.depositPaymentMethod === "cash" && (
                <Banknote className="mr-1" size={14} />
              )}
              {customer.depositPaymentMethod === "card" && (
                <CreditCard className="mr-1" size={14} />
              )}
              {customer.depositPaymentMethod === "bank_transfer" && (
                <CreditCard className="mr-1" size={14} />
              )}
              Deposit: ₹{customer.depositAmount}
            </div>
          )}

          <Button
            className="mt-2 w-full bg-red-600 hover:bg-red-700"
            size="sm"
            onClick={handleCheckoutClick}
          >
            <CreditCard className="mr-1 h-4 w-4" />
            Checkout & Payment
          </Button>
        </div>
      </CardContent>

      <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          <DrawerHeader className="border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-xl">Customer Details</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm">
                  Close
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="p-6">
            {selectedCustomer && (
              <CustomerDetailsDialog
                customer={selectedCustomer}
                getRoomNumber={getRoomNumber}
                showAsDrawer={true}
                onClose={handleCloseDrawer}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </Card>
  );
};

export default CustomerCard;
