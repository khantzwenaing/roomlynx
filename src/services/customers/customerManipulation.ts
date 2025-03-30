
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Customer } from "@/types";
import { mapDbCustomerToCustomer, mapCustomerToDbCustomer } from "./customerMappers";
import { createCheckoutReminder, deleteCheckoutReminder } from "../remindersService";

// Add a new customer
export const addCustomer = async (customerData: Omit<Customer, "id">): Promise<Customer | null> => {
  try {
    // Validate required fields
    if (!customerData.depositAmount) {
      throw new Error("Deposit amount is required");
    }
    
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
    
    return mapDbCustomerToCustomer(data);
  } catch (error) {
    console.error("Error in addCustomer:", error);
    return null;
  }
};

// Update an existing customer
export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<Customer | null> => {
  try {
    // Prepare data for Supabase by converting to snake_case
    const dbData = mapCustomerToDbCustomer(customerData);
    
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
    
    return mapDbCustomerToCustomer(data);
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
