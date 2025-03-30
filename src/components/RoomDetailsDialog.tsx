
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Room, Customer } from "@/types";
import { User, CreditCard, Pencil, Clock, Banknote } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RoomDetailsDialogProps {
  room: Room | null;
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onEdit: (updatedRoom: Partial<Room>) => void;
}

const RoomDetailsDialog = ({
  room,
  customer,
  isOpen,
  onClose,
  onCheckout,
  onEdit,
}: RoomDetailsDialogProps) => {
  const [editing, setEditing] = useState(false);
  const [editedRoom, setEditedRoom] = useState<Partial<Room>>({});
  const [checkoutDetails, setCheckoutDetails] = useState({
    paymentMethod: "cash",
    bankRefNo: "",
    collectedBy: "",
    showCheckoutForm: false
  });
  const [amountDue, setAmountDue] = useState(0);

  if (!room) return null;

  useEffect(() => {
    if (customer && room) {
      // Calculate amount due on component mount or when customer/room changes
      const totalStay = calculateTotalStay();
      const depositAmount = customer.depositAmount || 0;
      setAmountDue(Math.max(0, totalStay - depositAmount));
    }
  }, [customer, room]);

  const handleEdit = () => {
    if (editing) {
      // Save changes
      onEdit(editedRoom);
      setEditing(false);
    } else {
      // Start editing
      setEditedRoom({
        roomNumber: room.roomNumber,
        type: room.type,
        rate: room.rate,
      });
      setEditing(true);
    }
  };

  const calculateTotalStay = () => {
    if (!customer) return 0;
    const checkInDate = new Date(customer.checkInDate);
    const checkOutDate = new Date(customer.checkOutDate);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(1, days) * room.rate;
  };

  const calculateRemainingDays = (): number => {
    if (!customer) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const checkOut = new Date(customer.checkOutDate);
    checkOut.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const timeDiff = checkOut.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return Math.max(0, daysDiff); // Ensure we don't return negative days
  };

  const handleCheckoutClick = () => {
    setCheckoutDetails({
      ...checkoutDetails,
      showCheckoutForm: true
    });
  };

  const handleCompleteCheckout = () => {
    if (!checkoutDetails.collectedBy) {
      alert("Please enter who collected the payment");
      return;
    }

    if (checkoutDetails.paymentMethod === "bank_transfer" && !checkoutDetails.bankRefNo) {
      alert("Please enter bank reference number");
      return;
    }

    onCheckout();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            {editing ? "Edit Room " : "Room "}{room.roomNumber}
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              {editing ? "Save" : <Pencil className="h-5 w-5" />}
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomNumber" className="text-lg">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={editedRoom.roomNumber}
                  onChange={(e) => setEditedRoom({...editedRoom, roomNumber: e.target.value})}
                  className="text-lg h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomType" className="text-lg">Room Type</Label>
                <Select 
                  value={editedRoom.type} 
                  onValueChange={(value: 'single' | 'double' | 'suite' | 'deluxe') => 
                    setEditedRoom({...editedRoom, type: value})
                  }
                >
                  <SelectTrigger id="roomType" className="text-lg h-12">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent className="text-lg">
                    <SelectItem value="single" className="text-lg py-3">Single</SelectItem>
                    <SelectItem value="double" className="text-lg py-3">Double</SelectItem>
                    <SelectItem value="suite" className="text-lg py-3">Suite</SelectItem>
                    <SelectItem value="deluxe" className="text-lg py-3">Deluxe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate" className="text-lg">Rate per Night ($)</Label>
                <Input
                  id="rate"
                  type="number"
                  value={editedRoom.rate}
                  onChange={(e) => setEditedRoom({...editedRoom, rate: Number(e.target.value)})}
                  min={1}
                  className="text-lg h-12"
                />
              </div>
            </div>
          ) : (
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
          )}

          {customer && room.status === "occupied" && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <User className="mr-2" size={24} />
                Current Guest
              </h3>
              <div className="space-y-3">
                <div className="font-medium text-xl">{customer.name}</div>
                <div className="text-lg">{customer.phone}</div>
                {customer.email && <div className="text-lg">{customer.email}</div>}
                <div className="text-lg text-gray-700">
                  Check-in: {new Date(customer.checkInDate).toLocaleDateString()}
                </div>
                <div className="text-lg font-semibold text-blue-800">
                  Check-out: {new Date(customer.checkOutDate).toLocaleDateString()}
                </div>
                
                <div className="flex items-center mt-1 text-lg font-medium bg-yellow-50 text-yellow-800 p-3 rounded-md border border-yellow-200">
                  <Clock className="mr-2" size={20} />
                  <span>
                    {calculateRemainingDays() === 0 
                      ? "Checkout today!" 
                      : `${calculateRemainingDays()} days until checkout`}
                  </span>
                </div>
                
                <div className="text-lg font-semibold text-green-700">
                  Total Stay: ${calculateTotalStay()}
                </div>
                {customer.depositAmount && (
                  <div className="text-lg font-semibold text-purple-700">
                    Deposit: ${customer.depositAmount}
                  </div>
                )}
                <Link 
                  to={`/customers?id=${customer.id}`}
                  className="text-blue-600 hover:underline block text-xl font-medium mt-2"
                >
                  View Customer Details
                </Link>
              </div>

              {!checkoutDetails.showCheckoutForm ? (
                <Button 
                  className="w-full mt-6 py-6 text-xl bg-red-600 hover:bg-red-700"
                  onClick={handleCheckoutClick}
                >
                  <CreditCard className="mr-2" size={24} />
                  Check-out & Payment
                </Button>
              ) : (
                <div className="mt-6 space-y-4 bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800">Checkout Details</h4>
                  
                  <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                    <div className="text-lg font-medium">Amount Due: ${amountDue}</div>
                    <div className="text-sm text-gray-600">
                      (Total stay: ${calculateTotalStay()} - Deposit: ${customer.depositAmount || 0})
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-method" className="text-lg">Payment Method</Label>
                    <RadioGroup 
                      value={checkoutDetails.paymentMethod}
                      onValueChange={(value) => setCheckoutDetails({...checkoutDetails, paymentMethod: value})}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="payment-cash" />
                        <Label htmlFor="payment-cash" className="flex items-center">
                          <Banknote className="mr-2" size={20} />
                          Cash
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bank_transfer" id="payment-bank" />
                        <Label htmlFor="payment-bank" className="flex items-center">
                          <CreditCard className="mr-2" size={20} />
                          Bank Transfer
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {checkoutDetails.paymentMethod === "bank_transfer" && (
                    <div className="space-y-2">
                      <Label htmlFor="bank-ref" className="text-lg">Bank Reference Number</Label>
                      <Input
                        id="bank-ref"
                        placeholder="Enter transaction reference"
                        value={checkoutDetails.bankRefNo}
                        onChange={(e) => setCheckoutDetails({...checkoutDetails, bankRefNo: e.target.value})}
                        className="text-lg h-12"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="collected-by" className="text-lg">Collected By</Label>
                    <Input
                      id="collected-by"
                      placeholder="Enter staff name"
                      value={checkoutDetails.collectedBy}
                      onChange={(e) => setCheckoutDetails({...checkoutDetails, collectedBy: e.target.value})}
                      className="text-lg h-12"
                    />
                  </div>
                  
                  <Button 
                    className="w-full py-6 text-xl bg-red-600 hover:bg-red-700"
                    onClick={handleCompleteCheckout}
                  >
                    Complete Checkout
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailsDialog;
