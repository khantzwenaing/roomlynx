
import React, { useState, useEffect } from "react";
import { getDailyReports, generateDailyReport } from "@/services/dataService";
import { DailyReport } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

const Reports = () => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const data = await getDailyReports();
        // Sort reports by date (newest first)
        const sortedData = [...data].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setReports(sortedData);
      } catch (error) {
        console.error("Error loading reports:", error);
        toast({
          title: "Error",
          description: "Failed to load reports",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReports();
  }, [toast]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const newReport = await generateDailyReport();
      if (newReport) {
        setReports([newReport, ...reports]);
        toast({
          title: "Report Generated",
          description: "Daily report has been generated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate report",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Daily Reports</h1>
        <Button 
          onClick={handleGenerateReport} 
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Today's Report"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-green-600">
              <ArrowUpIcon className="mr-2 h-5 w-5" />
              Cash In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${reports.length > 0 ? reports[0].cashIn || 0 : 0}
            </div>
            <p className="text-sm text-gray-500">Today's incoming payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-red-600">
              <ArrowDownIcon className="mr-2 h-5 w-5" />
              Cash Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${reports.length > 0 ? reports[0].cashOut || 0 : 0}
            </div>
            <p className="text-sm text-gray-500">Today's refunds and expenses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg text-gray-500">Loading reports...</div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-500">No reports found</div>
              <Button 
                onClick={handleGenerateReport} 
                className="mt-4"
                disabled={isGenerating}
              >
                Generate Your First Report
              </Button>
            </div>
          ) : (
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
                    <th className="px-4 py-2 text-right">Cash In</th>
                    <th className="px-4 py-2 text-right">Cash Out</th>
                    <th className="px-4 py-2 text-right">Net Revenue</th>
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
                      <td className="px-4 py-2 text-right font-medium text-green-600">${report.cashIn || 0}</td>
                      <td className="px-4 py-2 text-right font-medium text-red-600">${report.cashOut || 0}</td>
                      <td className="px-4 py-2 text-right font-medium">${report.totalRevenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
