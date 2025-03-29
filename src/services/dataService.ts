import { Room, Customer, Payment, CleaningRecord, RentReminder, DailyReport } from "@/types";

// Mock data
let rooms: Room[] = Array.from({ length: 20 }, (_, i) => ({
  id: `room-${i + 1}`,
  roomNumber: `${i + 1}`.padStart(3, '0'),
  type: i % 4 === 0 ? 'suite' : i % 3 === 0 ? 'deluxe' : i % 2 === 0 ? 'double' : 'single',
  rate: i % 4 === 0 ? 200 : i % 3 === 0 ? 150 : i % 2 === 0 ? 100 : 80,
  status: i % 5 === 0 ? 'occupied' : i % 7 === 0 ? 'cleaning' : i % 11 === 0 ? 'maintenance' : 'vacant',
  lastCleaned: i % 3 === 0 ? new Date(Date.now() - 86400000).toISOString() : new Date().toISOString(),
  cleanedBy: i % 3 === 0 ? 'John Doe' : 'Jane Smith',
}));

let customers: Customer[] = [
  {
    id: "customer-1",
    name: "John Smith",
    email: "john@example.com",
    phone: "123-456-7890",
    address: "123 Main St, City",
    idNumber: "ID12345",
    checkInDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    checkOutDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    roomId: "room-5",
  },
  {
    id: "customer-2",
    name: "Emily Johnson",
    email: "emily@example.com",
    phone: "987-654-3210",
    address: "456 Oak Ave, Town",
    idNumber: "ID67890",
    checkInDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    checkOutDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    roomId: "room-10",
  },
];

let payments: Payment[] = [
  {
    id: "payment-1",
    customerId: "customer-1",
    roomId: "room-5",
    amount: 400,
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    method: "card",
    collectedBy: "Staff User",
    status: "paid",
    notes: "Full payment",
  },
  {
    id: "payment-2",
    customerId: "customer-2",
    roomId: "room-10",
    amount: 300,
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    method: "cash",
    collectedBy: "Admin User",
    status: "paid",
    notes: "Paid in cash",
  },
];

let cleaningRecords: CleaningRecord[] = [
  {
    id: "cleaning-1",
    roomId: "room-5",
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    cleanedBy: "Cleaning Staff 1",
    verified: true,
    notes: "Thorough cleaning",
  },
  {
    id: "cleaning-2",
    roomId: "room-10",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    cleanedBy: "Cleaning Staff 2",
    verified: true,
    notes: "Regular cleaning",
  },
];

let reminders: RentReminder[] = [
  {
    id: "reminder-1",
    roomId: "room-5",
    customerId: "customer-1",
    checkOutDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    reminderDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    status: "pending",
  },
  {
    id: "reminder-2",
    roomId: "room-10",
    customerId: "customer-2",
    checkOutDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    reminderDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    status: "pending",
  },
];

let dailyReports: DailyReport[] = [
  {
    id: "report-1",
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    totalRooms: 100,
    occupiedRooms: 20,
    vacantRooms: 75,
    roomsNeedCleaning: 5,
    expectedCheckIns: 8,
    expectedCheckOuts: 5,
    totalRevenue: 2500,
  },
  {
    id: "report-2",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    totalRooms: 100,
    occupiedRooms: 18,
    vacantRooms: 77,
    roomsNeedCleaning: 5,
    expectedCheckIns: 5,
    expectedCheckOuts: 3,
    totalRevenue: 2200,
  },
];

