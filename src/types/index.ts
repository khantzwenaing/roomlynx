
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
  numberOfPersons: number; // Updated to be required
  hasGas?: boolean; // New gas-related properties
  initialGasWeight?: number;
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
  hasGas?: boolean; // New property for gas availability
  initialGasWeight?: number;
};

export type GasSettings = {
  id: string;
  pricePerKg: number;
  freePersonLimit: number;
  extraPersonCharge: number;
};
