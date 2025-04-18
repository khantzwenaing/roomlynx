import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { CustomerFormValues } from "../schema";

interface PersonSelectionFieldProps {
  control: Control<CustomerFormValues>;
}

const PersonSelectionField = ({ control }: PersonSelectionFieldProps) => {
  const [showInput, setShowInput] = React.useState(false);

  return (
    <FormField
      control={control}
      name="numberOfPersons"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between mb-2">
            <FormLabel className="text-base">Extra Persons</FormLabel>
            <Switch
              checked={showInput}
              onCheckedChange={(checked) => {
                setShowInput(checked);
                field.onChange(checked ? 0 : 1);
              }}
            />
          </div>
          <FormControl>
            {showInput ? (
              <Input
                type="number"
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    field.onChange(0);
                  } else {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                      field.onChange(numValue);
                    }
                  }
                }}
                className="w-full"
              />
            ) : null}
          </FormControl>
          <FormDescription className="text-xs">
            {field.value >= 1
              ? `Each additional person costs ₹50 per day`
              : "Single occupancy - Room price per day"}
          </FormDescription>
        </FormItem>
      )}
    />
  );
};

export default PersonSelectionField;
