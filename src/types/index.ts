
// Room Types
export type RoomType = 'single' | 'double' | 'suite' | 'deluxe';
export type RoomStatus = 'vacant' | 'occupied' | 'maintenance' | 'cleaning';

export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  rate: number;
  status: RoomStatus;
  lastCleaned?: string | null;
  cleanedBy?: string | null;
  hasGas: boolean;
}

// Payment Types
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentType = 'deposit' | 'rent' | 'damage' | 'service' | 'refund';

export interface Payment {
  id: string;
  customerId?: string;
  roomId?: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  status: PaymentStatus;
  notes?: string;
  collectedBy: string;
  paymentType?: PaymentType;
  isRefund?: boolean;
  gasUsageCharge?: number;
  extraPersonsCharge?: number;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  idNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  roomId: string;
  depositAmount: number;
  depositPaymentMethod?: PaymentMethod;
  depositCollectedBy?: string;
  bankRefNo?: string;
  numberOfPersons: number;
  hasGas: boolean;
  initialGasWeight?: number;
}

// Report Types
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
  cleanedBy: string;
  date: string;
  notes?: string;
  verified: boolean;
}

// Reminder Types
export interface RentReminder {
  id: string;
  roomId: string;
  customerId: string;
  checkOutDate: string;
  reminderDate: string;
  status: 'pending' | 'sent' | 'acknowledged';
}

// Settings Types
export interface GasSettings {
  id: string;
  pricePerKg: number;
  freePersonLimit: number;
  extraPersonCharge: number;
  created_at: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff';
  name?: string;
}

// Checkout Types
export interface CheckoutDetails {
  roomId: string;
  customerId: string;
  finalGasWeight?: number;
  gasCharge?: number;
  extraPersonCharge?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  collectedBy: string;
  bankRefNo?: string;
  notes?: string;
}
