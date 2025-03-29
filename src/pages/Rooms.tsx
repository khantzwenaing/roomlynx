
import React, { useState, useEffect } from "react";
import { getRooms, updateRoom, getCustomers, addCustomer, getRoomDetails } from "@/services/dataService";
import { Room, Customer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AddRoomForm from "@/components/AddRoomForm";
import { Plus, User, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [cleanedBy, setCleanedBy] = useState("");
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [roomCustomers, setRoomCustomers] = useState<{[key: string]: Customer | null}>({});
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    idNumber: "",
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });
  const { toast } = useToast();

  const loadRooms = () => {
    setRooms(getRooms());
    loadCustomersForRooms();
  };

  const loadCustomersForRooms = () => {
    const allRooms = getRooms();
    const customerMap: {[key: string]: Customer | null} = {};
    
    allRooms.forEach(room => {
      const details = getRoomDetails(room.id);
      customerMap[room.id] = details?.currentCustomer || null;
    });
    
    setRoomCustomers(customerMap);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleStatusChange = (roomId: string, newStatus: Room["status"]) => {
    const updatedRoom = updateRoom(roomId, { status: newStatus });
    if (updatedRoom) {
      loadRooms();
      toast({
        title: "Room Updated",
        description: `Room ${updatedRoom.roomNumber} status changed to ${newStatus}`,
      });
    }
  };

  const handleCleaningComplete = () => {
    if (!selectedRoom || !cleanedBy.trim()) {
      toast({
        title: "Error",
        description: "Please enter who cleaned the room",
        variant: "destructive",
      });
      return;
    }

    const updatedRoom = updateRoom(selectedRoom.id, {
      status: "vacant",
      lastCleaned: new Date().toISOString(),
      cleanedBy,
    });

    if (updatedRoom) {
      loadRooms();
      setSelectedRoom(null);
      setCleanedBy("");
      toast({
        title: "Cleaning Completed",
        description: `Room ${updatedRoom.roomNumber} has been marked as clean`,
      });
    }
  };

  const handleAddCustomer = () => {
    if (!selectedRoom) return;
    
    if (!newCustomer.name || !newCustomer.phone) {
      toast({
        title: "Error",
        description: "Name and phone number are required",
        variant: "destructive",
      });
      return;
    }
    
    // Add the customer with all required fields
    const customer = addCustomer({
      name: newCustomer.name,
      email: newCustomer.email || "",
      phone: newCustomer.phone,
      idNumber: newCustomer.idNumber || "",
      address: "",
      checkInDate: newCustomer.checkInDate,
      checkOutDate: newCustomer.checkOutDate,
      roomId: selectedRoom.id,
    });
    
    // Update room status
    updateRoom(selectedRoom.id, { status: "occupied" });
    
    // Reset form and reload data
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      idNumber: "",
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    });
    
    setIsAddCustomerOpen(false);
    loadRooms();
    
    toast({
      title: "Customer Added",
      description: `${customer.name} has been checked into Room ${selectedRoom.roomNumber}`,
    });
  };

  const openAddCustomerDialog = (room: Room) => {
    setSelectedRoom(room);
    setIsAddCustomerOpen(true);
  };

  const filteredRooms = rooms.filter((room) => {
    // Enhanced search functionality to search by room number, type, rate, and status
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

  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case "vacant":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-blue-100 text-blue-800";
      case "cleaning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="overflow-hidden shadow-lg">
            <CardHeader className="p-5 bg-gray-50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Room {room.roomNumber}</CardTitle>
                <Badge className={`px-3 py-1 text-lg ${getStatusColor(room.status)}`}>
                  {room.status === "vacant" ? "Available" : 
                   room.status === "occupied" ? "Occupied" : 
                   "Needs Cleaning"}
                </Badge>
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
                
                {/* Customer Information Section */}
                {roomCustomers[room.id] ? (
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
                      <div className="text-sm text-gray-600">
                        Check-out: {new Date(roomCustomers[room.id]?.checkOutDate || "").toLocaleDateString()}
                      </div>
                      <Link 
                        to={`/customers?id=${roomCustomers[room.id]?.id}`} 
                        className="text-blue-600 hover:underline block text-lg font-medium mt-2"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ) : null}
                
                <div className="pt-4 space-y-3">
                  {room.status === "vacant" && (
                    <Button 
                      className="w-full py-6 text-lg"
                      variant="default"
                      onClick={() => openAddCustomerDialog(room)}
                    >
                      <UserPlus className="mr-2" size={20} />
                      Check-in Guest
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
                  
                  {room.status === "occupied" && (
                    <Button 
                      className="w-full py-6 text-lg"
                      variant="outline"
                      onClick={() => handleStatusChange(room.id, "cleaning")}
                    >
                      Needs Cleaning
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Check-in Guest for Room {selectedRoom?.roomNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                <Label htmlFor="check-in-date" className="text-lg">Check-in Date</Label>
                <Input
                  id="check-in-date"
                  type="date"
                  value={newCustomer.checkInDate}
                  onChange={(e) => setNewCustomer({...newCustomer, checkInDate: e.target.value})}
                  className="text-lg h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="check-out-date" className="text-lg">Check-out Date</Label>
                <Input
                  id="check-out-date"
                  type="date"
                  value={newCustomer.checkOutDate}
                  onChange={(e) => setNewCustomer({...newCustomer, checkOutDate: e.target.value})}
                  className="text-lg h-12"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddCustomerOpen(false)}
              className="text-lg h-12"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddCustomer}
              className="text-lg h-12"
            >
              Check-in Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddRoomForm 
        isOpen={isAddRoomOpen} 
        onClose={() => setIsAddRoomOpen(false)}
        onRoomAdded={loadRooms}
      />
    </div>
  );
};

export default Rooms;