// Simulate localStorage persistence
const loadFromLocalStorage = <T>(key: string, defaultValue: T[]): T[] => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const saveToLocalStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize data from localStorage if available
const initializeData = () => {
  rooms = loadFromLocalStorage("hotel_rooms", rooms);
  customers = loadFromLocalStorage("hotel_customers", customers);
  payments = loadFromLocalStorage("hotel_payments", payments);
  cleaningRecords = loadFromLocalStorage("hotel_cleaning", cleaningRecords);
  reminders = loadFromLocalStorage("hotel_reminders", reminders);
  dailyReports = loadFromLocalStorage("hotel_reports", dailyReports);
  
  // Save initial data if not already in localStorage
  saveToLocalStorage("hotel_rooms", rooms);
  saveToLocalStorage("hotel_customers", customers);
  saveToLocalStorage("hotel_payments", payments);
  saveToLocalStorage("hotel_cleaning", cleaningRecords);
  saveToLocalStorage("hotel_reminders", reminders);
  saveToLocalStorage("hotel_reports", dailyReports);
};

// Call this when app starts
initializeData();

// Room operations
export const getRooms = (): Room[] => {
  return loadFromLocalStorage("hotel_rooms", rooms);
};

export const getRoom = (id: string): Room | undefined => {
  const allRooms = loadFromLocalStorage("hotel_rooms", rooms);
  return allRooms.find(room => room.id === id);
};

export const addRoom = (room: Omit<Room, "id">): Room => {
  const newRoom = { ...room, id: `room-${Date.now()}` };
  const allRooms = loadFromLocalStorage("hotel_rooms", rooms);
  const updatedRooms = [...allRooms, newRoom];
  saveToLocalStorage("hotel_rooms", updatedRooms);
  return newRoom;
};

export const updateRoom = (id: string, updates: Partial<Room>): Room | null => {
  const allRooms = loadFromLocalStorage("hotel_rooms", rooms);
  const index = allRooms.findIndex(room => room.id === id);
  
  if (index === -1) return null;
  
  const updatedRoom = { ...allRooms[index], ...updates };
  allRooms[index] = updatedRoom;
  saveToLocalStorage("hotel_rooms", allRooms);
  return updatedRoom;
};

// Customer operations
export const getCustomers = (): Customer[] => {
  return loadFromLocalStorage("hotel_customers", customers);
};

export const getCustomer = (id: string): Customer | undefined => {
  const allCustomers = loadFromLocalStorage("hotel_customers", customers);
  return allCustomers.find(customer => customer.id === id);
};

export const getCustomerByRoomId = (roomId: string): Customer | null => {
  const allCustomers = loadFromLocalStorage("hotel_customers", customers);
  // Find any customer currently checked into the room (whose checkout date is in the future)
  const now = new Date();
  return allCustomers.find(customer => 
    customer.roomId === roomId && new Date(customer.checkOutDate) > now
  ) || null;
};

export const addCustomer = (customer: Omit<Customer, "id">): Customer => {
  const newCustomer = { ...customer, id: `customer-${Date.now()}` };
  const allCustomers = loadFromLocalStorage("hotel_customers", customers);
  const updatedCustomers = [...allCustomers, newCustomer];
  saveToLocalStorage("hotel_customers", updatedCustomers);
  return newCustomer;
};

export const updateCustomer = (id: string, updates: Partial<Customer>): Customer | null => {
  const allCustomers = loadFromLocalStorage("hotel_customers", customers);
  const index = allCustomers.findIndex(customer => customer.id === id);
  
  if (index === -1) return null;
  
  const updatedCustomer = { ...allCustomers[index], ...updates };
  allCustomers[index] = updatedCustomer;
  saveToLocalStorage("hotel_customers", allCustomers);
  return updatedCustomer;
};

// Payment operations
export const getPayments = (): Payment[] => {
  return loadFromLocalStorage("hotel_payments", payments);
};

export const addPayment = (payment: Omit<Payment, "id">): Payment => {
  const newPayment = { ...payment, id: `payment-${Date.now()}` };
  const allPayments = loadFromLocalStorage("hotel_payments", payments);
  const updatedPayments = [...allPayments, newPayment];
  saveToLocalStorage("hotel_payments", updatedPayments);
  return newPayment;
};

