
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Control } from "react-hook-form";
import { CustomerFormValues } from "../schema";

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
          <FormLabel className="text-base">Number of Persons</FormLabel>
          <FormControl>
            <ToggleGroup
              type="single"
              value={field.value.toString()}
              onValueChange={(value) => field.onChange(parseInt(value) || 1)}
              className="justify-start"
            >
              <ToggleGroupItem value="1" aria-label="1 Person">
                1
              </ToggleGroupItem>
              <ToggleGroupItem value="2" aria-label="2 Persons">
                2
              </ToggleGroupItem>
              <ToggleGroupItem value="3" aria-label="3 Persons">
                3
              </ToggleGroupItem>
            </ToggleGroup>
          </FormControl>
          <FormDescription className="text-xs">
            First 3 persons are free. Each additional person costs ₹50.
          </FormDescription>
        </FormItem>
      )}
    />
  );
};

export default PersonSelectionField;
