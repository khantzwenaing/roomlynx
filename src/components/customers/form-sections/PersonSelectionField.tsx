
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Control } from "react-hook-form";
import { CustomerFormValues } from "../schema";
import { Switch } from "@/components/ui/switch";

interface PersonSelectionFieldProps {
  control: Control<CustomerFormValues>;
}

const PersonSelectionField = ({ control }: PersonSelectionFieldProps) => {
  return (
    <FormField
      control={control}
      name="numberOfPersons"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between mb-2">
            <FormLabel className="text-base">Extra Persons</FormLabel>
            <Switch
              checked={field.value > 1}
              onCheckedChange={(checked) => field.onChange(checked ? 2 : 1)}
            />
          </div>
          <FormControl>
            <ToggleGroup
              type="single"
              value={field.value.toString()}
              onValueChange={(value) => field.onChange(parseInt(value) || 1)}
              className="justify-start"
              disabled={field.value === 1}
            >
              <ToggleGroupItem value="2" aria-label="2 Persons">
                2
              </ToggleGroupItem>
              <ToggleGroupItem value="3" aria-label="3 Persons">
                3
              </ToggleGroupItem>
            </ToggleGroup>
          </FormControl>
          <FormDescription className="text-xs">
            {field.value > 1 ? "Each additional person costs ₹50" : "Single occupancy selected"}
          </FormDescription>
        </FormItem>
      )}
    />
  );
};

export default PersonSelectionField;
