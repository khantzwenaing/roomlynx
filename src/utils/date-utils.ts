
/**
 * Get current date and time in Indian Standard Time (IST)
 */
export const getCurrentISTDate = (): Date => {
  // IST is UTC+5:30
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60000; // 5.5 hours in milliseconds
  return new Date(utcTime + istOffset);
};

/**
 * Calculate the number of days between two dates, including partial days
 * Returns days with one decimal place precision
 */
export const calculateDays = (startDate: Date, endDate: Date): number => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  const daysDiff = timeDiff / (1000 * 3600 * 24);
  return Math.max(Number(daysDiff.toFixed(1)), 0.5); // Min 0.5 day stay
};

/**
 * Calculate remaining days until checkout
 */
export const calculateRemainingDays = (checkOutDate: string): number => {
  const today = getCurrentISTDate();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  const checkOut = new Date(checkOutDate);
  checkOut.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const timeDiff = checkOut.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return Math.max(0, daysDiff); // Ensure we don't return negative days
};

/**
 * Calculate total stay amount based on room rate and dates with partial day precision
 */
export const calculateTotalStay = (roomRate: number, checkInDate: string, checkOutDate: string): number => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const days = calculateDays(checkIn, checkOut);
  return days * roomRate;
};

/**
 * Calculate the current duration of stay based on check-in date and current date
 */
export const calculateCurrentStayDuration = (checkInDate: string): number => {
  const checkIn = new Date(checkInDate);
  const currentDate = getCurrentISTDate();
  return calculateDays(checkIn, currentDate);
};

/**
 * Format a duration in days to a human-readable string
 * (e.g., "2.5 days" or "1 day")
 */
export const formatStayDuration = (days: number): string => {
  const isWholeDays = days % 1 === 0;
  const dayText = days === 1 ? 'day' : 'days';
  
  return isWholeDays 
    ? `${days} ${dayText}` 
    : `${days.toFixed(1)} ${dayText}`;
};
