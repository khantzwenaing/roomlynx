import { Room, Customer } from "@/types";
import {
  calculateExtraPersonCharge,
  getGasSettings,
} from "@/services/settingsService";

export const calculateTotalStay = (
  room: Room,
  customer: Customer | null
): number => {
  if (!customer) return 0;

  const checkInDate = new Date(customer.checkInDate);
  const checkOutDate = new Date(customer.checkOutDate);
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return Math.max(1, days) * room.rate;
};

export const calculateAmountDue = async (
  room: Room,
  customer: Customer | null
): Promise<{
  totalStay: number;
  deposit: number;
  extraPersonCharge: number;
  amountDue: number;
}> => {
  if (!customer)
    return { totalStay: 0, deposit: 0, extraPersonCharge: 0, amountDue: 0 };

  const totalStay = calculateTotalStay(room, customer);
  const depositAmount = customer.depositAmount || 0;

  // Calculate extra person charge if applicable
  const extraPersonCharge = await calculateExtraPersonsCharge(customer);

  // Calculate total amount due
  const amountDue = Math.max(0, totalStay + extraPersonCharge - depositAmount);

  return {
    totalStay,
    deposit: depositAmount,
    extraPersonCharge,
    amountDue,
  };
};

// Helper function to calculate extra persons charge
export const calculateExtraPersonsCharge = async (
  customer: Customer
): Promise<number> => {
  if (!customer.numberOfPersons || customer.numberOfPersons <= 0) return 0;

  // Get settings from database or default settings
  const settings = await getGasSettings();
  if (!settings) return 0;

  const { extraPersonCharge } = settings;

  // Calculate extra persons (if any)
  const extraPersons = Math.max(0, customer.numberOfPersons - 1);
  return extraPersons * extraPersonCharge;
};
