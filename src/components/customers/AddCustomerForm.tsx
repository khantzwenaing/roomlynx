
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Room, Customer } from "@/types";
import { addCustomer } from "@/services/dataService";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";

const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Valid phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  idNumber: z.string().optional().or(z.literal("")),
  roomId: z.string({required_error: "Room is required"}),
  checkInDate: z.date({required_error: "Check-in date is required"}),
  checkOutDate: z.date({required_error: "Check-out date is required"}),
  depositAmount: z.string().optional().refine(val => val === '' || (Number(val) > 0), {
    message: "Deposit amount must be a positive number"
  }),
  depositPaymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'other']).optional(),
  bankRefNo: z.string().optional()
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface AddCustomerFormProps {
  rooms: Room[];
  onCustomerAdded: (customer: Customer) => void;
  onClose: () => void;
  preselectedRoomId?: string;
}

const AddCustomerForm = ({ rooms, onCustomerAdded, onClose, preselectedRoomId }: AddCustomerFormProps) => {
  const { toast } = useToast();
  const availableRooms = rooms.filter(room => room.status === 'vacant');

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      idNumber: "",
      roomId: preselectedRoomId || "",
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + 86400000),
      depositAmount: "",
      depositPaymentMethod: undefined,
      bankRefNo: undefined
    }
  });

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      const newCustomer = await addCustomer({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        idNumber: data.idNumber || undefined,
        roomId: data.roomId,
        checkInDate: data.checkInDate.toISOString().split('T')[0],
        checkOutDate: data.checkOutDate.toISOString().split('T')[0],
        depositAmount: data.depositAmount ? Number(data.depositAmount) : undefined,
        depositPaymentMethod: data.depositPaymentMethod,
        bankRefNo: data.depositPaymentMethod === 'bank_transfer' ? data.bankRefNo : undefined
      });

      if (newCustomer) {
        onCustomerAdded(newCustomer);
        onClose();
        form.reset();

        toast({
          title: "Success",
          description: `Customer ${newCustomer.name} has been added successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add customer",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} className="text-lg h-12" />
                </FormControl>
                <FormMessage className="text-base" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Phone</FormLabel>
                <FormControl>
                  <Input placeholder="123-456-7890" {...field} className="text-lg h-12" />
                </FormControl>
                <FormMessage className="text-base" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Email (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} className="text-lg h-12" />
                </FormControl>
                <FormMessage className="text-base" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="idNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">ID Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="ID12345" {...field} className="text-lg h-12" />
                </FormControl>
                <FormMessage className="text-base" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel className="text-lg">Address (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, City" {...field} className="text-lg h-12" />
                </FormControl>
                <FormMessage className="text-base" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Room</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="text-lg h-12">
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="text-lg">
                    {availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id} className="text-lg py-3">
                        Room {room.roomNumber} ({room.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-base" />
              </FormItem>
            )}
          />
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="checkInDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DatePicker 
                      date={field.value} 
                      onDateChange={field.onChange} 
                      label="Check-in Date"
                    />
                  </FormControl>
                  <FormMessage className="text-base" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="checkOutDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DatePicker 
                      date={field.value} 
                      onDateChange={field.onChange} 
                      label="Check-out Date"
                    />
                  </FormControl>
                  <FormMessage className="text-base" />
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
              <FormLabel className="text-lg">Deposit Amount (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter deposit amount" 
                  min="0"
                  className="text-lg h-12"
                  {...field} 
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : e.target.value;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage className="text-base" />
            </FormItem>
          )}
        />

        {form.watch('depositAmount') && form.watch('depositAmount') !== '' && Number(form.watch('depositAmount')) > 0 && (
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
          <Button type="submit" className="text-lg py-6 px-8">Add Customer</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default AddCustomerForm;
