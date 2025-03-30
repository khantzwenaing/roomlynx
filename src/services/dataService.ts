
import { supabase } from "@/integrations/supabase/client";
import { Room, Customer, Payment, DailyReport, CleaningRecord } from "@/types";
import { v4 as uuidv4 } from 'uuid';

// Room functions
export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*');
  
  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
  
  return data.map(room => ({
    id: room.id,
    roomNumber: room.roomNumber,
    type: room.type as 'single' | 'double' | 'suite' | 'deluxe',
    rate: Number(room.rate),
    status: room.status as 'vacant' | 'occupied' | 'maintenance' | 'cleaning',
    lastCleaned: room.lastCleaned,
    cleanedBy: room.cleanedBy
  }));
};

export const getRoomDetails = async (roomId: string): Promise<Room | null> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();
  
  if (error) {
    console.error('Error fetching room details:', error);
    return null;
  }
  
  // Get the customer for this room if it's occupied
  let currentCustomer = null;
  if (data.status === 'occupied') {
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('roomId', roomId)
      .order('checkInDate', { ascending: false })
      .limit(1)
      .single();
    
    if (!customerError && customerData) {
      currentCustomer = {
        id: customerData.id,
        name: customerData.name,
        email: customerData.email || '',
        phone: customerData.phone,
        address: customerData.address || '',
        idNumber: customerData.idNumber || '',
        checkInDate: customerData.checkInDate,
        checkOutDate: customerData.checkOutDate,
        roomId: customerData.roomId,
        depositAmount: customerData.depositAmount ? Number(customerData.depositAmount) : undefined,
        depositPaymentMethod: customerData.depositPaymentMethod as 'cash' | 'card' | 'bank_transfer' | 'other' | undefined,
        bankRefNo: customerData.bankRefNo
      };
    }
  }
  
  return {
    id: data.id,
    roomNumber: data.roomNumber,
    type: data.type as 'single' | 'double' | 'suite' | 'deluxe',
    rate: Number(data.rate),
    status: data.status as 'vacant' | 'occupied' | 'maintenance' | 'cleaning',
    lastCleaned: data.lastCleaned,
    cleanedBy: data.cleanedBy,
    currentCustomer
  };
};

export const updateRoom = async (id: string, updates: Partial<Room>): Promise<Room | null> => {
  // Transform the updates to match database column names if needed
  const dbUpdates = {
    ...updates,
    // Add any specific transformations here if column names differ
  };
  
  const { data, error } = await supabase
    .from('rooms')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating room:', error);
    return null;
  }
  
  return {
    id: data.id,
    roomNumber: data.roomNumber,
    type: data.type as 'single' | 'double' | 'suite' | 'deluxe',
    rate: Number(data.rate),
    status: data.status as 'vacant' | 'occupied' | 'maintenance' | 'cleaning',
    lastCleaned: data.lastCleaned,
    cleanedBy: data.cleanedBy
  };
};

export const addRoom = async (room: Omit<Room, "id">): Promise<Room | null> => {
  const newRoom = {
    ...room,
    id: uuidv4()
  };
  
  const { data, error } = await supabase
    .from('rooms')
    .insert(newRoom)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding room:', error);
    return null;
  }
  
  return {
    id: data.id,
    roomNumber: data.roomNumber,
    type: data.type as 'single' | 'double' | 'suite' | 'deluxe',
    rate: Number(data.rate),
    status: data.status as 'vacant' | 'occupied' | 'maintenance' | 'cleaning',
    lastCleaned: data.lastCleaned,
    cleanedBy: data.cleanedBy
  };
};

export const deleteRoom = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting room:', error);
    return false;
  }
  
  return true;
};

// Customer functions
export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*');
  
  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  
  return data.map(customer => ({
    id: customer.id,
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone,
    address: customer.address || '',
    idNumber: customer.idNumber || '',
    checkInDate: customer.checkInDate,
    checkOutDate: customer.checkOutDate,
    roomId: customer.roomId,
    depositAmount: customer.depositAmount ? Number(customer.depositAmount) : undefined,
    depositPaymentMethod: customer.depositPaymentMethod as 'cash' | 'card' | 'bank_transfer' | 'other' | undefined,
    bankRefNo: customer.bankRefNo
  }));
};

