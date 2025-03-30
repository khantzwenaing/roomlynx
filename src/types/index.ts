
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
