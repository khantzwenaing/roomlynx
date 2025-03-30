
import { useState } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Room, Customer } from "@/types";
import { addCustomer } from "@/services/dataService";
import { useToast } from "@/hooks/use-toast";
import { customerSchema, CustomerFormValues } from "./schema";
import PersonalInfoFields from "./form-sections/PersonalInfoFields";
import BookingFields from "./form-sections/BookingFields";
import DepositFields from "./form-sections/DepositFields";
import FormActions from "./form-sections/FormActions";

interface AddCustomerFormProps {
  rooms: Room[];
  onCustomerAdded: (customer: Customer) => void;
  onClose: () => void;
  preselectedRoomId?: string;
}

const AddCustomerForm = ({ rooms, onCustomerAdded, onClose, preselectedRoomId }: AddCustomerFormProps) => {
  const { toast } = useToast();
  const availableRooms = rooms.filter(room => room.status === 'vacant' || (preselectedRoomId && room.id === preselectedRoomId));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default check-out date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

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
      checkOutDate: tomorrow,
      depositAmount: "",
      depositPaymentMethod: undefined,
      depositCollectedBy: "",
      bankRefNo: undefined
    }
  });

  // Handle check-in date change to ensure check-out date is always after check-in
  const handleCheckInDateChange = (date: Date) => {
    form.setValue("checkInDate", date);
    
    // If check-out date is before or equal to new check-in date, update it
    const currentCheckOut = form.getValues("checkOutDate");
    if (date >= currentCheckOut) {
      const newCheckOut = new Date(date);
      newCheckOut.setDate(date.getDate() + 1);
      form.setValue("checkOutDate", newCheckOut);
    }
  };

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Adding customer with data:", data);
      
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
        depositCollectedBy: data.depositCollectedBy,
        bankRefNo: data.depositPaymentMethod === 'bank_transfer' ? data.bankRefNo : undefined
      });

      if (newCustomer) {
        console.log("Customer added successfully:", newCustomer);
        onCustomerAdded(newCustomer);
        form.reset();

        toast({
          title: "Success",
          description: `Customer ${newCustomer.name} has been added successfully`,
        });
      } else {
        throw new Error("Failed to add customer");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-8">
        <div className="grid grid-cols-1 gap-4">
          <PersonalInfoFields control={form.control} />
          <BookingFields 
            control={form.control} 
            availableRooms={availableRooms} 
            preselectedRoomId={preselectedRoomId}
            handleCheckInDateChange={handleCheckInDateChange}
          />
        </div>
        
        <DepositFields control={form.control} watch={form.watch} />
        <FormActions isSubmitting={isSubmitting} onClose={onClose} />
      </form>
    </Form>
  );
};

export default AddCustomerForm;
