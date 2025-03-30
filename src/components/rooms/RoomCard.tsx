import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Room, Customer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AddCustomerForm from "@/components/customers/AddCustomerForm";
import { UserPlus } from "lucide-react";

interface RoomCardProps {
  room: Room;
  customer: Customer | null;
  onRoomClick: (room: Room) => void;
}

const RoomCard = ({ room, customer, onRoomClick }: RoomCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cleanedBy, setCleanedBy] = useState("");
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState({
    paymentMethod: "cash" as "cash" | "bank_transfer" | "other",
    bankRefNo: "",
    collectedBy: "",
  });
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case "vacant":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-blue-100 text-blue-800";
      case "cleaning":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateRemainingDays = (checkOutDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const checkOut = new Date(checkOutDate);
    checkOut.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const timeDiff = checkOut.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return Math.max(0, daysDiff); // Ensure we don't return negative days
  };

  const handleDeleteRoom = async () => {
    if (room.status === 'occupied') {
      toast({
        title: "Cannot Delete Room",
        description: "This room is currently occupied. Check out the guest first.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      const success = await deleteRoom(room.id);
      
      if (success) {
        toast({
          title: "Room Deleted",
          description: `Room ${room.roomNumber} has been removed`,
        });
        // Reload the page to refresh the room list
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the room",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the room",
        variant: "destructive",
      });
    }
    
    setIsDeleteDialogOpen(false);
  };

  const handleCleaningComplete = async () => {
    if (!cleanedBy.trim()) {
      toast({
        title: "Error",
        description: "Please enter who cleaned the room",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedRoom = await updateRoom(room.id, {
        status: "vacant",
        lastCleaned: new Date().toISOString(),
        cleanedBy,
      });

      if (updatedRoom) {
        window.location.reload();
        toast({
          title: "Cleaning Completed",
          description: `Room ${updatedRoom.roomNumber} has been marked as clean`,
        });
      }
    } catch (error) {
      console.error("Error completing cleaning:", error);
      toast({
        title: "Error",
        description: "Failed to mark room as clean",
        variant: "destructive",
      });
    }
  };

  const openAddCustomerDialog = () => {
    setIsAddCustomerDialogOpen(true);
  };

  const calculateTotalStay = (): number => {
    if (!customer) return 0;
    
    const checkInDate = new Date(customer.checkInDate);
    const checkOutDate = new Date(customer.checkOutDate);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(1, days) * room.rate;
  };

  const calculateAmountDue = (): number => {
    const totalStay = calculateTotalStay();
    const depositAmount = customer?.depositAmount || 0;
    return Math.max(0, totalStay - depositAmount);
  };

  const handleCheckout = async () => {
    if (!customer) return;
    
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

    try {
      // 1. Add payment record
      const paymentData = {
        customerId: customer.id,
        roomId: room.id,
        amount: calculateAmountDue(),
        date: new Date().toISOString(),
        method: checkoutDetails.paymentMethod,
        collectedBy: checkoutDetails.collectedBy,
        status: "paid" as "paid" | "pending" | "partial",
        notes: checkoutDetails.bankRefNo ? `Bank Ref: ${checkoutDetails.bankRefNo}` : ""
      };
      
      const payment = await addPayment(paymentData);
      
      if (!payment) throw new Error("Failed to record payment");
      
      // 2. Update room status to cleaning
      const updatedRoom = await updateRoom(room.id, {
        status: "cleaning"
      });
      
      if (!updatedRoom) throw new Error("Failed to update room status");
      
      // 3. Show success message
      toast({
        title: "Checkout Complete",
        description: `Room ${room.roomNumber} has been checked out and payment processed`,
      });
      
      // 4. Close dialog and reload page
      setIsCheckoutDialogOpen(false);
      window.location.reload();
      
    } catch (error) {
      console.error("Error during checkout:", error);
      toast({
        title: "Checkout Failed",
        description: "An unexpected error occurred during checkout",
        variant: "destructive",
      });
    }
  };

  return (
    <Card 
      key={room.id} 
      className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
    >
      <CardHeader className="p-5 bg-gray-50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Room {room.roomNumber}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`px-3 py-1 text-lg ${getStatusColor(room.status)}`}>
              {room.status === "vacant" ? "Available" : 
                room.status === "occupied" ? "Occupied" : 
                "Needs Cleaning"}
            </Badge>
            
            <Button 
              variant="destructive" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">
              {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
            </span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Rate:</span>
            <span className="font-medium">${room.rate}/night</span>
          </div>
          {room.lastCleaned && (
            <div className="flex justify-between text-lg">
              <span className="text-gray-600">Last Cleaned:</span>
              <span>
                {new Date(room.lastCleaned).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {room.status === "occupied" && customer && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <User className="mr-2" size={20} />
                Current Guest
              </h3>
              <div className="space-y-2">
                <div className="font-medium text-lg">{customer.name}</div>
                <div>{customer.phone}</div>
                <div className="text-sm text-gray-600">
                  Check-in: {new Date(customer.checkInDate).toLocaleDateString()}
                </div>
                <div className="text-sm font-semibold text-blue-800">
                  Check-out: {new Date(customer.checkOutDate).toLocaleDateString()}
                </div>
                
                <div className="flex items-center mt-1 text-sm font-medium bg-yellow-50 text-yellow-800 p-2 rounded-md border border-yellow-200">
                  <Clock className="mr-2" size={16} />
                  <span>
                    {calculateRemainingDays(customer.checkOutDate) === 0 
                      ? "Checkout today!" 
                      : `${calculateRemainingDays(customer.checkOutDate)} days until checkout`}
                  </span>
                </div>
                
                <Link 
                  to={`/customers?id=${customer.id}`} 
                  className="text-blue-600 hover:underline block text-lg font-medium mt-2"
                >
                  View Customer Details
                </Link>
              </div>
            </div>
          )}
          
          <div className="pt-4 space-y-3">
            <Button 
              className="w-full py-6 text-lg bg-gray-600 hover:bg-gray-700"
              variant="default"
              onClick={() => navigate(`/room-details?roomId=${room.id}`)}
            >
              <Info className="mr-2" size={20} />
              View Room Details
            </Button>
          
            {room.status === "vacant" && (
              <Button 
                className="w-full py-6 text-lg bg-hotel-primary hover:bg-hotel-primary/90 flex items-center justify-center gap-2"
                variant="default"
                onClick={() => setIsAddCustomerDialogOpen(true)}
              >
                <UserPlus className="mr-2" size={20} />
                Add Customer to Room {room.roomNumber}
              </Button>
            )}
            
            {room.status === "occupied" && (
              <Button 
                className="w-full py-6 text-lg bg-red-600 hover:bg-red-700"
                onClick={() => setIsCheckoutDialogOpen(true)}
                type="button"
              >
                <CreditCard className="mr-2" size={20} />
                Check-out & Payment
              </Button>
            )}
            
            {room.status === "cleaning" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full py-6 text-lg bg-green-600 hover:bg-green-700"
                  >
                    Complete Cleaning
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Mark Room as Cleaned</DialogTitle>
                    <DialogDescription>
                      Enter the name of the person who cleaned the room.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-6">
                    <div className="space-y-2">
                      <Label htmlFor="cleaned-by" className="text-lg">Cleaned By</Label>
                      <Input
                        id="cleaned-by"
                        placeholder="Enter name of cleaner"
                        value={cleanedBy}
                        onChange={(e) => setCleanedBy(e.target.value)}
                        className="text-lg h-12"
                      />
                    </div>
                    <Button 
                      onClick={handleCleaningComplete} 
                      className="w-full py-6 text-lg bg-green-600 hover:bg-green-700"
                    >
                      Mark as Clean
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this room?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the room
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoom}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Check-out & Payment</DialogTitle>
            <DialogDescription>
              Complete the checkout process for Room {room.roomNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
              <div className="text-lg font-medium">Amount Due: ${calculateAmountDue()}</div>
              <div className="text-sm text-gray-600">
                (Total stay: ${calculateTotalStay()} - Deposit: ${customer?.depositAmount || 0})
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-method" className="text-lg">Payment Method</Label>
              <select
                id="payment-method"
                className="w-full h-12 px-3 border border-gray-300 rounded-md"
                value={checkoutDetails.paymentMethod}
                onChange={(e) => setCheckoutDetails({
                  ...checkoutDetails, 
                  paymentMethod: e.target.value as "cash" | "bank_transfer" | "other"
                })}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
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
              onClick={handleCheckout} 
              className="w-full py-6 text-xl bg-red-600 hover:bg-red-700"
            >
              Complete Checkout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddCustomerDialogOpen} onOpenChange={setIsAddCustomerDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Customer to Room {room.roomNumber}</DialogTitle>
            <DialogDescription>
              Enter customer details for check-in
            </DialogDescription>
          </DialogHeader>
          <AddCustomerForm 
            rooms={[room]} 
            onCustomerAdded={(newCustomer) => {
              setIsAddCustomerDialogOpen(false);
              window.location.reload();
            }} 
            onClose={() => setIsAddCustomerDialogOpen(false)}
            preselectedRoomId={room.id}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RoomCard;
