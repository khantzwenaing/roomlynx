
import { Room, Customer } from "@/types";
import { calculateDays } from "@/utils/date-utils";

interface AmountSummaryProps {
  room: Room;
  customer: Customer;
  gasCharge: number;
  extraPersonCharge?: number;
}

const AmountSummary = ({ 
  room, 
  customer, 
  gasCharge, 
  extraPersonCharge = 0 
}: AmountSummaryProps) => {
  const calculateTotal = () => {
    const stayDuration = calculateDays(customer.checkInDate, new Date());
    const baseRoomCharge = room.rate * stayDuration;
    const totalCharges = baseRoomCharge + gasCharge + extraPersonCharge;
    const depositAmount = customer.depositAmount || 0;
    
    return {
      totalCharges,
      depositAmount,
      finalAmount: Math.max(0, totalCharges - depositAmount)
    };
  };

  const { totalCharges, depositAmount, finalAmount } = calculateTotal();
  const refundAmount = depositAmount > totalCharges ? depositAmount - totalCharges : 0;

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span>Room Charges:</span>
        <span>₹{(room.rate * calculateDays(customer.checkInDate, new Date())).toFixed(2)}</span>
      </div>

      {extraPersonCharge > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span>Extra Person Charges:</span>
          <span>₹{extraPersonCharge.toFixed(2)}</span>
        </div>
      )}

      {gasCharge > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span>Gas Usage Charge:</span>
          <span>₹{gasCharge.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between items-center text-sm font-medium border-t pt-2">
        <span>Total Charges:</span>
        <span>₹{totalCharges.toFixed(2)}</span>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span>Deposit Amount:</span>
        <span className="text-purple-600">₹{depositAmount.toFixed(2)}</span>
      </div>

      {refundAmount > 0 ? (
        <div className="flex justify-between items-center text-lg font-bold text-green-600 border-t pt-2">
          <span>Refund Amount:</span>
          <span>₹{refundAmount.toFixed(2)}</span>
        </div>
      ) : (
        <div className="flex justify-between items-center text-lg font-bold text-blue-600 border-t pt-2">
          <span>Amount Due:</span>
          <span>₹{finalAmount.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

export default AmountSummary;
