
import { supabase } from "@/integrations/supabase/client";
import { GasSettings, Customer } from "@/types";

// Get the current gas settings
export const getGasSettings = async (): Promise<GasSettings | null> => {
  try {
    // Get the latest settings
    const { data, error } = await supabase
      .from("gas_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error("Error fetching gas settings:", error);
      return null;
    }
    
    return {
      id: data.id,
      pricePerKg: data.priceperkg,
      freePersonLimit: data.freepersonlimit,
      extraPersonCharge: data.extrapersoncharge,
      created_at: data.created_at
    };
  } catch (error) {
    console.error("Error in getGasSettings:", error);
    return null;
  }
};

export const updateGasSettings = async (settings: Partial<GasSettings>): Promise<GasSettings | null> => {
  try {
    const updates: any = {};
    if (settings.pricePerKg !== undefined) updates.priceperkg = settings.pricePerKg;
    if (settings.freePersonLimit !== undefined) updates.freepersonlimit = settings.freePersonLimit;
    if (settings.extraPersonCharge !== undefined) updates.extrapersoncharge = settings.extraPersonCharge;
    
    const { data, error } = await supabase
      .from("gas_settings")
      .update(updates)
      .eq("id", settings.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating gas settings:", error);
      return null;
    }
    
    return {
      id: data.id,
      pricePerKg: data.priceperkg,
      freePersonLimit: data.freepersonlimit,
      extraPersonCharge: data.extrapersoncharge,
      created_at: data.created_at
    };
  } catch (error) {
    console.error("Error in updateGasSettings:", error);
    return null;
  }
};

// Add default gas settings if none exist
export const addDefaultGasSettings = async (): Promise<GasSettings | null> => {
  try {
    // Check if we already have settings
    const existingSettings = await getGasSettings();
    if (existingSettings) return existingSettings;
    
    // Create default settings
    const defaultSettings = {
      priceperkg: 100, // Default price per kg
      freepersonlimit: 3, // Default free person limit
      extrapersoncharge: 50, // Default extra person charge
    };
    
    const { data, error } = await supabase
      .from("gas_settings")
      .insert(defaultSettings)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating default gas settings:", error);
      return null;
    }
    
    return {
      id: data.id,
      pricePerKg: data.priceperkg,
      freePersonLimit: data.freepersonlimit,
      extraPersonCharge: data.extrapersoncharge,
      created_at: data.created_at
    };
  } catch (error) {
    console.error("Error in addDefaultGasSettings:", error);
    return null;
  }
};

// Calculate gas charge based on usage
export const calculateGasCharge = async (
  initialWeight: number, 
  finalWeight: number
): Promise<number> => {
  try {
    // Get current gas price setting
    const settings = await getGasSettings();
    if (!settings) return 0;
    
    // Calculate weight difference
    const weightUsed = Math.max(0, initialWeight - finalWeight);
    
    // Calculate cost
    return weightUsed * settings.pricePerKg;
  } catch (error) {
    console.error("Error calculating gas charge:", error);
    return 0;
  }
};

// Calculate extra persons charge
export const calculateExtraPersonCharge = async (customer: Customer): Promise<number> => {
  try {
    // Get current settings
    const settings = await getGasSettings();
    if (!settings) return 0;
    
    // If number of persons is less than or equal to the limit, no charge
    if (customer.numberOfPersons <= settings.freePersonLimit) {
      return 0;
    }
    
    // Calculate extra persons
    const extraPersons = customer.numberOfPersons - settings.freePersonLimit;
    
    // Calculate charge
    return extraPersons * settings.extraPersonCharge;
  } catch (error) {
    console.error("Error calculating extra person charge:", error);
    return 0;
  }
};

export const getExtraPersonCharge = async (): Promise<number> => {
  try {
    const settings = await getGasSettings();
    return settings ? settings.extraPersonCharge : 0;
  } catch (error) {
    console.error("Error getting extra person charge:", error);
    return 0;
  }
};

export const getFreePersonLimit = async (): Promise<number> => {
  try {
    const settings = await getGasSettings();
    return settings ? settings.freePersonLimit : 0;
  } catch (error) {
    console.error("Error getting free person limit:", error);
    return 0;
  }
};
