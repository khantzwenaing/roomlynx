
import React, { useState, useEffect } from "react";
import { getRooms, updateRoom } from "@/services/dataService";
import { Room } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AddRoomForm from "@/components/AddRoomForm";
import { Plus } from "lucide-react";

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [cleanedBy, setCleanedBy] = useState("");
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const { toast } = useToast();

  const loadRooms = () => {
    setRooms(getRooms());
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
                <div className="pt-4 space-y-3">
                  {room.status !== "occupied" && (
                    <Button 
                      className="w-full py-6 text-lg"
                      onClick={() => handleStatusChange(room.id, "occupied")}
                    >
                      Mark as Occupied
                    </Button>
                  )}
                  {room.status !== "cleaning" && room.status !== "vacant" && (
                    <Button 
                      className="w-full py-6 text-lg"
                      variant="outline"
                      onClick={() => handleStatusChange(room.id, "cleaning")}
                    >
                      Needs Cleaning
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddRoomForm 
        isOpen={isAddRoomOpen} 
        onClose={() => setIsAddRoomOpen(false)}
        onRoomAdded={loadRooms}
      />
    </div>
  );
};

export default Rooms;
