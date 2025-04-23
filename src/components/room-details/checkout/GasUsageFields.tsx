import { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { calculateGasCharge } from "@/services/settingsService";

interface GasUsageFieldsProps {
  initialWeight: number;
  onGasChargeCalculated: (charge: number, finalWeight: number) => void;
  disabled?: boolean;
}

const gasUsageSchema = z.object({
  finalWeight: z
    .number()
    .min(0, "Final weight must be 0 or greater")
    .refine((val) => val !== undefined, {
      message: "Final weight is required",
    }),
});

type GasUsageFormValues = z.infer<typeof gasUsageSchema>;

const GasUsageFields = ({
  initialWeight,
  onGasChargeCalculated,
  disabled = false,
}: GasUsageFieldsProps) => {
  const [calculatedCharge, setCalculatedCharge] = useState<number | null>(null);
  const [gasUsed, setGasUsed] = useState<number>(0);

  const form = useForm<GasUsageFormValues>({
    resolver: zodResolver(gasUsageSchema),
    defaultValues: {
      finalWeight: 0,
    },
  });

  const handleCalculate = async (values: GasUsageFormValues) => {
    try {
      const { finalWeight } = values;
      if (finalWeight > initialWeight) {
        form.setError("finalWeight", {
          type: "manual",
          message: "Final weight cannot be greater than initial weight",
        });
        return;
      }

      const charge = await calculateGasCharge(initialWeight, finalWeight);
      const used = initialWeight - finalWeight;
      setGasUsed(used);
      setCalculatedCharge(charge);
      onGasChargeCalculated(charge, finalWeight);
    } catch (error) {
      console.error("Error calculating gas charge:", error);
    }
  };

  return (
    <div className="p-4 border border-blue-200 rounded-md bg-blue-50">
      <h3 className="font-medium text-lg mb-3">Gas Usage Calculation</h3>

      <div className="mb-4">
        <div className="text-sm font-medium">Initial Gas Weight:</div>
        <div className="text-lg font-bold">{initialWeight} kg</div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleCalculate)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="finalWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Final Gas Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={initialWeight}
                    placeholder="Enter final weight"
                    disabled={disabled}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormDescription>
                  Current weight of gas cylinder at checkout
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" variant="secondary" disabled={disabled}>
            Calculate Gas Charge
          </Button>

          {calculatedCharge !== null && (
            <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-md space-y-1">
              <div className="text-sm">Gas Usage: {gasUsed.toFixed(2)} kg</div>
              <div className="text-lg font-bold">
                Gas Charge: ₹{calculatedCharge.toFixed(2)}
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default GasUsageFields;
