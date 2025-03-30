
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Room, Customer } from "@/types";
import { User, CreditCard, Pencil, Clock, Banknote, Info, Home, Bed, Calendar, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { format } from "date-fns";

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
  const { toast } = useToast();

  useEffect(() => {
    if (customer && room) {
      // Calculate amount due on component mount or when customer/room changes
      const totalStay = calculateTotalStay(room, customer);
      const depositAmount = customer.depositAmount || 0;
      setAmountDue(Math.max(0, totalStay - depositAmount));
    }
  }, [customer, room]);

  // Early return if room is null, but AFTER all hooks are called
  if (!room) return null;

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

  const calculateTotalStay = (currentRoom: Room, currentCustomer: Customer | null) => {
    if (!currentCustomer) return 0;
    const checkInDate = new Date(currentCustomer.checkInDate);
    const checkOutDate = new Date(currentCustomer.checkOutDate);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(1, days) * currentRoom.rate;
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

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event propagation
    setCheckoutDetails({
      ...checkoutDetails,
      showCheckoutForm: true
    });
  };

  const handleCompleteCheckout = () => {
    if (!checkoutDetails.collectedBy) {
      toast({
        title: "Error",
        description: "Please enter who collected the payment",
        variant: "destructive"
      });
      return;
    }

    if (checkoutDetails.paymentMethod === "bank_transfer" && !checkoutDetails.bankRefNo) {
      toast({
        title: "Error",
        description: "Please enter bank reference number",
        variant: "destructive"
      });
      return;
    }

    onCheckout();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader className="border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl flex items-center">
              <Home className="mr-2 h-6 w-6" />
              {editing ? "Edit Room " : "Room "}{room.roomNumber}
            </DrawerTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleEdit}>
                {editing ? "Save" : <Pencil className="h-5 w-5" />}
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm">Close</Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>
        
        <div className="p-6 space-y-6">
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
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex gap-4 items-center">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700">
                    <Bed className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Room Type</h3>
                    <p className="text-xl font-semibold">{room.type.charAt(0).toUpperCase() + room.type.slice(1)}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex gap-4 items-center">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 text-green-700">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Rate per Night</h3>
                    <p className="text-xl font-semibold">${room.rate}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex gap-4 items-center">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-700">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Status</h3>
                    <div className={`text-xl font-semibold flex items-center ${
                      room.status === "vacant" ? "text-green-600" : 
                      room.status === "occupied" ? "text-blue-600" : 
                      room.status === "cleaning" ? "text-amber-600" : "text-red-600"
                    }`}>
                      {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
              
              {room.lastCleaned && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-teal-100 text-teal-700">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Last Cleaned</h3>
                      <p className="text-xl font-semibold">{new Date(room.lastCleaned).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">by {room.cleanedBy}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {customer && room.status === "occupied" && (
            <div className="mt-6 p-5 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
                <User className="mr-2" size={22} />
                Current Guest
              </h3>
              <div className="grid grid-cols-1 gap-4 mt-3">
                <div className="p-3 bg-white rounded-lg border border-blue-100">
                  <h4 className="text-sm text-blue-600 font-medium">Guest Name</h4>
                  <p className="text-lg font-semibold mt-1">{customer.name}</p>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-blue-100">
                  <h4 className="text-sm text-blue-600 font-medium">Contact</h4>
                  <p className="text-lg font-medium mt-1">{customer.phone}</p>
                  {customer.email && <p className="text-sm text-gray-500">{customer.email}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <h4 className="text-sm text-blue-600 font-medium">Check-in</h4>
                    <p className="text-lg font-medium mt-1">
                      {format(new Date(customer.checkInDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <h4 className="text-sm text-blue-600 font-medium">Check-out</h4>
                    <p className="text-lg font-medium mt-1 text-blue-800">
                      {format(new Date(customer.checkOutDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 text-lg font-medium bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
                  <Clock className="mr-2" size={20} />
                  <span>
                    {calculateRemainingDays() === 0 
                      ? "Checkout today!" 
                      : `${calculateRemainingDays()} days until checkout`}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-blue-100">
                    <h4 className="text-sm text-blue-600 font-medium">Total Stay</h4>
                    <p className="text-lg font-semibold mt-1 text-green-700">
                      ${calculateTotalStay(room, customer)}
                    </p>
                  </div>
                  
                  {customer.depositAmount && (
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <h4 className="text-sm text-blue-600 font-medium">Deposit</h4>
                      <p className="text-lg font-semibold mt-1 text-purple-700">
                        ${customer.depositAmount}
                      </p>
                    </div>
                  )}
                </div>
                
                <Link 
                  to={`/customers?id=${customer.id}`}
                  className="text-blue-600 hover:underline block text-xl font-medium mt-1 p-2"
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
                <div className="mt-6 space-y-4 bg-white p-5 rounded-lg border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800">Checkout Details</h4>
                  
                  <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                    <div className="text-lg font-medium">Amount Due: ${amountDue}</div>
                    <div className="text-sm text-gray-600">
                      (Total stay: ${calculateTotalStay(room, customer)} - Deposit: ${customer.depositAmount || 0})
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
      </DrawerContent>
    </Drawer>
  );
};

export default RoomDetailsDialog;
