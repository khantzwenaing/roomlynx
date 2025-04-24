
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Banknote, CreditCard } from "lucide-react";

interface RefundDetailsFormProps {
  refundDetails: {
    method: "cash" | "bank_transfer" | "other";
    collectedBy: string;
    notes: string;
    bankRefNo: string;
  };
  setRefundDetails: (details: {
    method: "cash" | "bank_transfer" | "other";
    collectedBy: string;
    notes: string;
    bankRefNo: string;
  }) => void;
}

const RefundDetailsForm = ({
  refundDetails,
  setRefundDetails,
}: RefundDetailsFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="refund-method">Refund Method</Label>
        <RadioGroup
          value={refundDetails.method}
          onValueChange={(value: "cash" | "bank_transfer" | "other") =>
            setRefundDetails({ ...refundDetails, method: value })
          }
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cash" id="refund-cash" />
            <Label htmlFor="refund-cash" className="flex items-center">
              <Banknote className="mr-2" size={20} />
              Cash
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bank_transfer" id="refund-bank" />
            <Label htmlFor="refund-bank" className="flex items-center">
              <CreditCard className="mr-2" size={20} />
              Bank Transfer
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="refund-other" />
            <Label htmlFor="refund-other" className="flex items-center">
              Other
            </Label>
          </div>
        </RadioGroup>
      </div>

      {refundDetails.method === "bank_transfer" && (
        <div className="space-y-2">
          <Label htmlFor="refund-bank-ref">Bank Reference Number</Label>
          <Input
            id="refund-bank-ref"
            placeholder="Enter transaction reference"
            value={refundDetails.bankRefNo}
            onChange={(e) =>
              setRefundDetails({
                ...refundDetails,
                bankRefNo: e.target.value,
              })
            }
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="refund-by">Processed By</Label>
        <Input
          id="refund-by"
          placeholder="Enter staff name"
          value={refundDetails.collectedBy}
          onChange={(e) =>
            setRefundDetails({
              ...refundDetails,
              collectedBy: e.target.value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="refund-notes">Notes</Label>
        <Textarea
          id="refund-notes"
          placeholder="Add any additional notes about this refund"
          value={refundDetails.notes}
          onChange={(e) =>
            setRefundDetails({ ...refundDetails, notes: e.target.value })
          }
        />
      </div>
    </div>
  );
};

export default RefundDetailsForm;
