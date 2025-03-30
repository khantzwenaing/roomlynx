
import React, { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Room, Customer } from "@/types";

interface ReminderWithDetails {
  id: string;
  roomId: string;
  customerId: string;
  checkoutDate: string;
  reminderDate: string;
  status: string;
  roomNumber: string;
  customerName: string;
}

const CheckoutReminderAlert = () => {
  const [reminders, setReminders] = useState<ReminderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReminders = async () => {
      setIsLoading(true);
      try {
        // Get today's date at the start of the day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Query reminders that should be shown today
        const { data: reminderData, error } = await supabase
          .from("rent_reminders")
          .select("*, rooms!rent_reminders_roomid_fkey(roomnumber), customers!rent_reminders_customerid_fkey(name)")
          .eq("status", "pending")
          .lte("reminderdate", new Date().toISOString())
          .order("checkoutdate", { ascending: true });

        if (error) {
          console.error("Error fetching reminders:", error);
          return;
        }

        // Map to simplified format
        const formattedReminders = reminderData.map(reminder => ({
          id: reminder.id,
          roomId: reminder.roomid,
          customerId: reminder.customerid,
          checkoutDate: reminder.checkoutdate,
          reminderDate: reminder.reminderdate,
          status: reminder.status,
          roomNumber: reminder.rooms?.roomnumber || "Unknown",
          customerName: reminder.customers?.name || "Unknown Guest"
        }));

        setReminders(formattedReminders);
      } catch (err) {
        console.error("Error in reminder fetch:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminders();
    
    // Set up a refresh interval
    const interval = setInterval(fetchReminders, 3600000); // Refresh every hour
    
    return () => clearInterval(interval);
  }, []);

  const handleMarkAcknowledged = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from("rent_reminders")
        .update({ status: "acknowledged" })
        .eq("id", reminderId);

      if (error) {
        console.error("Error updating reminder status:", error);
        return;
      }

      // Update local state
      setReminders(prev => prev.filter(r => r.id !== reminderId));
    } catch (err) {
      console.error("Error acknowledging reminder:", err);
    }
  };

  const navigateToRoom = (roomId: string) => {
    navigate(`/room-details?roomId=${roomId}`);
  };

  if (isLoading || reminders.length === 0) {
    return null;
  }

  return (
    <Alert className="bg-yellow-50 border-yellow-200 mb-6">
      <Bell className="h-5 w-5 text-yellow-600" />
      <AlertTitle className="text-yellow-800 flex items-center gap-2">
        Checkout Reminders
      </AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2">
          {reminders.map((reminder) => (
            <div 
              key={reminder.id} 
              className="flex justify-between items-center p-2 border-b border-yellow-100"
            >
              <div>
                <span className="font-medium">Room {reminder.roomNumber}</span>: {reminder.customerName} checking out 
                <span className="font-medium"> {format(parseISO(reminder.checkoutDate), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8"
                  onClick={() => navigateToRoom(reminder.roomId)}
                >
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8"
                  onClick={() => handleMarkAcknowledged(reminder.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default CheckoutReminderAlert;
