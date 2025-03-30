
import { supabase } from "@/integrations/supabase/client";
import { DailyReport, CleaningRecord } from "@/types";
import { getRooms } from "./roomsService";
import { getCustomers } from "./customersService";
import { getPayments } from "./paymentsService";

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
    expectedcheckouts: checkOuts,
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
    expectedCheckIns: data.expectedcheckins,
    expectedCheckOuts: data.expectedcheckouts,
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
