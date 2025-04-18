
import React, { useState, useEffect } from "react";
import { getPayments, getCustomers, getRooms, resetDatabase } from "@/services/dataService";
import { Payment, Customer, Room, PaymentStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentList from "@/components/payments/PaymentList";
import PaymentFilters from "@/components/payments/PaymentFilters";
import PaymentDialog from "@/components/payments/PaymentDialog";
import { PaymentFormValues } from "@/components/payments/PaymentForm";
import { toast } from "sonner";

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast: hookToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const paymentsData = await getPayments();
        const customersData = await getCustomers();
        const roomsData = await getRooms();
        setPayments(paymentsData);
        setCustomers(customersData);
        setRooms(roomsData);
      } catch (error) {
        console.error("Error fetching payment data:", error);
        hookToast({
          title: "Error",
          description: "Failed to load payment data",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, [hookToast]);

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      const newPayment = await addPayment({
        customerId: data.customerId,
        roomId: data.roomId,
        amount: Number(data.amount),
        date: new Date().toISOString(),
        method: data.method as 'cash' | 'card' | 'bank_transfer' | 'other',
        status: data.status as PaymentStatus,
        paymentType: data.paymentType,
        collectedBy: data.collectedBy,
        notes: data.method === "bank_transfer" 
          ? `Bank Ref: ${data.bankRefNo || "N/A"}` 
          : data.notes || "",
        isRefund: false
      });

      if (newPayment) {
        setPayments([...payments, newPayment]);
        setOpenAddDialog(false);

        toast(`Payment of ₹${newPayment.amount} has been recorded successfully`);
      } else {
        throw new Error("Failed to add payment");
      }
    } catch (error) {
      toast.error("Failed to add payment");
    }
  };

  const handleResetDatabase = async () => {
    try {
      setIsResetting(true);
      toast("Resetting database...");
      
      const success = await resetDatabase();
      
      if (success) {
        // Refresh data after reset
        const paymentsData = await getPayments();
        const customersData = await getCustomers();
        const roomsData = await getRooms();
        
        setPayments(paymentsData);
        setCustomers(customersData);
        setRooms(roomsData);
        
        toast("Database reset complete! The system has been reset to its initial state.");
        
        // Force page refresh to update all components
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error("Failed to reset database");
      }
    } catch (error) {
      console.error("Error resetting database:", error);
      toast.error(`Failed to reset database: ${(error as Error).message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={isResetting}>
                <RotateCcw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                {isResetting ? 'Resetting...' : 'Reset Database'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Database</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will reset all data to its initial state. All customers, payment records, and room statuses will be reset. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetDatabase}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <PaymentDialog 
            isOpen={openAddDialog} 
            setIsOpen={setOpenAddDialog} 
            onSubmit={onSubmit} 
            customers={customers} 
            rooms={rooms} 
          />
        </div>
      </div>

      <PaymentFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <PaymentList 
        payments={payments}
        customers={customers}
        rooms={rooms}
        searchTerm={searchTerm}
      />
    </div>
  );
};

export default Payments;
