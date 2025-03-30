
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
    roomNumber: room.roomnumber,
    type: room.type as 'single' | 'double' | 'suite' | 'deluxe',
    rate: Number(room.rate),
    status: room.status as 'vacant' | 'occupied' | 'maintenance' | 'cleaning',
    lastCleaned: room.lastcleaned,
    cleanedBy: room.cleanedby
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
      .eq('roomid', roomId)
      .order('checkindate', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (!customerError && customerData) {
      currentCustomer = {
        id: customerData.id,
        name: customerData.name,
        email: customerData.email || '',
        phone: customerData.phone,
        address: customerData.address || '',
        idNumber: customerData.idnumber || '',
        checkInDate: customerData.checkindate,
        checkOutDate: customerData.checkoutdate,
        roomId: customerData.roomid,
        depositAmount: customerData.depositamount ? Number(customerData.depositamount) : undefined,
        depositPaymentMethod: customerData.depositpaymentmethod as 'cash' | 'card' | 'bank_transfer' | 'other' | undefined,
        bankRefNo: customerData.bankrefno
      };
    }
  }
  
  return {
    id: data.id,
    roomNumber: data.roomnumber,
    type: data.type as 'single' | 'double' | 'suite' | 'deluxe',
    rate: Number(data.rate),
    status: data.status as 'vacant' | 'occupied' | 'maintenance' | 'cleaning',
    lastCleaned: data.lastcleaned,
    cleanedBy: data.cleanedby,
    currentCustomer
  };
};

export const updateRoom = async (id: string, updates: Partial<Room>): Promise<Room | null> => {
  // Transform the updates to match database column names
  const dbUpdates: any = {};
  
  if (updates.roomNumber) dbUpdates.roomnumber = updates.roomNumber;
  if (updates.type) dbUpdates.type = updates.type;
  if (updates.rate) dbUpdates.rate = updates.rate;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.lastCleaned) dbUpdates.lastcleaned = updates.lastCleaned;
  if (updates.cleanedBy) dbUpdates.cleanedby = updates.cleanedBy;
  
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
    roomNumber: data.roomnumber,
    type: data.type as 'single' | 'double' | 'suite' | 'deluxe',
    rate: Number(data.rate),
    status: data.status as 'vacant' | 'occupied' | 'maintenance' | 'cleaning',
    lastCleaned: data.lastcleaned,
    cleanedBy: data.cleanedby
  };
};

export const addRoom = async (room: Omit<Room, "id">): Promise<Room | null> => {
  const newRoom = {
    roomnumber: room.roomNumber,
    type: room.type,
    rate: room.rate,
    status: room.status,
    lastcleaned: room.lastCleaned,
    cleanedby: room.cleanedBy
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
    roomNumber: data.roomnumber,
    type: data.type as 'single' | 'double' | 'suite' | 'deluxe',
    rate: Number(data.rate),
    status: data.status as 'vacant' | 'occupied' | 'maintenance' | 'cleaning',
    lastCleaned: data.lastcleaned,
    cleanedBy: data.cleanedby
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
    idNumber: customer.idnumber || '',
    checkInDate: customer.checkindate,
    checkOutDate: customer.checkoutdate,
    roomId: customer.roomid,
    depositAmount: customer.depositamount ? Number(customer.depositamount) : undefined,
    depositPaymentMethod: customer.depositpaymentmethod as 'cash' | 'card' | 'bank_transfer' | 'other' | undefined,
    bankRefNo: customer.bankrefno
  }));
};

export const addCustomer = async (customer: Omit<Customer, "id">): Promise<Customer | null> => {
  const newCustomer = {
    name: customer.name,
    email: customer.email || null,
    phone: customer.phone,
    address: customer.address || null,
    idnumber: customer.idNumber || null,
    checkindate: customer.checkInDate,
    checkoutdate: customer.checkOutDate,
    roomid: customer.roomId,
    depositamount: customer.depositAmount || null,
    depositpaymentmethod: customer.depositPaymentMethod || null,
    bankrefno: customer.bankRefNo || null
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
    idNumber: data.idnumber || '',
    checkInDate: data.checkindate,
    checkOutDate: data.checkoutdate,
    roomId: data.roomid,
    depositAmount: data.depositamount ? Number(data.depositamount) : undefined,
    depositPaymentMethod: data.depositpaymentmethod as 'cash' | 'card' | 'bank_transfer' | 'other' | undefined,
    bankRefNo: data.bankrefno
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
    customerId: payment.customerid,
    roomId: payment.roomid,
    amount: Number(payment.amount),
    date: payment.date,
    method: payment.method as 'cash' | 'card' | 'bank_transfer' | 'other',
    collectedBy: payment.collectedby,
    status: payment.status as 'paid' | 'pending' | 'partial',
    notes: payment.notes || ''
  }));
};

export const addPayment = async (payment: Omit<Payment, "id">): Promise<Payment | null> => {
  const newPayment = {
    customerid: payment.customerId,
    roomid: payment.roomId,
    amount: payment.amount,
    date: payment.date,
    method: payment.method,
    collectedby: payment.collectedBy,
    status: payment.status,
    notes: payment.notes || null
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
    customerId: data.customerid,
    roomId: data.roomid,
    amount: Number(data.amount),
    date: data.date,
    method: data.method as 'cash' | 'card' | 'bank_transfer' | 'other',
    collectedBy: data.collectedby,
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
    totalRooms: report.totalrooms,
    occupiedRooms: report.occupiedrooms,
    vacantRooms: report.vacantrooms,
    roomsNeedCleaning: report.roomsneedcleaning,
    expectedCheckIns: report.expectedcheckins,
    expectedCheckOuts: report.expectedcheckouts,
    totalRevenue: Number(report.totalrevenue)
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
    date: today.toISOString(),
    totalrooms: rooms.length,
    occupiedrooms: occupiedRooms,
    vacantrooms: vacantRooms,
    roomsneedcleaning: cleaningRooms,
    expectedcheckins: checkIns,
    expectedcheckouts: checkOuts,
    totalrevenue: totalRevenue
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
    totalRooms: data.totalrooms,
    occupiedRooms: data.occupiedrooms,
    vacantRooms: data.vacantrooms,
    roomsNeedCleaning: data.roomsneedcleaning,
    expectedCheckIns: data.expectedcheckins,
    expectedCheckOuts: data.expectedcheckouts,
    totalRevenue: Number(data.totalrevenue)
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
    roomId: record.roomid,
    date: record.date,
    cleanedBy: record.cleanedby,
    verified: record.verified,
    notes: record.notes || ''
  }));
};
