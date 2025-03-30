import React, { useState, useEffect } from "react";
import { getCustomers, getRooms, addCustomer } from "@/services/dataService";
import { Customer, Room } from "@/types";
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
import { Banknote, CreditCard } from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Valid phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  idNumber: z.string().optional().or(z.literal("")),
  roomId: z.string({required_error: "Room is required"}),
  checkInDate: z.string({required_error: "Check-in date is required"}),
  checkOutDate: z.string({required_error: "Check-out date is required"}),
  depositAmount: z.string().optional().refine(val => val === '' || (Number(val) > 0), {
    message: "Deposit amount must be a positive number"
  }),
  depositPaymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'other']).optional(),
  bankRefNo: z.string().optional()
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      idNumber: "",
      roomId: "",
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      depositAmount: "",
      depositPaymentMethod: undefined,
      bankRefNo: undefined
    }
  });

  useEffect(() => {
    setCustomers(getCustomers());
    setRooms(getRooms());
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCheckoutStatus = (checkOutDate: string) => {
    const today = new Date();
    const checkout = new Date(checkOutDate);
    const diffTime = checkout.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Checked Out", color: "bg-gray-500" };
    if (diffDays === 0) return { label: "Today", color: "bg-hotel-warning" };
    if (diffDays <= 2) return { label: `${diffDays} days`, color: "bg-hotel-primary" };
    return { label: `${diffDays} days`, color: "bg-hotel-success" };
  };

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.roomNumber : "Unknown";
  };

  const availableRooms = rooms.filter(room => room.status === 'vacant');

  const onSubmit = (data: CustomerFormValues) => {
    try {
      const newCustomer = addCustomer({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        idNumber: data.idNumber || undefined,
        roomId: data.roomId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        depositAmount: data.depositAmount ? Number(data.depositAmount) : undefined,
        depositPaymentMethod: data.depositPaymentMethod,
        bankRefNo: data.depositPaymentMethod === 'bank_transfer' ? data.bankRefNo : undefined
      });

      setCustomers([...customers, newCustomer]);
      setOpenAddDialog(false);
      form.reset();

      toast({
        title: "Success",
        description: `Customer ${newCustomer.name} has been added successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>Add New Customer</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="123-456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="ID12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Address (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, City" {...field} />
                        </FormControl>
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
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a room" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableRooms.map((room) => (
                              <SelectItem key={room.id} value={room.id}>
                                Room {room.roomNumber} ({room.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="checkInDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-in Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="checkOutDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-out Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="depositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Amount (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter deposit amount" 
                          min="0"
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value === '' ? '' : e.target.value;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('depositAmount') && form.watch('depositAmount') > 0 && (
                  <>
                    <FormField
                      control={form.control}
                      name="depositPaymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deposit Payment Method</FormLabel>
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

                    {form.watch('depositPaymentMethod') === 'bank_transfer' && (
                      <FormField
                        control={form.control}
                        name="bankRefNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Reference Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter bank transaction reference" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}

                <DialogFooter>
                  <Button type="submit">Add Customer</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-full md:w-1/2 lg:w-1/3">
        <Label htmlFor="search">Search Customers</Label>
        <Input
          id="search"
          placeholder="Search by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => {
          const checkoutStatus = getCheckoutStatus(customer.checkOutDate);
          
          return (
            <Card key={customer.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{customer.name}</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Customer Details</DialogTitle>
                      </DialogHeader>
                      {selectedCustomer && (
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label>Name</Label>
                              <div className="border p-2 rounded-md bg-gray-50">
                                {selectedCustomer.name}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Phone</Label>
                              <div className="border p-2 rounded-md bg-gray-50">
                                {selectedCustomer.phone}
                              </div>
                            </div>
                            {selectedCustomer.email && (
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <div className="border p-2 rounded-md bg-gray-50">
                                  {selectedCustomer.email}
                                </div>
                              </div>
                            )}
                            {selectedCustomer.address && (
                              <div className="space-y-2">
                                <Label>Address</Label>
                                <div className="border p-2 rounded-md bg-gray-50">
                                  {selectedCustomer.address}
                                </div>
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label>Room</Label>
                              <div className="border p-2 rounded-md bg-gray-50">
                                Room {getRoomNumber(selectedCustomer.roomId)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Check-in / Check-out</Label>
                              <div className="border p-2 rounded-md bg-gray-50">
                                {new Date(selectedCustomer.checkInDate).toLocaleDateString()} to {new Date(selectedCustomer.checkOutDate).toLocaleDateString()}
                              </div>
                            </div>
                            {selectedCustomer.depositAmount && selectedCustomer.depositAmount > 0 && (
                              <div className="space-y-2">
                                <Label>Deposit</Label>
                                <div className="border p-2 rounded-md bg-gray-50 flex justify-between">
                                  <span>${selectedCustomer.depositAmount}</span>
                                  <span className="flex items-center text-sm">
                                    {selectedCustomer.depositPaymentMethod === 'cash' && (
                                      <><Banknote size={14} className="mr-1" /> Cash</>
                                    )}
                                    {selectedCustomer.depositPaymentMethod === 'card' && (
                                      <><CreditCard size={14} className="mr-1" /> Card</>
                                    )}
                                    {selectedCustomer.depositPaymentMethod === 'bank_transfer' && (
                                      <><CreditCard size={14} className="mr-1" /> Bank Transfer</>
                                    )}
                                  </span>
                                </div>
                                {selectedCustomer.depositPaymentMethod === 'bank_transfer' && selectedCustomer.bankRefNo && (
                                  <div className="text-sm text-gray-500">
                                    Ref: {selectedCustomer.bankRefNo}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">
                    {customer.phone} {customer.email && `• ${customer.email}`}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Room {getRoomNumber(customer.roomId)}</span>
                    <Badge className={checkoutStatus.color}>
                      {checkoutStatus.label}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Check-in: {new Date(customer.checkInDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Check-out: {new Date(customer.checkOutDate).toLocaleDateString()}
                  </div>
                  {customer.depositAmount && customer.depositAmount > 0 && (
                    <div className="text-sm text-green-600 mt-2">
                      Deposit: ${customer.depositAmount}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Customers;
