
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { CustomerFormValues } from "../schema";

interface PersonalInfoFieldsProps {
  control: Control<CustomerFormValues>;
}

const PersonalInfoFields = ({ control }: PersonalInfoFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} className="text-base h-10" />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Phone</FormLabel>
            <FormControl>
              <Input placeholder="123-456-7890" {...field} className="text-base h-10" />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Email (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="email@example.com" {...field} className="text-base h-10" />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="idNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">ID Number (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="ID12345" {...field} className="text-base h-10" />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Address (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="123 Main St, City" {...field} className="text-base h-10" />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </>
  );
};

export default PersonalInfoFields;
