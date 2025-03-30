
import React, { useState, useEffect } from "react";
import { getRooms, getDailyReports, getCustomers } from "@/services/dataService";
import { Room, DailyReport, Customer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, 
  Legend, ResponsiveContainer, PieChart, Pie 
} from "recharts";
import { BedDouble, ChartPieIcon, CreditCard, Users, Calendar, Clock, Bell, BellRing, Broom } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Dashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomsData = await getRooms();
        const reportsData = await getDailyReports();
        const customersData = await getCustomers();
        setRooms(roomsData);
        setReports(reportsData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const roomStatusCounts = {
    vacant: rooms.filter((r) => r.status === "vacant").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
    cleaning: rooms.filter((r) => r.status === "cleaning").length,
  };

  // Sort checkout reminders by date (closest first)
  const upcomingCheckouts = customers
    .filter(customer => {
      const checkoutDate = parseISO(customer.checkOutDate);
      const today = new Date();
      // Only include upcoming checkouts within the next 7 days
      return isAfter(checkoutDate, today) && isBefore(checkoutDate, addDays(today, 7));
    })
    .sort((a, b) => {
      return parseISO(a.checkOutDate).getTime() - parseISO(b.checkOutDate).getTime();
    });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Occupied Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomStatusCounts.occupied}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((roomStatusCounts.occupied / rooms.length) * 100)}% occupancy rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Available Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomStatusCounts.vacant}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Cleaning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Broom className="h-4 w-4 text-hotel-warning" />
              <div className="text-2xl font-bold">{roomStatusCounts.cleaning}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Rooms pending cleaning
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checkout Reminders */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Checkouts</CardTitle>
            <BellRing className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {upcomingCheckouts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Check-in Date</TableHead>
                    <TableHead>Check-out Date</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingCheckouts.map((customer) => {
                    const room = rooms.find(r => r.id === customer.roomId);
                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {room ? room.roomNumber : 'Unknown'}
                        </TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>
                          {format(parseISO(customer.checkInDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-hotel-primary" />
                            {format(parseISO(customer.checkOutDate), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>{customer.phone}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No upcoming checkouts in the next 7 days
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Room Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Room Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-hotel-success"></div>
                <span className="text-sm font-medium">Vacant</span>
              </div>
              <div className="text-2xl font-bold">{roomStatusCounts.vacant}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-hotel-primary"></div>
                <span className="text-sm font-medium">Occupied</span>
              </div>
              <div className="text-2xl font-bold">{roomStatusCounts.occupied}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-hotel-warning"></div>
                <span className="text-sm font-medium">Cleaning</span>
              </div>
              <div className="text-2xl font-bold">{roomStatusCounts.cleaning}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-hotel-danger"></div>
                <span className="text-sm font-medium">Maintenance</span>
              </div>
              <div className="text-2xl font-bold">{roomStatusCounts.maintenance}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
