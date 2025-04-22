
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
import { Input } from "@/components/ui/input";
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
              <Input
                type="number"
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    field.onChange(1);
                  } else {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue) && numValue >= 1) {
                      field.onChange(numValue);
                    }
                  }
                }}
                className="w-full"
              />
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
