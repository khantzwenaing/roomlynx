
import { Room, Customer } from "@/types";
import {
  calculateExtraPersonCharge,
  getGasSettings,
} from "@/services/settingsService";
import { calculateCurrentStayDuration, calculateDays } from "@/utils/date-utils";

export const calculateTotalStay = (
  room: Room,
  customer: Customer | null
): number => {
  if (!customer) return 0;

  // Calculate based on current stay duration for actual billing
  const days = calculateCurrentStayDuration(customer.checkInDate);
  return Math.max(0.5, days) * room.rate; // Minimum 0.5 day stay
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

  // Calculate base room charge
  const stayDuration = calculateCurrentStayDuration(customer.checkInDate);
  
  // Calculate extra person charge
  const extraPersonCharge = await calculateExtraPersonsCharge(customer);
  
  // Apply extra person charge to the daily rate
  const effectiveDailyRate = room.rate + (extraPersonCharge / stayDuration);
  
  // Calculate total stay amount with the effective rate
  const totalStay = Math.max(0.5, stayDuration) * effectiveDailyRate;
  const depositAmount = customer.depositAmount || 0;

  // Calculate total amount due
  const amountDue = Math.max(0, totalStay - depositAmount);

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
  if (!customer.numberOfPersons || customer.numberOfPersons <= 1) return 0;

  // Get settings from database or default settings
  const settings = await getGasSettings();
  if (!settings) return 0;

  const { extraPersonCharge } = settings;

  // Calculate extra persons (if any)
  const extraPersons = Math.max(0, customer.numberOfPersons - 1);
  
  // Calculate the duration for total charge
  const stayDuration = calculateCurrentStayDuration(customer.checkInDate);
  
  // Total extra person charge for the entire stay
  return extraPersons * extraPersonCharge * stayDuration;
};
