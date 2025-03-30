
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Customer } from "@/types";
import { createCheckoutReminder, deleteCheckoutReminder } from "./remindersService";

// Get all customers
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching customers:", error);
      return [];
    }

    // Map database fields to camelCase
    return data.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email || undefined,
      phone: customer.phone,
      address: customer.address || undefined,
      idNumber: customer.idnumber || undefined,
      checkInDate: customer.checkindate,
      checkOutDate: customer.checkoutdate,
      roomId: customer.roomid,
      depositAmount: customer.depositamount || undefined,
      depositPaymentMethod: customer.depositpaymentmethod as any || undefined,
      depositCollectedBy: customer.depositcollectedby || undefined,
      bankRefNo: customer.bankrefno || undefined
    }));
  } catch (error) {
    console.error("Error in getCustomers:", error);
    return [];
  }
};

// Get a specific customer by ID
export const getCustomerById = async (id: string): Promise<Customer | null> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching customer:", error);
      return null;
    }
    
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
      bankRefNo: data.bankrefno || undefined
    };
  } catch (error) {
    console.error("Error in getCustomerById:", error);
    return null;
  }
};

// Add a new customer
export const addCustomer = async (customerData: Omit<Customer, "id">): Promise<Customer | null> => {
  try {
    const customerId = uuidv4();
    
    const { data, error } = await supabase
      .from("customers")
      .insert({
        id: customerId,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        idnumber: customerData.idNumber,
        roomid: customerData.roomId,
        checkindate: customerData.checkInDate,
        checkoutdate: customerData.checkOutDate,
        depositamount: customerData.depositAmount,
        depositpaymentmethod: customerData.depositPaymentMethod,
        depositcollectedby: customerData.depositCollectedBy,
        bankrefno: customerData.bankRefNo
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding customer:", error);
      return null;
    }

    // After successfully adding the customer, create a checkout reminder
    if (data) {
      try {
        await createCheckoutReminder(
          customerData.roomId,
          customerId,
          customerData.checkOutDate
        );
      } catch (reminderError) {
        console.error("Failed to create checkout reminder:", reminderError);
        // Don't fail the whole operation if reminder creation fails
      }
    }
    
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
      bankRefNo: data.bankrefno || undefined
    };
  } catch (error) {
    console.error("Error in addCustomer:", error);
    return null;
  }
};

// Update an existing customer
export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<Customer | null> => {
  try {
    // Prepare data for Supabase by converting to snake_case
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
    
    const { data, error } = await supabase
      .from("customers")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer:", error);
      return null;
    }

    // If checkout date is being updated, update the reminder as well
    if (customerData.checkOutDate && data) {
      // First delete any existing reminder
      await deleteCheckoutReminder(id);
      
      // Create a new reminder with the updated date
      try {
        await createCheckoutReminder(
          data.roomid,
          id,
          customerData.checkOutDate
        );
      } catch (reminderError) {
        console.error("Failed to update checkout reminder:", reminderError);
      }
    }
    
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
      bankRefNo: data.bankrefno || undefined
    };
  } catch (error) {
    console.error("Error in updateCustomer:", error);
    return null;
  }
};

// Delete a customer
export const deleteCustomer = async (id: string): Promise<boolean> => {
  try {
    // First delete any associated checkout reminders
    await deleteCheckoutReminder(id);
    
    // Then delete the customer
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting customer:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteCustomer:", error);
    return false;
  }
};
