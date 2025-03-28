
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRooms, getCustomers, getReminders, getDailyReports } from "@/services/dataService";
import { Room, Customer, RentReminder, DailyReport } from "@/types";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reminders, setReminders] = useState<RentReminder[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    setRooms(getRooms());
    setCustomers(getCustomers());
    setReminders(getReminders());
    setReports(getDailyReports());
  }, []);

  const upcomingCheckouts = customers.filter(
    (c) => new Date(c.checkOutDate) > new Date() && 
           new Date(c.checkOutDate) < new Date(Date.now() + 2 * 86400000)
  );

  const roomStatusCounts = {
    vacant: rooms.filter((r) => r.status === "vacant").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
    cleaning: rooms.filter((r) => r.status === "cleaning").length,
  };

  const pendingReminders = reminders.filter((r) => r.status === "pending");

  const chartData = reports.slice(0, 7).map((report) => ({
    date: new Date(report.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    occupiedRooms: report.occupiedRooms,
    vacantRooms: report.vacantRooms,
    revenue: report.totalRevenue,
  })).reverse();

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
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roomStatusCounts.cleaning + roomStatusCounts.maintenance}
            </div>
            <div className="flex gap-2 mt-1">
              <Badge className="bg-hotel-warning">{roomStatusCounts.cleaning} cleaning</Badge>
              <Badge className="bg-hotel-danger">{roomStatusCounts.maintenance} maintenance</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Room Occupancy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="occupiedRooms" name="Occupied" fill="#0EA5E9" />
                  <Bar dataKey="vacantRooms" name="Vacant" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Checkout Reminders */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Checkouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingCheckouts.length > 0 ? (
                upcomingCheckouts.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">
                        Room {rooms.find((r) => r.id === customer.roomId)?.roomNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {new Date(customer.checkOutDate).toLocaleDateString()}
                      </div>
                      <Badge 
                        className={
                          new Date(customer.checkOutDate).getTime() - Date.now() < 86400000 
                            ? "bg-hotel-danger" 
                            : "bg-hotel-warning"
                        }
                      >
                        {new Date(customer.checkOutDate).toLocaleDateString() === 
                         new Date().toLocaleDateString() 
                          ? "Today" 
                          : "Soon"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No upcoming checkouts in the next 48 hours
                </div>
              )}
            </div>
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
