
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Room, Customer } from "@/types";
import { User, CreditCard, Pencil } from "lucide-react";
import { Link } from "react-router-dom";

interface RoomDetailsDialogProps {
  room: Room | null;
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onEdit: () => void;
}

const RoomDetailsDialog = ({
  room,
  customer,
  isOpen,
  onClose,
  onCheckout,
  onEdit,
}: RoomDetailsDialogProps) => {
  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            Room {room.roomNumber}
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div className="font-semibold">Type:</div>
            <div>{room.type.charAt(0).toUpperCase() + room.type.slice(1)}</div>
            
            <div className="font-semibold">Rate:</div>
            <div>${room.rate}/night</div>
            
            <div className="font-semibold">Status:</div>
            <div>{room.status.charAt(0).toUpperCase() + room.status.slice(1)}</div>
            
            {room.lastCleaned && (
              <>
                <div className="font-semibold">Last Cleaned:</div>
                <div>{new Date(room.lastCleaned).toLocaleDateString()}</div>
                
                <div className="font-semibold">Cleaned By:</div>
                <div>{room.cleanedBy}</div>
              </>
            )}
          </div>

          {customer && room.status === "occupied" && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <User className="mr-2" size={20} />
                Current Guest
              </h3>
              <div className="space-y-2">
                <div className="font-medium text-lg">{customer.name}</div>
                <div>{customer.phone}</div>
                {customer.email && <div>{customer.email}</div>}
                <div className="text-sm text-gray-600">
                  Check-in: {new Date(customer.checkInDate).toLocaleDateString()}
                </div>
                <div className="text-sm font-semibold text-blue-800">
                  Check-out: {new Date(customer.checkOutDate).toLocaleDateString()}
                </div>
                <Link 
                  to={`/customers?id=${customer.id}`}
                  className="text-blue-600 hover:underline block text-lg font-medium mt-2"
                >
                  View Customer Details
                </Link>
              </div>

              <Button 
                className="w-full mt-4 py-6 text-lg bg-red-600 hover:bg-red-700"
                onClick={onCheckout}
              >
                <CreditCard className="mr-2" size={20} />
                Check-out & Payment
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailsDialog;
