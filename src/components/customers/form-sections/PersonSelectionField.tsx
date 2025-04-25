
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
              checked={field.value > 0}
              onCheckedChange={(checked) => {
                field.onChange(checked ? 1 : 0);
              }}
            />
          </div>
          <FormControl>
            <Select
              onValueChange={(value) => {
                field.onChange(Number(value));
              }}
              value={field.value.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of extra persons" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'Person' : 'Persons'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription className="text-xs">
            {field.value > 0
              ? `${field.value} extra ${field.value === 1 ? 'person' : 'persons'} (₹${extraPersonCharge} per person per day)`
              : "No extra persons"}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PersonSelectionField;
