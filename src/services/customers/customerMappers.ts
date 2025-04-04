import { Customer } from "@/types";

export const mapDbCustomerToCustomer = (data: any): Customer => {
  return {
    id: data.id,
    name: data.name,
    email: data.email || undefined,
    phone: data.phone,
    address: data.address || undefined,
    idNumber: data.idnumber || undefined,
    checkInDate: data.checkindate,
    checkOutDate: data.checkoutdate,
    roomId: data.roomid,
    depositAmount: data.depositamount || undefined,
    depositPaymentMethod: data.depositpaymentmethod as any || undefined,
    depositCollectedBy: data.depositcollectedby || undefined,
    bankRefNo: data.bankrefno || undefined,
    numberOfPersons: data.numberOfPersons || 1,
    hasGas: data.hasGas || false,
    initialGasWeight: data.initialGasWeight
  };
};

export const mapCustomerToDbCustomer = (customerData: Partial<Customer>): Record<string, any> => {
  const dbData: Record<string, any> = {};
  
  if (customerData.name !== undefined) dbData.name = customerData.name;
  if (customerData.email !== undefined) dbData.email = customerData.email;
  if (customerData.phone !== undefined) dbData.phone = customerData.phone;
  if (customerData.address !== undefined) dbData.address = customerData.address;
  if (customerData.idNumber !== undefined) dbData.idnumber = customerData.idNumber;
  if (customerData.roomId !== undefined) dbData.roomid = customerData.roomId;
  if (customerData.checkInDate !== undefined) dbData.checkindate = customerData.checkInDate;
  if (customerData.checkOutDate !== undefined) dbData.checkoutdate = customerData.checkOutDate;
  if (customerData.depositAmount !== undefined) dbData.depositamount = customerData.depositAmount;
  if (customerData.depositPaymentMethod !== undefined) dbData.depositpaymentmethod = customerData.depositPaymentMethod;
  if (customerData.depositCollectedBy !== undefined) dbData.depositcollectedby = customerData.depositCollectedBy;
  if (customerData.bankRefNo !== undefined) dbData.bankrefno = customerData.bankRefNo;
  if (customerData.numberOfPersons !== undefined) dbData.numberOfPersons = customerData.numberOfPersons;
  if (customerData.hasGas !== undefined) dbData.hasGas = customerData.hasGas;
  if (customerData.initialGasWeight !== undefined) dbData.initialGasWeight = customerData.initialGasWeight;
  
  return dbData;
};
