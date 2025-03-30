
import { supabase } from "@/integrations/supabase/client";
import { Room, Customer, Payment, DailyReport, CleaningRecord } from "@/types";
import { v4 as uuidv4 } from 'uuid';

// Local Storage Helpers
const loadFromLocalStorage = <T>(key: string, defaultValue: T[]): T[] => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error(`Error parsing stored data for ${key}:`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Room functions
export const getRooms = (): Room[] => {
  return loadFromLocalStorage<Room>("hotel_rooms", []);
};

export const getRoomDetails = (roomId: string): Room | null => {
  const rooms = getRooms();
  return rooms.find(room => room.id === roomId) || null;
};

export const updateRoom = (id: string, updates: Partial<Room>): Room | null => {
  const allRooms = loadFromLocalStorage<Room>("hotel_rooms", []);
  const index = allRooms.findIndex(room => room.id === id);
  
  if (index === -1) return null;
  
  const updatedRoom = { ...allRooms[index], ...updates };
  allRooms[index] = updatedRoom;
  saveToLocalStorage("hotel_rooms", allRooms);
  return updatedRoom;
};

export const addRoom = (room: Omit<Room, "id">): Room => {
  const newRoom: Room = {
    id: uuidv4(),
    ...room
  };
  
  const allRooms = loadFromLocalStorage<Room>("hotel_rooms", []);
  allRooms.push(newRoom);
  saveToLocalStorage("hotel_rooms", allRooms);
  return newRoom;
};

export const deleteRoom = (id: string): boolean => {
  const allRooms = loadFromLocalStorage<Room>("hotel_rooms", []);
  const updatedRooms = allRooms.filter(room => room.id !== id);
  
  if (updatedRooms.length === allRooms.length) return false;
  
  saveToLocalStorage("hotel_rooms", updatedRooms);
  return true;
};

// Customer functions
export const getCustomers = (): Customer[] => {
  return loadFromLocalStorage<Customer>("hotel_customers", []);
};

export const addCustomer = (customer: Omit<Customer, "id">): Customer => {
  const newCustomer: Customer = {
    id: uuidv4(),
    ...customer
  };
  
  const allCustomers = loadFromLocalStorage<Customer>("hotel_customers", []);
  allCustomers.push(newCustomer);
  saveToLocalStorage("hotel_customers", allCustomers);
  return newCustomer;
};

export const updateCustomer = (id: string, updates: Partial<Customer>): Customer | null => {
  const allCustomers = loadFromLocalStorage<Customer>("hotel_customers", []);
  const index = allCustomers.findIndex(customer => customer.id === id);
  
  if (index === -1) return null;
  
  const updatedCustomer = { ...allCustomers[index], ...updates };
  allCustomers[index] = updatedCustomer;
  saveToLocalStorage("hotel_customers", allCustomers);
  return updatedCustomer;
};

// Payment functions
export const getPayments = (): Payment[] => {
  return loadFromLocalStorage<Payment>("hotel_payments", []);
};

export const addPayment = (payment: Omit<Payment, "id">): Payment => {
  const newPayment: Payment = {
    id: uuidv4(),
    ...payment
  };
  
  const allPayments = loadFromLocalStorage<Payment>("hotel_payments", []);
  allPayments.push(newPayment);
  saveToLocalStorage("hotel_payments", allPayments);
  return newPayment;
};

// Report functions
export const getDailyReports = (): DailyReport[] => {
  return loadFromLocalStorage<DailyReport>("hotel_reports", []);
};

export const generateDailyReport = (): DailyReport => {
  const rooms = getRooms();
  const customers = getCustomers();
  const today = new Date();
  
  // Get today's date in ISO format (YYYY-MM-DD)
  const todayStr = today.toISOString().split('T')[0];
  
  // Count rooms by status
  const occupiedRooms = rooms.filter(r => r.status === "occupied").length;
  const vacantRooms = rooms.filter(r => r.status === "vacant").length;
  const roomsNeedCleaning = rooms.filter(r => r.status === "cleaning").length;
  
  // Count expected check-ins and check-outs for today
  const expectedCheckIns = customers.filter(c => c.checkInDate.startsWith(todayStr)).length;
  const expectedCheckOuts = customers.filter(c => c.checkOutDate.startsWith(todayStr)).length;
  
  // Calculate today's revenue (simplified)
  const todayPayments = getPayments().filter(p => p.date.startsWith(todayStr));
  const totalRevenue = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  const newReport: DailyReport = {
    id: uuidv4(),
    date: todayStr,
    totalRooms: rooms.length,
    occupiedRooms,
    vacantRooms,
    roomsNeedCleaning,
    expectedCheckIns,
    expectedCheckOuts,
    totalRevenue
  };
  
  const allReports = loadFromLocalStorage<DailyReport>("hotel_reports", []);
  
  // Check if a report for today already exists
  const existingReportIndex = allReports.findIndex(r => r.date === todayStr);
  
  if (existingReportIndex !== -1) {
    // Update existing report
    allReports[existingReportIndex] = newReport;
  } else {
    // Add new report
    allReports.push(newReport);
  }
  
  saveToLocalStorage("hotel_reports", allReports);
  return newReport;
};

// Cleaning records
export const getCleaningRecords = (): CleaningRecord[] => {
  return loadFromLocalStorage<CleaningRecord>("hotel_cleaning_records", []);
};

export const addCleaningRecord = (record: Omit<CleaningRecord, "id">): CleaningRecord => {
  const newRecord: CleaningRecord = {
    id: uuidv4(),
    ...record
  };
  
  const allRecords = loadFromLocalStorage<CleaningRecord>("hotel_cleaning_records", []);
  allRecords.push(newRecord);
  saveToLocalStorage("hotel_cleaning_records", allRecords);
  return newRecord;
};

// Reset database (for development purposes)
export const resetDatabase = (): boolean => {
  try {
    localStorage.removeItem("hotel_rooms");
    localStorage.removeItem("hotel_customers");
    localStorage.removeItem("hotel_payments");
    localStorage.removeItem("hotel_reports");
    localStorage.removeItem("hotel_cleaning_records");
    return true;
  } catch (error) {
    console.error("Error resetting database:", error);
    return false;
  }
};
