
import { Room, Customer } from "@/types";

export const calculateTotalStay = (room: Room, customer: Customer | null): number => {
  if (!customer) return 0;
  
  const checkInDate = new Date(customer.checkInDate);
  const checkOutDate = new Date(customer.checkOutDate);
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return Math.max(1, days) * room.rate;
};

export const calculateAmountDue = (room: Room, customer: Customer | null): number => {
  const totalStay = calculateTotalStay(room, customer);
  const depositAmount = customer?.depositAmount || 0;
  return Math.max(0, totalStay - depositAmount);
};
