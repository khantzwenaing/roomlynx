import React, { useState, useEffect } from "react";
import { getPayments, getCustomers, getRooms, addPayment, resetDatabase } from "@/services/dataService";
import { Payment, Customer, Room } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RotateCcw } from "lucide-react";

const paymentSchema = z.object({
  customerId: z.string({required_error: "Customer is required"}),
  roomId: z.string({required_error: "Room is required"}),
  amount: z.string().min(1, "Amount is required").refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  method: z.enum(["cash", "card", "bank_transfer", "other"], {
    required_error: "Payment method is required",
  }),
  status: z.enum(["paid", "pending", "partial"], {
    required_error: "Payment status is required",
  }),
  collectedBy: z.string({required_error: "Collector name is required"}),
  notes: z.string().optional().or(z.literal("")),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      customerId: "",
      roomId: "",
      amount: "",
      method: "cash",
      status: "paid",
      collectedBy: "",
      notes: "",
    }
  });

  useEffect(() => {
    setPayments(getPayments());
    setCustomers(getCustomers());
    setRooms(getRooms());
  }, []);

  const watchCustomerId = form.watch("customerId");
  useEffect(() => {
    if (watchCustomerId) {
      const customer = customers.find(c => c.id === watchCustomerId);
      if (customer) {
        form.setValue("roomId", customer.roomId);
      }
    }
  }, [watchCustomerId, customers, form]);

  const filteredPayments = payments.filter((payment) => {
    const customer = customers.find((c) => c.id === payment.customerId);
    const room = rooms.find((r) => r.id === payment.roomId);
    
    return (
      (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (room && room.roomNumber.includes(searchTerm)) ||
      payment.amount.toString().includes(searchTerm)
    );
  });

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown";
  };

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.roomNumber : "Unknown";
  };

  const getPaymentStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return "bg-hotel-success";
      case "pending":
        return "bg-hotel-warning";
      case "partial":
        return "bg-hotel-primary";
      default:
        return "bg-gray-500";
    }
  };

  const onSubmit = (data: PaymentFormValues) => {
    try {
      const newPayment = addPayment({
        customerId: data.customerId,
        roomId: data.roomId,
        amount: Number(data.amount),
        date: new Date().toISOString(),
        method: data.method,
        status: data.status,
        collectedBy: data.collectedBy,
        notes: data.notes || undefined
      });

      setPayments([...payments, newPayment]);
      setOpenAddDialog(false);
      form.reset();

      toast({
        title: "Success",
        description: `Payment of $${newPayment.amount} has been recorded successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment",
        variant: "destructive",
      });
    }
  };

  const handleResetDatabase = () => {
    const success = resetDatabase();
    if (success) {
      setPayments(getPayments());
      setCustomers(getCustomers());
      setRooms(getRooms());
      toast({
        title: "Database Reset",
        description: "Database has been reset to its initial state.",
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
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button>Add New Payment</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Payment</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="roomId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={!!watchCustomerId}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Auto-selected from customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {rooms.map((room) => (
                                <SelectItem key={room.id} value={room.id}>
                                  Room {room.roomNumber}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="partial">Partial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="collectedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Collected By</FormLabel>
                          <FormControl>
                            <Input placeholder="Staff name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional notes about the payment" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Payment</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="w-full md:w-1/2 lg:w-1/3">
        <Label htmlFor="search">Search Payments</Label>
        <Input
          id="search"
          placeholder="Search by customer, room or amount..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">${payment.amount}</CardTitle>
                <Badge className={getPaymentStatusColor(payment.status)}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {getCustomerName(payment.customerId)}
                </div>
                <div className="text-sm text-gray-500">
                  Room {getRoomNumber(payment.roomId)}
                </div>
                <div className="text-sm text-gray-500">
                  Date: {new Date(payment.date).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-500">
                  Method: {payment.method.replace('_', ' ').charAt(0).toUpperCase() + payment.method.replace('_', ' ').slice(1)}
                </div>
                <div className="text-sm text-gray-500">
                  Collected by: {payment.collectedBy}
                </div>
                {payment.notes && (
                  <div className="text-sm text-gray-500">
                    Notes: {payment.notes}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Payments;
