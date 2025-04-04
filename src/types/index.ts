
// Room types
export type RoomType = 'single' | 'double' | 'suite' | 'deluxe';
export type RoomStatus = 'vacant' | 'occupied' | 'maintenance' | 'cleaning';

export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  rate: number;
  status: RoomStatus;
  lastCleaned: string | null;
  cleanedBy: string | null;
  hasGas: boolean;
  currentCustomer?: Customer | null;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  idNumber: string;
  checkInDate: string;
  checkOutDate: string;
  roomId: string | null;
  depositAmount: number;
  depositPaymentMethod: PaymentMethod;
  depositCollectedBy: string;
  bankRefNo: string;
  numberOfPersons: number;
  hasGas: boolean;
  initialGasWeight?: number | null;
}

// Payment types
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'other';
export type PaymentStatus = 'completed' | 'pending' | 'partial' | 'paid';
export type PaymentType = 'deposit' | 'rent' | 'refund' | 'checkout' | 'other';

export interface Payment {
  id: string;
  customerId: string;
  roomId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  collectedBy: string;
  status: PaymentStatus;
  notes: string;
  paymentType: PaymentType;
  isRefund: boolean;
  gasUsageCharge?: number;
  extraPersonsCharge?: number;
}

// Report types
export interface DailyReport {
  id: string;
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  roomsNeedCleaning: number;
  expectedCheckins: number;
  expectedCheckouts: number;
  totalRevenue: number;
  cashIn: number;
  cashOut: number;
}

export interface CleaningRecord {
  id: string;
  roomId: string;
  date: string;
  cleanedBy: string;
  verified: boolean;
  notes: string;
}

// Reminder types
export interface RentReminder {
  id: string;
  roomId: string;
  customerId: string;
  checkoutDate: string;
  reminderDate: string;
  status: 'pending' | 'acknowledged' | 'sent';
}

// Settings types
export interface GasSettings {
  id: string;
  pricePerKg: number;
  freePersonLimit: number;
  extraPersonCharge: number;
  created_at: string;
}

// User type
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff';
  name: string;
  created_at: string;
}

// Checkout types
export interface CheckoutDetails {
  roomId?: string;
  customerId?: string;
  finalGasWeight: number;
  gasCharge?: number;
  extraPersonCharge?: number;
  totalAmount?: number;
  paymentMethod: PaymentMethod;
  collectedBy: string;
  bankRefNo?: string;
  notes?: string;
  showCheckoutForm: boolean;
}
