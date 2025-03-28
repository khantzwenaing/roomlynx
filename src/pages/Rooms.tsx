
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
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "all" || room.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case "vacant":
        return "bg-hotel-success";
      case "occupied":
        return "bg-hotel-primary";
      case "maintenance":
        return "bg-hotel-danger";
      case "cleaning":
        return "bg-hotel-warning";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Rooms Management</h1>
        <Button onClick={() => setIsAddRoomOpen(true)}>
          <Plus className="mr-1" size={16} />
          Add New Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="search">Search Room</Label>
          <Input
            id="search"
            placeholder="Search by room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="status-filter">Filter by Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="vacant">Vacant</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="cleaning">Needs Cleaning</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="overflow-hidden">
            <CardHeader className="p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                <Badge className={getStatusColor(room.status)}>
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Type:</span>
                  <span className="text-sm font-medium">
                    {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Rate:</span>
                  <span className="text-sm font-medium">${room.rate}/night</span>
                </div>
                {room.lastCleaned && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Cleaned:</span>
                    <span className="text-sm">
                      {new Date(room.lastCleaned).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="pt-2 flex flex-wrap gap-2">
                  {room.status !== "occupied" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusChange(room.id, "occupied")}
                    >
                      Mark Occupied
                    </Button>
                  )}
                  {room.status !== "vacant" && room.status !== "cleaning" && (
                    <Button 
                      size="sm" 
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
                          size="sm" 
                          onClick={() => setSelectedRoom(room)}
                        >
                          Complete Cleaning
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Mark Room as Cleaned</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="cleaned-by">Cleaned By</Label>
                            <Input
                              id="cleaned-by"
                              placeholder="Enter name of cleaner"
                              value={cleanedBy}
                              onChange={(e) => setCleanedBy(e.target.value)}
                            />
                          </div>
                          <Button onClick={handleCleaningComplete}>
                            Mark as Clean
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {room.status !== "maintenance" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-hotel-danger text-hotel-danger hover:bg-hotel-danger/10"
                      onClick={() => handleStatusChange(room.id, "maintenance")}
                    >
                      Maintenance
                    </Button>
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

      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Room as Cleaned</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cleaned-by-modal">Cleaned By</Label>
              <Input
                id="cleaned-by-modal"
                placeholder="Enter name of cleaner"
                value={cleanedBy}
                onChange={(e) => setCleanedBy(e.target.value)}
              />
            </div>
            <Button onClick={handleCleaningComplete}>
              Mark as Clean
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rooms;
