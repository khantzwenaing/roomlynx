
import React, { useState, useEffect } from "react";
import { getDailyReports, generateDailyReport } from "@/services/dataService";
import { DailyReport } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setReports(getDailyReports().sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }, []);

  const handleGenerateReport = () => {
    const newReport = generateDailyReport();
    setReports([newReport, ...reports]);
    toast({
      title: "Report Generated",
      description: "Daily report has been generated successfully",
    });
  };

  const chartData = [...reports]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map((report) => ({
      date: new Date(report.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      occupiedRooms: report.occupiedRooms,
      vacantRooms: report.vacantRooms,
      revenue: report.totalRevenue,
      checkIns: report.expectedCheckIns,
      checkOuts: report.expectedCheckOuts,
    }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Daily Reports</h1>
        <Button onClick={handleGenerateReport}>Generate Today's Report</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="occupiedRooms" 
                    name="Occupied Rooms" 
                    stroke="#0EA5E9" 
                    fill="#0EA5E9" 
                    fillOpacity={0.3} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="vacantRooms" 
                    name="Vacant Rooms" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" name="Revenue ($)" fill="#22D3EE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-right">Occupied</th>
                  <th className="px-4 py-2 text-right">Vacant</th>
                  <th className="px-4 py-2 text-right">Need Cleaning</th>
                  <th className="px-4 py-2 text-right">Check-ins</th>
                  <th className="px-4 py-2 text-right">Check-outs</th>
                  <th className="px-4 py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {new Date(report.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right">{report.occupiedRooms}</td>
                    <td className="px-4 py-2 text-right">{report.vacantRooms}</td>
                    <td className="px-4 py-2 text-right">{report.roomsNeedCleaning}</td>
                    <td className="px-4 py-2 text-right">{report.expectedCheckIns}</td>
                    <td className="px-4 py-2 text-right">{report.expectedCheckOuts}</td>
                    <td className="px-4 py-2 text-right font-medium">${report.totalRevenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
