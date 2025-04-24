
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Banknote, CreditCard } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { refundDetailsSchema, type RefundDetailsFormData } from "./RefundDetailsFormSchema";

interface RefundDetailsFormProps {
  onSubmit: (data: RefundDetailsFormData) => void;
  defaultValues?: Partial<RefundDetailsFormData>;
  disabled?: boolean;
}

const RefundDetailsForm = ({
  onSubmit,
  defaultValues,
  disabled = false
}: RefundDetailsFormProps) => {
  const form = useForm<RefundDetailsFormData>({
    resolver: zodResolver(refundDetailsSchema),
    defaultValues: {
      method: 'cash',
      collectedBy: '',
      notes: '',
      bankRefNo: '',
      ...defaultValues
    }
  });

  const watchMethod = form.watch('method');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Refund Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2"
                  disabled={disabled}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="refund-cash" />
                    <Label htmlFor="refund-cash" className="flex items-center">
                      <Banknote className="mr-2" size={20} />
                      Cash
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank_transfer" id="refund-bank" />
                    <Label htmlFor="refund-bank" className="flex items-center">
                      <CreditCard className="mr-2" size={20} />
                      Bank Transfer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="refund-other" />
                    <Label htmlFor="refund-other">Other</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchMethod === "bank_transfer" && (
          <FormField
            control={form.control}
            name="bankRefNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Reference Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter transaction reference"
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="collectedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processed By</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter staff name"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes about this refund"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button type="submit" disabled={disabled} className="w-full">
            Process Early Checkout
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RefundDetailsForm;
