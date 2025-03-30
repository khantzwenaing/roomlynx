
import React, { useState, useEffect } from "react";
import { getPayments, getCustomers, getRooms, addPayment, resetDatabase } from "@/services/dataService";
import { Payment, Customer, Room } from "@/types";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentList from "@/components/payments/PaymentList";
import PaymentFilters from "@/components/payments/PaymentFilters";
import PaymentDialog from "@/components/payments/PaymentDialog";
import { PaymentFormValues } from "@/components/payments/PaymentForm";

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const { toast } = useToast();

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
        toast({
          title: "Error",
          description: "Failed to load payment data",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, [toast]);

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      const newPayment = await addPayment({
        customerId: data.customerId,
        roomId: data.roomId,
        amount: Number(data.amount),
        date: new Date().toISOString(),
        method: data.method as 'cash' | 'card' | 'bank_transfer' | 'other',
        status: data.status as 'paid' | 'pending' | 'partial',
        paymentType: data.paymentType,
        collectedBy: data.collectedBy,
        notes: data.method === "bank_transfer" 
          ? `Bank Ref: ${data.bankRefNo || "N/A"}` 
          : data.notes || undefined
      });

      if (newPayment) {
        setPayments([...payments, newPayment]);
        setOpenAddDialog(false);

        toast({
          title: "Success",
          description: `Payment of $${newPayment.amount} has been recorded successfully`,
        });
      } else {
        throw new Error("Failed to add payment");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment",
        variant: "destructive",
      });
    }
  };

  const handleResetDatabase = async () => {
    try {
      const success = await resetDatabase();
      if (success) {
        const paymentsData = await getPayments();
        const customersData = await getCustomers();
        const roomsData = await getRooms();
        
        setPayments(paymentsData);
        setCustomers(customersData);
        setRooms(roomsData);
        
        toast({
          title: "Database Reset",
          description: "Database has been reset to its initial state with fresh rooms.",
          duration: 5000,
        });
        
        // Force page refresh to update all components
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error("Failed to reset database");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset database",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset Database
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
