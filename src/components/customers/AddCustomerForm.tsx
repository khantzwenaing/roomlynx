
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
import AdditionalChargesFields from "./form-sections/AdditionalChargesFields";
import FormActions from "./form-sections/FormActions";
import { getCurrentISTDate } from "@/utils/date-utils";

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

  // Set default check-in date to current IST
  const currentDate = getCurrentISTDate();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      idNumber: "",
      roomId: preselectedRoomId || "",
      checkInDate: currentDate,
      depositAmount: "",
      depositPaymentMethod: undefined,
      depositCollectedBy: "",
      bankRefNo: undefined,
      numberOfPersons: 1,
      hasGas: false,
      initialGasWeight: undefined
    }
  });

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Adding customer with data:", data);
      
      // Validate required fields
      if (!data.depositAmount || !data.depositPaymentMethod || !data.depositCollectedBy) {
        toast({
          title: "Validation Error",
          description: "Please enter all required deposit information",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Set a default "checkout" date 30 days from now
      // This is just a placeholder and not actually used for calculations
      const tempCheckoutDate = new Date(data.checkInDate);
      tempCheckoutDate.setDate(tempCheckoutDate.getDate() + 30);
      
      const newCustomer = await addCustomer({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        idNumber: data.idNumber || undefined,
        roomId: data.roomId,
        checkInDate: data.checkInDate.toISOString().split('T')[0],
        checkOutDate: tempCheckoutDate.toISOString().split('T')[0], // Placeholder checkout date
        depositAmount: data.depositAmount ? Number(data.depositAmount) : undefined,
        depositPaymentMethod: data.depositPaymentMethod,
        depositCollectedBy: data.depositCollectedBy,
        bankRefNo: data.depositPaymentMethod === 'bank_transfer' ? data.bankRefNo : undefined,
        numberOfPersons: data.numberOfPersons,
        hasGas: data.hasGas,
        initialGasWeight: data.hasGas ? data.initialGasWeight : undefined
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
          />
        </div>
        
        <DepositFields control={form.control} watch={form.watch} />
        <AdditionalChargesFields control={form.control} watch={form.watch} />
        <FormActions isSubmitting={isSubmitting} onClose={onClose} />
      </form>
    </Form>
  );
};

export default AddCustomerForm;
