
import React, { useState, useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Control } from "react-hook-form";
import { CustomerFormValues } from "../schema";
import { getGasSettings } from "@/services/settingsService";

interface PersonSelectionFieldProps {
  control: Control<CustomerFormValues>;
}

const PersonSelectionField = ({ control }: PersonSelectionFieldProps) => {
  const [showInput, setShowInput] = useState(false);
  const [extraPersonCharge, setExtraPersonCharge] = useState(50); // Default value

  useEffect(() => {
    // Load the extra person charge from settings
    const loadSettings = async () => {
      const settings = await getGasSettings();
      if (settings) {
        setExtraPersonCharge(settings.extraPersonCharge);
      }
    };
    
    loadSettings();
  }, []);

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
                field.onChange(checked ? 2 : 1); // Default to 2 persons when enabling
              }}
            />
          </div>
          <FormControl>
            {showInput ? (
              <Select
                onValueChange={(value) => {
                  field.onChange(Number(value));
                }}
                value={field.value.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of persons" />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Persons
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </FormControl>
          <FormDescription className="text-xs">
            {field.value > 1
              ? `${field.value - 1} extra ${field.value === 2 ? 'person' : 'persons'} (₹${extraPersonCharge} per person per day)`
              : "Single occupancy - Room price per day"}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PersonSelectionField;

