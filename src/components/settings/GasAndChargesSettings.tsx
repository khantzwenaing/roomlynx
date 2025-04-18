import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GasAndChargesSettingsProps {
  onSave: (settings: {
    pricePerKg: number;
    extraPersonCharge: number;
  }) => Promise<boolean>;
  initialSettings?: {
    pricePerKg: number;
    freePersonLimit?: number;
    extraPersonCharge: number;
  };
}

const GasAndChargesSettings = ({
  onSave,
  initialSettings,
}: GasAndChargesSettingsProps) => {
  const [pricePerKg, setPricePerKg] = useState(
    initialSettings?.pricePerKg || 100
  );
  const [extraPersonCharge, setExtraPersonCharge] = useState(
    initialSettings?.extraPersonCharge || 50
  );
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialSettings) {
      setPricePerKg(initialSettings.pricePerKg);
      setExtraPersonCharge(initialSettings.extraPersonCharge);
    }
  }, [initialSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSave({
        pricePerKg,
        extraPersonCharge,
      });

      if (success) {
        toast({
          title: "Settings Saved",
          description:
            "Gas and extra charges settings have been updated successfully",
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gas Usage & Extra Person Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="price-per-kg">Gas Price per Kilogram (₹)</Label>
          <Input
            id="price-per-kg"
            type="number"
            min={0}
            step="0.01"
            value={pricePerKg}
            onChange={(e) => setPricePerKg(parseFloat(e.target.value) || 0)}
          />
          <p className="text-sm text-gray-500">
            The amount charged per kg of gas used by customers
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="extra-person-charge">Extra Person Charge (₹)</Label>
          <Input
            id="extra-person-charge"
            type="number"
            min={0}
            step="0.01"
            value={extraPersonCharge}
            onChange={(e) =>
              setExtraPersonCharge(parseFloat(e.target.value) || 0)
            }
          />
          <p className="text-sm text-gray-500">
            The amount charged per additional person
          </p>
        </div>

        <Button onClick={handleSave} className="mt-4" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GasAndChargesSettings;
