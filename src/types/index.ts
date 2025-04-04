
export type User = {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'staff';
};

export type Room = {
  id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  rate: number;
  status: 'vacant' | 'occupied' | 'maintenance' | 'cleaning';
  lastCleaned?: string;
  cleanedBy?: string;
  currentCustomer?: Customer | null;
  hasGas?: boolean;
  initialGasWeight?: number; // Weight in kg when customer checks in
};

export type Customer = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  idNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  roomId: string;
  depositAmount?: number;
  depositPaymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'other';
  depositCollectedBy?: string;
  bankRefNo?: string;
  numberOfPersons: number; // New field for tracking number of people
  hasGas?: boolean; // Whether this customer is using gas
  initialGasWeight?: number; // Initial gas weight at check-in
};

export type Payment = {
  id: string;
  customerId: string;
  roomId: string;
  amount: number;
  date: string;
  method: 'cash' | 'card' | 'bank_transfer' | 'other';
  collectedBy: string;
  status: 'paid' | 'pending' | 'partial';
  notes?: string;
  paymentType?: 'deposit' | 'checkout' | 'refund' | 'other';
  isRefund?: boolean;
  extraPersonsCharge?: number; // Additional charge for extra persons
  gasUsageCharge?: number; // Additional charge for gas usage
};

export type DailyReport = {
  id: string;
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  roomsNeedCleaning: number;
  expectedCheckIns: number;
  expectedCheckOuts: number;
  totalRevenue: number;
  cashIn: number;
  cashOut: number;
};

export type CleaningRecord = {
  id: string;
  roomId: string;
  date: string;
  cleanedBy: string;
  verified: boolean;
  notes?: string;
};

export type RentReminder = {
  id: string;
  roomId: string;
  customerId: string;
  checkOutDate: string;
  reminderDate: string;
  status: 'pending' | 'sent' | 'acknowledged';
};

export type GasSettings = {
  id: string;
  pricePerKg: number;
  freePersonLimit: number;
  extraPersonCharge: number;
};
