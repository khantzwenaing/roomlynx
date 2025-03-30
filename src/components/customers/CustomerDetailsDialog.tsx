
import { Customer } from "@/types";
import { format, parseISO } from "date-fns";
import { User, Phone, Mail, Home, Clock, CreditCard, Banknote, Calendar, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  getRoomNumber: (roomId: string) => string;
  showAsDrawer?: boolean;
}

const CustomerDetailsDialog = ({ customer, getRoomNumber, showAsDrawer = false }: CustomerDetailsDialogProps) => {
  if (!customer) return null;

  const containerClass = showAsDrawer 
    ? "space-y-6" 
    : "space-y-6 p-6";

  const getStayStatusBadge = (checkOutDate: string) => {
    const today = new Date();
    const checkout = new Date(checkOutDate);
    const diffTime = checkout.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Checked Out", color: "bg-gray-500 text-white" };
    if (diffDays === 0) return { label: "Checkout Today", color: "bg-amber-500 text-white" };
    if (diffDays <= 2) return { label: `${diffDays} days remaining`, color: "bg-blue-500 text-white" };
    return { label: `${diffDays} days remaining`, color: "bg-green-500 text-white" };
  };

  const stayStatus = getStayStatusBadge(customer.checkOutDate);

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">{customer.name}</h2>
        <Badge className={`mt-2 ${stayStatus.color}`}>
          {stayStatus.label}
        </Badge>
      </div>

      <div className="grid gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-3 text-gray-800 flex items-center">
            <Home className="mr-2 text-blue-500" />
            Room Information
          </h3>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Room Number:</span>
            <span className="font-medium">{getRoomNumber(customer.roomId)}</span>
          </div>
          <Link 
            to={`/rooms?roomId=${customer.roomId}`}
            className="text-blue-600 hover:underline inline-flex items-center mt-1"
          >
            <Clock className="mr-1" size={16} />
            View Room Details
          </Link>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-3 text-gray-800 flex items-center">
            <Phone className="mr-2 text-blue-500" />
            Contact Information
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Phone:</span>
              <span className="font-medium">{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium">{customer.email}</span>
              </div>
            )}
            {customer.idNumber && (
              <div className="flex justify-between">
                <span className="text-gray-500">ID Number:</span>
                <span className="font-medium">{customer.idNumber}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-3 text-gray-800 flex items-center">
            <Calendar className="mr-2 text-blue-500" />
            Stay Details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded border border-blue-100">
              <span className="text-xs text-blue-600">Check-in Date</span>
              <div className="font-medium">
                {format(parseISO(customer.checkInDate), "MMM dd, yyyy")}
              </div>
            </div>
            <div className="p-3 bg-white rounded border border-blue-100">
              <span className="text-xs text-blue-600">Check-out Date</span>
              <div className="font-medium">
                {format(parseISO(customer.checkOutDate), "MMM dd, yyyy")}
              </div>
            </div>
          </div>
        </div>

        {customer.depositAmount && customer.depositAmount > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-3 text-gray-800 flex items-center">
              {customer.depositPaymentMethod === 'cash' ? (
                <Banknote className="mr-2 text-green-500" />
              ) : (
                <CreditCard className="mr-2 text-green-500" />
              )}
              Payment Information
            </h3>
            <div className="flex justify-between">
              <span className="text-gray-500">Deposit Amount:</span>
              <span className="font-medium text-green-600">${customer.depositAmount}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-500">Payment Method:</span>
              <span className="font-medium capitalize">
                {customer.depositPaymentMethod?.replace('_', ' ')}
              </span>
            </div>
            {customer.depositPaymentMethod === 'bank_transfer' && customer.bankRefNo && (
              <div className="flex justify-between mt-1">
                <span className="text-gray-500">Bank Reference:</span>
                <span className="font-medium">{customer.bankRefNo}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-2">
          <Button
            className="w-full bg-red-600 hover:bg-red-700"
            onClick={() => {
              window.location.href = `/rooms?roomId=${customer.roomId}&action=checkout`;
            }}
          >
            <CreditCard className="mr-2" />
            Checkout & Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsDialog;
