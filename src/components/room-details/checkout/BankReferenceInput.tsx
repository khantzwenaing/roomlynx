
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BankReferenceInputProps {
  bankRefNo: string;
  onBankRefNoChange: (value: string) => void;
}

const BankReferenceInput = ({ bankRefNo, onBankRefNoChange }: BankReferenceInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="bank-ref" className="text-lg">Bank Reference Number</Label>
      <Input
        id="bank-ref"
        placeholder="Enter transaction reference"
        value={bankRefNo}
        onChange={(e) => onBankRefNoChange(e.target.value)}
        className="text-lg h-12"
      />
    </div>
  );
};

export default BankReferenceInput;