export const addCustomer = async (customer: Omit<Customer, "id">): Promise<Customer | null> => {
  const newCustomer = {
    ...customer,
    id: uuidv4()
  };
  
  const { data, error } = await supabase
    .from('customers')
    .insert(newCustomer)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding customer:', error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    email: data.email || '',
    phone: data.phone,
    address: data.address || '',
    idNumber: data.idNumber || '',
    checkInDate: data.checkInDate,
    checkOutDate: data.checkOutDate,
    roomId: data.roomId,
    depositAmount: data.depositAmount ? Number(data.depositAmount) : undefined,
    depositPaymentMethod: data.depositPaymentMethod as 'cash' | 'card' | 'bank_transfer' | 'other' | undefined,
    bankRefNo: data.bankRefNo
  };
};

// Payment functions
export const getPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*');
  
  if (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
  
  return data.map(payment => ({
    id: payment.id,
    customerId: payment.customerId,
    roomId: payment.roomId,
    amount: Number(payment.amount),
    date: payment.date,
    method: payment.method as 'cash' | 'card' | 'bank_transfer' | 'other',
    collectedBy: payment.collectedBy,
    status: payment.status as 'paid' | 'pending' | 'partial',
    notes: payment.notes || ''
  }));
};

export const addPayment = async (payment: Omit<Payment, "id">): Promise<Payment | null> => {
  const newPayment = {
    ...payment,
    id: uuidv4()
  };
  
  const { data, error } = await supabase
    .from('payments')
    .insert(newPayment)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding payment:', error);
    return null;
  }
  
  return {
    id: data.id,
    customerId: data.customerId,
    roomId: data.roomId,
    amount: Number(data.amount),
    date: data.date,
    method: data.method as 'cash' | 'card' | 'bank_transfer' | 'other',
    collectedBy: data.collectedBy,
    status: data.status as 'paid' | 'pending' | 'partial',
    notes: data.notes || ''
  };
};

// Daily Reports functions
export const getDailyReports = async (): Promise<DailyReport[]> => {
  const { data, error } = await supabase
    .from('daily_reports')
    .select('*');
  
  if (error) {
    console.error('Error fetching daily reports:', error);
    return [];
  }
  
  return data.map(report => ({
    id: report.id,
    date: report.date,
    totalRooms: report.totalRooms,
    occupiedRooms: report.occupiedRooms,
    vacantRooms: report.vacantRooms,
    roomsNeedCleaning: report.roomsNeedCleaning,
    expectedCheckIns: report.expectedCheckIns,
    expectedCheckOuts: report.expectedCheckOuts,
    totalRevenue: Number(report.totalRevenue)
  }));
};

export const generateDailyReport = async (): Promise<DailyReport | null> => {
  // Get current data to generate a report
  const rooms = await getRooms();
  const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
  const vacantRooms = rooms.filter(room => room.status === 'vacant').length;
  const cleaningRooms = rooms.filter(room => room.status === 'cleaning').length;
  
  // Get today's customers data
  const customers = await getCustomers();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Count check-ins and check-outs
  const checkIns = customers.filter(customer => 
    new Date(customer.checkInDate).toISOString().split('T')[0] === todayStr
  ).length;
  
  const checkOuts = customers.filter(customer => 
    new Date(customer.checkOutDate).toISOString().split('T')[0] === todayStr
  ).length;
  
  // Get payments for today to calculate revenue
  const payments = await getPayments();
  const todayPayments = payments.filter(payment => 
    new Date(payment.date).toISOString().split('T')[0] === todayStr
  );
  
  const totalRevenue = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  const newReport = {
    id: uuidv4(),
    date: today.toISOString(),
    totalRooms: rooms.length,
    occupiedRooms,
    vacantRooms,
    roomsNeedCleaning: cleaningRooms,
    expectedCheckIns: checkIns,
    expectedCheckOuts: checkOuts,
    totalRevenue
  };
  
  const { data, error } = await supabase
    .from('daily_reports')
    .insert(newReport)
    .select()
    .single();
  
  if (error) {
    console.error('Error generating daily report:', error);
    return null;
  }
  
  return {
    id: data.id,
    date: data.date,
    totalRooms: data.totalRooms,
    occupiedRooms: data.occupiedRooms,
    vacantRooms: data.vacantRooms,
    roomsNeedCleaning: data.roomsNeedCleaning,
    expectedCheckIns: data.expectedCheckIns,
    expectedCheckOuts: data.expectedCheckOuts,
    totalRevenue: Number(data.totalRevenue)
  };
};

// Cleaning Records
export const getCleaningRecords = async (): Promise<CleaningRecord[]> => {
  const { data, error } = await supabase
    .from('cleaning_records')
    .select('*');
  
  if (error) {
    console.error('Error fetching cleaning records:', error);
    return [];
  }
  
  return data.map(record => ({
    id: record.id,
    roomId: record.roomId,
    date: record.date,
    cleanedBy: record.cleanedBy,
    verified: record.verified,
    notes: record.notes || ''
  }));
};
