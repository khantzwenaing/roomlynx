
import { Customer } from "@/types";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Banknote, CreditCard, User, Phone, Mail, MapPin, Calendar, Home } from "lucide-react";
import { format, parseISO } from "date-fns";

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  getRoomNumber: (roomId: string) => string;
}

const CustomerDetailsDialog = ({ customer, getRoomNumber }: CustomerDetailsDialogProps) => {
  if (!customer) return null;

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="text-xl flex items-center">
          <User className="mr-2 h-5 w-5" />
          Customer Details
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-5 py-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <Label className="text-sm text-gray-500">Name</Label>
              </div>
              <div className="text-lg font-medium">{customer.name}</div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-gray-500" />
                <Label className="text-sm text-gray-500">Phone</Label>
              </div>
              <div className="text-lg font-medium">{customer.phone}</div>
            </div>
          </div>
          
          {customer.email && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <Label className="text-sm text-gray-500">Email</Label>
                </div>
                <div className="text-lg font-medium">{customer.email}</div>
              </div>
            </div>
          )}
          
          {customer.address && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <Label className="text-sm text-gray-500">Address</Label>
                </div>
                <div className="text-lg font-medium">{customer.address}</div>
              </div>
            </div>
          )}
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-gray-500" />
                <Label className="text-sm text-gray-500">Room</Label>
              </div>
              <div className="text-lg font-medium">Room {getRoomNumber(customer.roomId)}</div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <Label className="text-sm text-gray-500">Check-in / Check-out</Label>
              </div>
              <div className="text-lg font-medium">
                {format(parseISO(customer.checkInDate), "MMM dd, yyyy")} to {format(parseISO(customer.checkOutDate), "MMM dd, yyyy")}
              </div>
            </div>
          </div>
          
          {customer.depositAmount && customer.depositAmount > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <Label className="text-sm text-gray-500">Deposit</Label>
                </div>
                <div className="flex justify-between text-lg font-medium">
                  <span>${customer.depositAmount}</span>
                  <span className="flex items-center text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    {customer.depositPaymentMethod === 'cash' && (
                      <><Banknote size={14} className="mr-1" /> Cash</>
                    )}
                    {customer.depositPaymentMethod === 'card' && (
                      <><CreditCard size={14} className="mr-1" /> Card</>
                    )}
                    {customer.depositPaymentMethod === 'bank_transfer' && (
                      <><CreditCard size={14} className="mr-1" /> Bank Transfer</>
                    )}
                  </span>
                </div>
                {customer.depositPaymentMethod === 'bank_transfer' && customer.bankRefNo && (
                  <div className="text-sm text-gray-500 mt-1 bg-gray-100 p-2 rounded-md">
                    Reference: {customer.bankRefNo}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export default CustomerDetailsDialog;
