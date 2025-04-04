
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BankReferenceInputProps {
  bankRefNo: string;
  onBankRefNoChange: (value: string) => void;
  disabled?: boolean;
}

const BankReferenceInput = ({ bankRefNo, onBankRefNoChange, disabled }: BankReferenceInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="bank-ref" className="text-base font-medium">
        Bank Reference Number
      </Label>
      <Input
        id="bank-ref"
        placeholder="Enter transaction reference"
        value={bankRefNo}
        onChange={(e) => onBankRefNoChange(e.target.value)}
        disabled={disabled}
        className="h-10"
      />
    </div>
  );
};

export default BankReferenceInput;
