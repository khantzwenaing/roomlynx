
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control, UseFormWatch } from "react-hook-form";
import { CustomerFormValues } from "../AddCustomerForm";

interface DepositFieldsProps {
  control: Control<CustomerFormValues>;
  watch: UseFormWatch<CustomerFormValues>;
}

const DepositFields = ({ control, watch }: DepositFieldsProps) => {
  const depositAmount = watch('depositAmount');
  const depositPaymentMethod = watch('depositPaymentMethod');
  const showDepositFields = depositAmount && depositAmount !== '' && Number(depositAmount) > 0;

  return (
    <>
      <FormField
        control={control}
        name="depositAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Deposit Amount</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Enter deposit amount" 
                min="0"
                className="text-base h-10"
                {...field} 
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : e.target.value;
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {showDepositFields && (
        <>
          <FormField
            control={control}
            name="depositPaymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Deposit Payment Method</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="text-base h-10">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="depositCollectedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Collected By</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter staff name who collected the deposit" 
                    {...field} 
                    className="text-base h-10"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {depositPaymentMethod === 'bank_transfer' && (
            <FormField
              control={control}
              name="bankRefNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Bank Reference Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter bank transaction reference" 
                      {...field} 
                      className="text-base h-10"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          )}
        </>
      )}
    </>
  );
};

export default DepositFields;
