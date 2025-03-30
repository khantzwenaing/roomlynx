import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getRooms, updateRoom, getCustomers, getRoomDetails, deleteRoom, addCustomer, addPayment } from "@/services/dataService";
import { Room, Customer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import AddRoomForm from "@/components/AddRoomForm";
import RoomDetailsDialog from "@/components/RoomDetailsDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Plus, User, UserPlus, CreditCard, Pencil, Trash2, Banknote, Info, CreditCard as CardIcon, Clock } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [cleanedBy, setCleanedBy] = useState("");
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomCustomers, setRoomCustomers] = useState<{[key: string]: Customer | null}>({});
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    idNumber: "",
    checkInDate: new Date(),
    checkOutDate: new Date(Date.now() + 86400000),
    depositAmount: 0,
    depositPaymentMethod: "cash",
    bankRefNo: ""
  });
  const [paymentInfo, setPaymentInfo] = useState({
    amount: 0,
    method: "cash",
    bankRefNo: "",
    collectedBy: "",
  });
  const [isRoomDetailsOpen, setIsRoomDetailsOpen] = useState(false);
  const [calculatedTotalStay, setCalculatedTotalStay] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const roomsData = await getRooms();
      setRooms(roomsData);
    } catch (error) {
      console.error("Error loading rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load rooms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadCustomersForRooms = useCallback(async () => {
    try {
      const allRooms = await getRooms();
      const customerMap: {[key: string]: Customer | null} = {};
      
      for (const room of allRooms) {
        if (room.status === "occupied") {
          const details = await getRoomDetails(room.id);
          if (details && details.currentCustomer) {
            customerMap[room.id] = details.currentCustomer;
          } else {
            customerMap[room.id] = null;
          }
        }
      }
      
      setRoomCustomers(customerMap);
    } catch (error) {
      console.error("Error loading customers for rooms:", error);
    }
  }, []);

  useEffect(() => {
    loadRooms();
    loadCustomersForRooms();
  }, [loadRooms, loadCustomersForRooms]);

  const calculateRemainingDays = (checkOutDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const checkOut = new Date(checkOutDate);
    checkOut.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const timeDiff = checkOut.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return Math.max(0, daysDiff); // Ensure we don't return negative days
  };

  const handleStatusChange = async (roomId: string, newStatus: Room["status"]) => {
    try {
      const updatedRoom = await updateRoom(roomId, { status: newStatus });
      if (updatedRoom) {
        await loadRooms();
        await loadCustomersForRooms();
        toast({
          title: "Room Updated",
          description: `Room ${updatedRoom.roomNumber} status changed to ${newStatus}`,
        });
      }
    } catch (error) {
      console.error("Error updating room status:", error);
      toast({
        title: "Error",
        description: "Failed to update room status",
        variant: "destructive",
      });
    }
  };

  const handleCleaningComplete = async () => {
    if (!selectedRoom || !cleanedBy.trim()) {
      toast({
        title: "Error",
        description: "Please enter who cleaned the room",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedRoom = await updateRoom(selectedRoom.id, {
        status: "vacant",
        lastCleaned: new Date().toISOString(),
        cleanedBy,
      });

      if (updatedRoom) {
        await loadRooms();
        await loadCustomersForRooms();
        setSelectedRoom(null);
        setCleanedBy("");
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

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;

    if (selectedRoom.status === 'occupied') {
      toast({
        title: "Cannot Delete Room",
        description: "This room is currently occupied. Check out the guest first.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      const success = await deleteRoom(selectedRoom.id);
      
      if (success) {
        toast({
          title: "Room Deleted",
          description: `Room ${selectedRoom.roomNumber} has been removed`,
        });
        await loadRooms();
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

  const calculateTotalStay = (roomId: string, checkInDate: string, checkOutDate: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(1, days) * room.rate;
  };

  const handleAddCustomer = async () => {
    if (!selectedRoom) return;
    
    if (!newCustomer.name || !newCustomer.phone) {
      toast({
        title: "Error",
        description: "Name and phone number are required",
        variant: "destructive",
      });
      return;
    }
    
    if (newCustomer.depositPaymentMethod === "bank_transfer" && !newCustomer.bankRefNo.trim() && newCustomer.depositAmount > 0) {
      toast({
        title: "Error",
        description: "Bank reference number is required for bank transfers",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const customer = await addCustomer({
        name: newCustomer.name,
        email: newCustomer.email || "",
        phone: newCustomer.phone,
        idNumber: newCustomer.idNumber || "",
        address: "",
        checkInDate: newCustomer.checkInDate.toISOString(),
        checkOutDate: newCustomer.checkOutDate.toISOString(),
        roomId: selectedRoom.id,
        depositAmount: newCustomer.depositAmount || 0,
        depositPaymentMethod: newCustomer.depositAmount > 0 ? newCustomer.depositPaymentMethod as 'cash' | 'card' | 'bank_transfer' | 'other' : undefined,
        bankRefNo: newCustomer.depositAmount > 0 && newCustomer.depositPaymentMethod === "bank_transfer" ? newCustomer.bankRefNo : undefined
      });
      
      if (customer && newCustomer.depositAmount > 0) {
        await addPayment({
          customerId: customer.id,
          roomId: selectedRoom.id,
          amount: newCustomer.depositAmount,
          date: new Date().toISOString(),
          method: newCustomer.depositPaymentMethod as 'cash' | 'card' | 'bank_transfer' | 'other',
          collectedBy: "Reception Staff",
          status: "paid",
          notes: newCustomer.depositPaymentMethod === "bank_transfer" ? `Deposit payment - Bank Ref: ${newCustomer.bankRefNo}` : "Deposit payment",
        });
      }
      
      if (customer) {
        await updateRoom(selectedRoom.id, { status: "occupied" });
        
        setNewCustomer({
          name: "",
          email: "",
          phone: "",
          idNumber: "",
          checkInDate: new Date(),
          checkOutDate: new Date(Date.now() + 86400000),
          depositAmount: 0,
          depositPaymentMethod: "cash",
          bankRefNo: ""
        });
        
        setIsAddCustomerOpen(false);
        await loadRooms();
        await loadCustomersForRooms();
        
        toast({
          title: "Customer Added",
          description: `${customer.name} has been checked into Room ${selectedRoom.roomNumber}`,
        });
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openAddCustomerDialog = (room: Room) => {
    setSelectedRoom(room);
    
    const today = new Date();
    const tomorrow = new Date(Date.now() + 86400000);
    
    setNewCustomer({
      ...newCustomer,
      checkInDate: today,
      checkOutDate: tomorrow,
      depositAmount: 0,
      depositPaymentMethod: "cash",
      bankRefNo: ""
    });
    
    const total = calculateTotalStay(room.id, today.toISOString(), tomorrow.toISOString());
    setCalculatedTotalStay(total);
    
    setIsAddCustomerOpen(true);
  };

  const openCheckoutDialog = (room: Room) => {
    setSelectedRoom(room);
    const customer = roomCustomers[room.id];
    if (customer) {
      const checkInDate = new Date(customer.checkInDate);
      const today = new Date();
      const daysStayed = Math.max(1, Math.ceil((today.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)));
      const totalAmount = room.rate * daysStayed;
      const depositAmount = customer.depositAmount || 0;
      const amountDue = Math.max(0, totalAmount - depositAmount);
      
      setPaymentInfo({
        amount: amountDue,
        method: "cash",
        bankRefNo: "",
        collectedBy: "",
      });
      setIsCheckoutOpen(true);
    } else {
      toast({
        title: "Error",
        description: "Could not find customer information for this room.",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = async () => {
    if (!selectedRoom || !roomCustomers[selectedRoom.id]) return;
    
    if (!paymentInfo.collectedBy.trim()) {
      toast({
        title: "Error",
        description: "Please enter who collected the payment",
        variant: "destructive",
      });
      return;
    }
    
    if (paymentInfo.method === "bank_transfer" && !paymentInfo.bankRefNo.trim()) {
      toast({
        title: "Error",
        description: "Please enter bank transaction reference number",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const customer = roomCustomers[selectedRoom.id];
      if (customer) {
        await addPayment({
          customerId: customer.id,
          roomId: selectedRoom.id,
          amount: paymentInfo.amount,
          date: new Date().toISOString(),
          method: paymentInfo.method as "cash" | "card" | "bank_transfer" | "other",
          collectedBy: paymentInfo.collectedBy,
          status: "paid",
          notes: paymentInfo.method === "bank_transfer" ? `Bank Ref: ${paymentInfo.bankRefNo}` : "Cash payment",
        });
        
        await updateRoom(selectedRoom.id, { status: "cleaning" });
        
        setIsCheckoutOpen(false);
        await loadRooms();
        await loadCustomersForRooms();
        
        toast({
          title: "Checkout Complete",
          description: `${customer.name} has checked out of Room ${selectedRoom.roomNumber}`,
        });
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast({
        title: "Error",
        description: "Failed to complete checkout process",
        variant: "destructive",
      });
    }
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setIsRoomDetailsOpen(true);
  };

  const handleEditRoom = async (updatedRoom: Partial<Room>) => {
    if (!selectedRoom) return;
    
    try {
      const updated = await updateRoom(selectedRoom.id, updatedRoom);
      if (updated) {
        toast({
          title: "Room Updated",
          description: `Room ${updated.roomNumber} has been updated successfully`,
        });
        await loadRooms();
        setSelectedRoom(updated);
      } else {
        toast({
          title: "Error",
          description: "Failed to update room",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating room:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the room",
        variant: "destructive",
      });
    }
  };

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

  const handleRoomDatesChange = (field: 'checkInDate' | 'checkOutDate', date: Date | undefined) => {
    if (!date) return;
    
    setNewCustomer({
      ...newCustomer,
      [field]: date
    });
    
    if (selectedRoom) {
      const checkInDate = field === 'checkInDate' ? date : newCustomer.checkInDate;
      const checkOutDate = field === 'checkOutDate' ? date : newCustomer.checkOutDate;
      
      const totalAmount = calculateTotalStay(
        selectedRoom.id, 
        checkInDate.toISOString(),
        checkOutDate.toISOString()
      );
      
      setCalculatedTotalStay(totalAmount);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const roomNumber = room.roomNumber.toLowerCase();
    const roomType = room.type.toLowerCase();
    const roomRate = room.rate.toString();
    const roomStatus = room.status.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      roomNumber.includes(searchTermLower) || 
      roomType.includes(searchTermLower) || 
      roomRate.includes(searchTermLower) || 
      roomStatus.includes(searchTermLower);
      
    const matchesFilter = statusFilter === "all" || room.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Rooms</h1>
        <Button onClick={() => setIsAddRoomOpen(true)} size="lg">
          <Plus className="mr-2" size={20} />
          Add New Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="search" className="text-lg mb-2 block">Search Room</Label>
          <Input
            id="search"
            placeholder="Type here to search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-lg h-12"
          />
        </div>
        <div>
          <Label htmlFor="status-filter" className="text-lg mb-2 block">Room Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-lg h-12">
              <SelectValue placeholder="All Rooms" />
            </SelectTrigger>
            <SelectContent className="text-lg">
              <SelectItem value="all">All Rooms</SelectItem>
              <SelectItem value="vacant">Available Rooms</SelectItem>
              <SelectItem value="occupied">Occupied Rooms</SelectItem>
              <SelectItem value="cleaning">Rooms To Clean</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-xl text-gray-500">Loading rooms...</div>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-xl text-gray-500">No rooms found</div>
          <div className="mt-2 text-gray-400">Try adjusting your search or filter criteria</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
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
                      onClick={() => {
                        setSelectedRoom(room);
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
                  
                  {room.status === "occupied" && roomCustomers[room.id] && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <User className="mr-2" size={20} />
                        Current Guest
                      </h3>
                      <div className="space-y-2">
                        <div className="font-medium text-lg">{roomCustomers[room.id]?.name}</div>
                        <div>{roomCustomers[room.id]?.phone}</div>
                        <div className="text-sm text-gray-600">
                          Check-in: {new Date(roomCustomers[room.id]?.checkInDate || "").toLocaleDateString()}
                        </div>
                        <div className="text-sm font-semibold text-blue-800">
                          Check-out: {new Date(roomCustomers[room.id]?.checkOutDate || "").toLocaleDateString()}
                        </div>
                        
                        <div className="flex items-center mt-1 text-sm font-medium bg-yellow-50 text-yellow-800 p-2 rounded-md border border-yellow-200">
                          <Clock className="mr-2" size={16} />
                          <span>
                            {calculateRemainingDays(roomCustomers[room.id]?.checkOutDate || "") === 0 
                              ? "Checkout today!" 
                              : `${calculateRemainingDays(roomCustomers[room.id]?.checkOutDate || "")} days until checkout`}
                          </span>
                        </div>
                        
                        <Link 
                          to={`/customers?id=${roomCustomers[room.id]?.id}`} 
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
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsRoomDetailsOpen(true);
                      }}
                    >
                      <Info className="mr-2" size={20} />
                      View Room Details
                    </Button>
                  
                    {room.status === "vacant" && (
                      <Button 
                        className="w-full py-6 text-lg"
                        variant="default"
                        onClick={() => openAddCustomerDialog(room)}
                      >
                        <UserPlus className="mr-2" size={20} />
                        Add Customer
                      </Button>
                    )}
                    
                    {room.status === "occupied" && (
                      <Button 
                        className="w-full py-6 text-lg bg-red-600 hover:bg-red-700"
                        onClick={() => openCheckoutDialog(room)}
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
                            onClick={() => setSelectedRoom(room)}
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
            </Card>
          ))}
        </div>
      )}

      <RoomDetailsDialog
        room={selectedRoom}
        customer={selectedRoom ? roomCustomers[selectedRoom.id] : null}
        isOpen={isRoomDetailsOpen}
        onClose={() => setIsRoomDetailsOpen(false)}
        onCheckout={() => {
          setIsRoomDetailsOpen(false);
          if (selectedRoom) {
            openCheckoutDialog(selectedRoom);
          }
        }}
        onEdit={handleEditRoom}
      />

      <AddRoomForm 
        isOpen={isAddRoomOpen} 
        onClose={() => setIsAddRoomOpen(false)} 
        onRoomAdded={loadRooms} 
      />

      <Sheet open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <SheetContent className="sm:max-w-lg w-full overflow-y-auto" side="right">
          <SheetHeader>
            <SheetTitle className="text-xl">
              Add Customer for Room {selectedRoom?.roomNumber}
            </SheetTitle>
            <SheetDescription>
              Enter customer details to assign them to this room.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="customer-name" className="text-lg">Guest Name*</Label>
              <Input
                id="customer-name"
                placeholder="Enter full name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                className="text-lg h-12"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer-phone" className="text-lg">Phone Number*</Label>
              <Input
                id="customer-phone"
                placeholder="Enter phone number"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                className="text-lg h-12"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer-email" className="text-lg">Email Address</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="Enter email address"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                className="text-lg h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer-id" className="text-lg">ID Number</Label>
              <Input
                id="customer-id"
                placeholder="Enter ID number"
                value={newCustomer.idNumber}
                onChange={(e) => setNewCustomer({...newCustomer, idNumber: e.target.value})}
                className="text-lg h-12"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <DatePicker 
                  date={newCustomer.checkInDate} 
                  onDateChange={(date) => date && handleRoomDatesChange('checkInDate', date)}
                  label="Check-in Date"
                />
              </div>
              
              <div className="space-y-2">
                <DatePicker 
                  date={newCustomer.checkOutDate} 
                  onDateChange={(date) => date && handleRoomDatesChange('checkOutDate', date)}
                  label="Check-out Date"
                />
              </div>
            </div>

            {selectedRoom && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-semibold mb-2">Stay Information</div>
                <div className="text-sm">
                  Room Rate: ${selectedRoom.rate}/night
                </div>
                <div className="text-sm font-medium">
                  Total Cost: ${calculatedTotalStay}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="deposit-amount" className="text-lg">Deposit Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg text-gray-500">$</span>
                <Input
                  id="deposit-amount"
                  type="number"
                  min="0"
                  placeholder="Enter deposit amount"
                  value={newCustomer.depositAmount}
                  onChange={(e) => setNewCustomer({...newCustomer, depositAmount: Number(e.target.value)})}
                  className="text-lg h-12 pl-8"
                />
              </div>
              {newCustomer.depositAmount > 0 && (
                <div className="text-sm text-green-600 font-medium">
                  Remaining amount to pay: ${Math.max(0, calculatedTotalStay - newCustomer.depositAmount)}
                </div>
              )}
            </div>
            
            {newCustomer.depositAmount > 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="deposit-method" className="text-lg">Deposit Payment Method*</Label>
                  <Select 
                    value={newCustomer.depositPaymentMethod} 
                    onValueChange={(value) => setNewCustomer({...newCustomer, depositPaymentMethod: value})}
                  >
                    <SelectTrigger className="text-lg h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center">
                          <Banknote className="mr-2" size={18} />
                          Cash
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className="flex items-center">
                          <CardIcon className="mr-2" size={18} />
                          Card
                        </div>
                      </SelectItem>
                      <SelectItem value="bank_transfer">
                        <div className="flex items-center">
                          <CreditCard className="mr-2" size={18} />
                          Bank Transfer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newCustomer.depositPaymentMethod === "bank_transfer" && (
                  <div className="space-y-2">
                    <Label htmlFor="bank-ref" className="text-lg">Bank Reference Number*</Label>
                    <Input
                      id="bank-ref"
                      placeholder="Enter bank transaction reference number"
                      value={newCustomer.bankRefNo}
                      onChange={(e) => setNewCustomer({...newCustomer, bankRefNo: e.target.value})}
                      className="text-lg h-12"
                      required
                    />
                  </div>
                )}
              </>
            )}
          </div>
          
          <SheetFooter className="pt-4">
            <Button
              type="button"
              onClick={handleAddCustomer}
              className="w-full py-6 text-lg"
            >
              Add Customer & Check In
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ... keep existing code (other dialogs and components) */}
    </div>
  );
};

export default Rooms;
