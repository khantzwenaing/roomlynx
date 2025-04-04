
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CollectedByInputProps {
  collectedBy: string;
  onCollectedByChange: (value: string) => void;
  disabled?: boolean;
}

const CollectedByInput = ({ collectedBy, onCollectedByChange, disabled }: CollectedByInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="collected-by" className="text-base font-medium">
        Collected By
      </Label>
      <Input
        id="collected-by"
        placeholder="Enter staff name"
        value={collectedBy}
        onChange={(e) => onCollectedByChange(e.target.value)}
        disabled={disabled}
        className="h-10"
      />
    </div>
  );
};

export default CollectedByInput;
