
import { Customer } from "@/types";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Banknote, CreditCard } from "lucide-react";

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  getRoomNumber: (roomId: string) => string;
}

const CustomerDetailsDialog = ({ customer, getRoomNumber }: CustomerDetailsDialogProps) => {
  if (!customer) return null;

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Customer Details</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <div className="border p-2 rounded-md bg-gray-50">
              {customer.name}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <div className="border p-2 rounded-md bg-gray-50">
              {customer.phone}
            </div>
          </div>
          {customer.email && (
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="border p-2 rounded-md bg-gray-50">
                {customer.email}
              </div>
            </div>
          )}
          {customer.address && (
            <div className="space-y-2">
              <Label>Address</Label>
              <div className="border p-2 rounded-md bg-gray-50">
                {customer.address}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Room</Label>
            <div className="border p-2 rounded-md bg-gray-50">
              Room {getRoomNumber(customer.roomId)}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Check-in / Check-out</Label>
            <div className="border p-2 rounded-md bg-gray-50">
              {new Date(customer.checkInDate).toLocaleDateString()} to {new Date(customer.checkOutDate).toLocaleDateString()}
            </div>
          </div>
          {customer.depositAmount && customer.depositAmount > 0 && (
            <div className="space-y-2">
              <Label>Deposit</Label>
              <div className="border p-2 rounded-md bg-gray-50 flex justify-between">
                <span>${customer.depositAmount}</span>
                <span className="flex items-center text-sm">
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
                <div className="text-sm text-gray-500">
                  Ref: {customer.bankRefNo}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export default CustomerDetailsDialog;
