
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types";

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
    depositCollectedBy: customer.depositcollectedby || undefined,
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
    depositcollectedby: customer.depositCollectedBy || null,
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
    depositCollectedBy: data.depositcollectedby || undefined,
    bankRefNo: data.bankrefno
  };
};
