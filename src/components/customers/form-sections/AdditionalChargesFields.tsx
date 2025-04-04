
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Control, UseFormWatch } from "react-hook-form";
import { CustomerFormValues } from "../schema";

interface AdditionalChargesFieldsProps {
  control: Control<CustomerFormValues>;
  watch: UseFormWatch<CustomerFormValues>;
}

const AdditionalChargesFields = ({ control, watch }: AdditionalChargesFieldsProps) => {
  const hasGas = watch("hasGas");
  
  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <h3 className="text-lg font-medium">Additional Charges</h3>
      
      <FormField
        control={control}
        name="numberOfPersons"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Number of Persons</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                className="text-base h-10"
              />
            </FormControl>
            <FormDescription className="text-xs">
              First 3 persons are free. Each additional person costs $50.
            </FormDescription>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="hasGas"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Gas Usage</FormLabel>
              <FormDescription className="text-xs">
                Track gas usage for this customer?
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      {hasGas && (
        <FormField
          control={control}
          name="initialGasWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Initial Gas Weight (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter initial gas weight"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  className="text-base h-10"
                />
              </FormControl>
              <FormDescription className="text-xs">
                Current gas weight at check-in
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default AdditionalChargesFields;
