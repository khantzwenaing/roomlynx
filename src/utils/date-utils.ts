
/**
 * Calculate the number of days between two dates
 */
export const calculateDays = (startDate: Date, endDate: Date): number => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Calculate remaining days until checkout
 */
export const calculateRemainingDays = (checkOutDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  const checkOut = new Date(checkOutDate);
  checkOut.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const timeDiff = checkOut.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return Math.max(0, daysDiff); // Ensure we don't return negative days
};

/**
 * Calculate total stay amount based on room rate and dates
 */
export const calculateTotalStay = (roomRate: number, checkInDate: string, checkOutDate: string): number => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const days = calculateDays(checkIn, checkOut);
  return Math.max(1, days) * roomRate;
};
