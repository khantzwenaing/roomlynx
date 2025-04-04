
import { supabase } from "@/integrations/supabase/client";
import { DailyReport, CleaningRecord } from "@/types";
import { getRooms } from "./roomsService";
import { getCustomers } from "./customersService";
import { getPayments } from "./paymentsService";
import { getCheckoutReminders } from "./remindersService";

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
    expectedCheckins: report.expectedcheckins,
    expectedCheckouts: report.expectedcheckouts,
    totalRevenue: Number(report.totalrevenue),
    cashIn: Number(report.cashin || 0),
    cashOut: Number(report.cashout || 0)
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
  
  // Count check-ins for today
  const checkIns = customers.filter(customer => 
    new Date(customer.checkInDate).toISOString().split('T')[0] === todayStr
  ).length;
  
  // Get all payments for today to identify all checkouts (regular and early)
  const payments = await getPayments();
  const todayPayments = payments.filter(payment => 
    new Date(payment.date).toISOString().split('T')[0] === todayStr
  );
  
  // Find all completed checkouts for today (scheduled)
  const { data: completedCheckouts, error: checkoutsError } = await supabase
    .from('customers')
    .select('*')
    .eq('checkoutdate', todayStr);
    
  if (checkoutsError) {
    console.error('Error fetching completed checkouts:', checkoutsError);
  }
  
  // Find early checkouts that happened today
  // This captures checkouts where the actual checkout date was updated to today
  const { data: earlyCheckouts, error: earlyCheckoutsError } = await supabase
    .from('customers')
    .select('*')
    .eq('checkoutdate', todayStr)
    .neq('checkoutdate', 'checkindate'); // Ensure it's not the same as check-in date
    
  if (earlyCheckoutsError) {
    console.error('Error fetching early checkouts:', earlyCheckoutsError);
  }
  
  // Count refunds made today for early checkouts
  const earlyCheckoutRefunds = todayPayments.filter(payment => 
    payment.isRefund && payment.notes?.toLowerCase().includes('early checkout')
  );
  
  // Get early checkouts from reminders that were updated to today
  const { data: acknowledgedReminders, error: remindersError } = await supabase
    .from('rent_reminders')
    .select('*')
    .eq('checkoutdate', todayStr)
    .eq('status', 'acknowledged');
    
  if (remindersError) {
    console.error('Error fetching acknowledged reminders:', remindersError);
  }
  
  // Total checkouts = regular checkouts + early checkouts + acknowledged reminders
  // Avoid double counting by using Set to store unique customer IDs
  const checkoutCustomerIds = new Set<string>();
  
  // Add completed checkouts
  (completedCheckouts || []).forEach(checkout => 
    checkoutCustomerIds.add(checkout.id)
  );
  
  // Add early checkouts
  (earlyCheckouts || []).forEach(checkout => 
    checkoutCustomerIds.add(checkout.id)
  );
  
  // Add customers from early checkout refunds
  earlyCheckoutRefunds.forEach(payment => 
    checkoutCustomerIds.add(payment.customerId)
  );
  
  // Add customers from acknowledged reminders
  (acknowledgedReminders || []).forEach(reminder => 
    checkoutCustomerIds.add(reminder.customerid)
  );
  
  const totalCheckouts = checkoutCustomerIds.size;
  
  // Calculate cash in (regular payments)
  const cashIn = todayPayments
    .filter(payment => !payment.isRefund)
    .reduce((sum, payment) => sum + payment.amount, 0);

  // Calculate cash out (refunds)
  const cashOut = todayPayments
    .filter(payment => payment.isRefund)
    .reduce((sum, payment) => sum + payment.amount, 0);

  // Net revenue = cash in - cash out
  const totalRevenue = cashIn - cashOut;
  
  const newReport = {
    date: today.toISOString(),
    totalrooms: rooms.length,
    occupiedrooms: occupiedRooms,
    vacantrooms: vacantRooms,
    roomsneedcleaning: cleaningRooms,
    expectedcheckins: checkIns,
    expectedcheckouts: totalCheckouts,
    totalrevenue: totalRevenue,
    cashin: cashIn,
    cashout: cashOut
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
    expectedCheckins: data.expectedcheckins,
    expectedCheckouts: data.expectedcheckouts,
    totalRevenue: Number(data.totalrevenue),
    cashIn: Number(data.cashin || 0),
    cashOut: Number(data.cashout || 0)
  };
};

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
