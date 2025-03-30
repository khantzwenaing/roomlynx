
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types";
import { mapDbCustomerToCustomer } from "./customerMappers";

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
    return data.map(customer => mapDbCustomerToCustomer(customer));
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
    
    return mapDbCustomerToCustomer(data);
  } catch (error) {
    console.error("Error in getCustomerById:", error);
    return null;
  }
};
