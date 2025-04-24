
import { useState } from 'react';

interface RefundCalculationParams {
  checkInDate: Date;
  originalCheckoutDate: Date;
  roomRate: number;
  extraPersonCharge: number;
  gasCharge: number;
}

interface RefundCalculationResult {
  checkoutDate: Date | undefined;
  setCheckoutDate: (date: Date | undefined) => void;
  actualDaysStayed: number;
  originalDays: number;
  daysNotStaying: number;
  roomRefund: number;
  extraPersonRefund: number;
  totalRefund: number;
}

export const useRefundCalculation = ({
  checkInDate,
  originalCheckoutDate,
  roomRate,
  extraPersonCharge,
  gasCharge
}: RefundCalculationParams): RefundCalculationResult => {
  const [checkoutDate, setCheckoutDate] = useState<Date | undefined>(new Date());

  const calculateRefundDetails = (): Omit<RefundCalculationResult, 'checkoutDate' | 'setCheckoutDate'> => {
    if (!checkoutDate) {
      return {
        actualDaysStayed: 0,
        originalDays: 0,
        daysNotStaying: 0,
        roomRefund: 0,
        extraPersonRefund: 0,
        totalRefund: 0
      };
    }

    const actualDaysStayed = Math.ceil(
      (checkoutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
    );

    const originalDays = Math.ceil(
      (originalCheckoutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
    );

    const daysNotStaying = Math.max(0, originalDays - actualDaysStayed);
    const roomRefund = daysNotStaying * roomRate;

    const proratedExtraPersonCharge = extraPersonCharge * (actualDaysStayed / originalDays);
    const extraPersonRefund = Math.max(0, extraPersonCharge - proratedExtraPersonCharge);

    const totalRefund = Math.max(0, roomRefund + extraPersonRefund - gasCharge);

    return {
      actualDaysStayed,
      originalDays,
      daysNotStaying,
      roomRefund,
      extraPersonRefund,
      totalRefund
    };
  };

  const calculatedValues = calculateRefundDetails();

  return {
    checkoutDate,
    setCheckoutDate,
    ...calculatedValues
  };
};
