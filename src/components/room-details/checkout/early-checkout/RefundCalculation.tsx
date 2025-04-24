
import { format } from "date-fns";
import { calculateCurrentStayDuration } from "@/utils/date-utils";

interface RefundCalculationProps {
  checkoutDate: Date | undefined;
  originalCheckoutDate: Date;
  checkInDate: Date;
  roomRate: number;
  extraPersonCharge: number;
  gasCharge: number;
  calculateRefundAmount: () => number;
}

const RefundCalculation = ({
  checkoutDate,
  originalCheckoutDate,
  checkInDate,
  roomRate,
  extraPersonCharge,
  gasCharge,
  calculateRefundAmount
}: RefundCalculationProps) => {
  if (!checkoutDate) return null;

  const actualDaysStayed = Math.ceil(
    (checkoutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
  );

  const originalDays = Math.ceil(
    (originalCheckoutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
  );

  const daysNotStaying = Math.max(0, originalDays - actualDaysStayed);
  const roomRefund = daysNotStaying * roomRate;

  const originalExtraPersonCharge = extraPersonCharge;
  const proratedExtraPersonCharge = originalExtraPersonCharge * (actualDaysStayed / originalDays);
  const extraPersonRefund = Math.max(0, originalExtraPersonCharge - proratedExtraPersonCharge);

  return (
    <div className="text-sm text-gray-600 mt-2 space-y-1">
      <p>
        Checkout on {format(checkoutDate, "PPP")}
        {" "}(Original: {format(originalCheckoutDate, "PPP")})
      </p>
      <div className="border-t pt-1 mt-1">
        <p>
          Original stay: {originalDays} days × ₹{roomRate}/day = ₹{originalDays * roomRate}
        </p>
        <p>
          Actual stay: {actualDaysStayed} days × ₹{roomRate}/day = ₹{actualDaysStayed * roomRate}
        </p>
        <p>Room charge refund: ₹{roomRefund}</p>
      </div>

      {extraPersonCharge > 0 && (
        <div className="border-t pt-1 mt-1">
          <p>Original extra person charge: ₹{originalExtraPersonCharge}</p>
          <p>Prorated extra person charge: ₹{proratedExtraPersonCharge.toFixed(2)}</p>
          <p>Extra person refund: ₹{extraPersonRefund.toFixed(2)}</p>
        </div>
      )}

      {gasCharge > 0 && (
        <div className="border-t pt-1 mt-1">
          <p>Gas charge: -₹{gasCharge} (based on actual usage)</p>
        </div>
      )}

      <div className="border-t pt-1 mt-1 font-medium">
        <p>Total refund: ₹{roomRefund.toFixed(2)} + ₹{extraPersonRefund.toFixed(2)} - ₹{gasCharge.toFixed(2)} = ₹{calculateRefundAmount().toFixed(2)}</p>
      </div>
    </div>
  );
};

export default RefundCalculation;
