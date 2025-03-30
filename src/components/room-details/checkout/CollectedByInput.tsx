
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CollectedByInputProps {
  collectedBy: string;
  onCollectedByChange: (value: string) => void;
}

const CollectedByInput = ({ collectedBy, onCollectedByChange }: CollectedByInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="collected-by" className="text-lg">Collected By</Label>
      <Input
        id="collected-by"
        placeholder="Enter staff name"
        value={collectedBy}
        onChange={(e) => onCollectedByChange(e.target.value)}
        className="text-lg h-12"
      />
    </div>
  );
};

export default CollectedByInput;