// Cleaning records operations
export const getCleaningRecords = (): CleaningRecord[] => {
  return loadFromLocalStorage("hotel_cleaning", cleaningRecords);
};

export const addCleaningRecord = (record: Omit<CleaningRecord, "id">): CleaningRecord => {
  const newRecord = { ...record, id: `cleaning-${Date.now()}` };
  const allRecords = loadFromLocalStorage("hotel_cleaning", cleaningRecords);
  const updatedRecords = [...allRecords, newRecord];
  saveToLocalStorage("hotel_cleaning", updatedRecords);
  return newRecord;
};

// Reminder operations
export const getReminders = (): RentReminder[] => {
  return loadFromLocalStorage("hotel_reminders", reminders);
};

export const addReminder = (reminder: Omit<RentReminder, "id">): RentReminder => {
  const newReminder = { ...reminder, id: `reminder-${Date.now()}` };
  const allReminders = loadFromLocalStorage("hotel_reminders", reminders);
  const updatedReminders = [...allReminders, newReminder];
  saveToLocalStorage("hotel_reminders", updatedReminders);
  return newReminder;
};

export const updateReminder = (id: string, updates: Partial<RentReminder>): RentReminder | null => {
  const allReminders = loadFromLocalStorage("hotel_reminders", reminders);
  const index = allReminders.findIndex(reminder => reminder.id === id);
  
  if (index === -1) return null;
  
  const updatedReminder = { ...allReminders[index], ...updates };
  allReminders[index] = updatedReminder;
  saveToLocalStorage("hotel_reminders", allReminders);
  return updatedReminder;
};

// Daily report operations
export const getDailyReports = (): DailyReport[] => {
  return loadFromLocalStorage("hotel_reports", dailyReports);
};

export const generateDailyReport = (): DailyReport => {
  const allRooms = loadFromLocalStorage("hotel_rooms", rooms);
  const today = new Date().toISOString().split('T')[0];
  
  const occupiedRooms = allRooms.filter(room => room.status === 'occupied').length;
  const vacantRooms = allRooms.filter(room => room.status === 'vacant').length;
  const roomsNeedCleaning = allRooms.filter(room => room.status === 'cleaning').length;
  
  const allCustomers = loadFromLocalStorage("hotel_customers", customers);
  const expectedCheckIns = allCustomers.filter(customer => 
    customer.checkInDate.split('T')[0] === today
  ).length;
  
  const expectedCheckOuts = allCustomers.filter(customer => 
    customer.checkOutDate.split('T')[0] === today
  ).length;
  
  const allPayments = loadFromLocalStorage("hotel_payments", payments);
  const todayPayments = allPayments.filter(payment => 
    payment.date.split('T')[0] === today
  );
  
  const totalRevenue = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  const newReport: DailyReport = {
    id: `report-${Date.now()}`,
    date: new Date().toISOString(),
    totalRooms: allRooms.length,
    occupiedRooms,
    vacantRooms,
    roomsNeedCleaning,
    expectedCheckIns,
    expectedCheckOuts,
    totalRevenue
  };
  
  const allReports = loadFromLocalStorage("hotel_reports", dailyReports);
  const updatedReports = [...allReports, newReport];
  saveToLocalStorage("hotel_reports", updatedReports);
  
  return newReport;
};

// Helper to get all data for a specific room
export const getRoomDetails = (roomId: string) => {
  const room = getRoom(roomId);
  if (!room) return null;
  
  // Find the current customer (not checked out yet)
  const currentCustomer = getCustomerByRoomId(roomId);
  
  const allPayments = getPayments();
  const roomPayments = allPayments.filter(p => p.roomId === roomId);
  
  const allCleaningRecords = getCleaningRecords();
  const roomCleaningRecords = allCleaningRecords.filter(r => r.roomId === roomId);
  
  return {
    room,
    currentCustomer,
    payments: roomPayments,
    cleaningRecords: roomCleaningRecords
  };
};
