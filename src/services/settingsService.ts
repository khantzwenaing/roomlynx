
import { supabase } from "@/integrations/supabase/client";
import { GasSettings } from "@/types";

const defaultSettings = {
  pricePerKg: 100, 
  freePersonLimit: 3,
  extraPersonCharge: 50
};

export const getGasSettings = async (): Promise<GasSettings | null> => {
  try {
    // Add table name explicitly
    const { data, error } = await supabase
      .from('gas_settings')
      .select('*')
      .single();
      
    if (error) {
      console.error('Error fetching gas settings from database:', error);
      
      // If no settings exist yet, use default settings
      return {
        id: 'default',
        ...defaultSettings
      };
    }
    
    return {
      id: data.id,
      pricePerKg: Number(data.priceperkg),
      freePersonLimit: Number(data.freepersonlimit),
      extraPersonCharge: Number(data.extrapersoncharge)
    };
  } catch (err) {
    console.error('Unexpected error fetching gas settings:', err);
    return null;
  }
};

export const saveGasSettings = async (settings: Omit<GasSettings, 'id'>): Promise<GasSettings | null> => {
  try {
    // Check if existing settings exist
    const { data: existingData } = await supabase
      .from('gas_settings')
      .select('id')
      .single();
    
    let result;
    
    if (existingData) {
      // Update existing settings - map to database column names
      const { data, error } = await supabase
        .from('gas_settings')
        .update({
          priceperkg: settings.pricePerKg,
          freepersonlimit: settings.freePersonLimit,
          extrapersoncharge: settings.extraPersonCharge
        })
        .eq('id', existingData.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating gas settings:', error);
        return null;
      }
      
      result = data;
    } else {
      // Insert new settings - map to database column names
      const { data, error } = await supabase
        .from('gas_settings')
        .insert({
          priceperkg: settings.pricePerKg,
          freepersonlimit: settings.freePersonLimit,
          extrapersoncharge: settings.extraPersonCharge
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error inserting gas settings:', error);
        return null;
      }
      
      result = data;
    }
    
    return {
      id: result.id,
      pricePerKg: Number(result.priceperkg),
      freePersonLimit: Number(result.freepersonlimit),
      extraPersonCharge: Number(result.extrapersoncharge)
    };
  } catch (err) {
    console.error('Unexpected error saving gas settings:', err);
    return null;
  }
};

// Helper function to calculate gas charge
export const calculateGasCharge = async (initialWeight: number, finalWeight: number): Promise<number> => {
  try {
    if (finalWeight > initialWeight) {
      throw new Error('Final weight cannot be greater than initial weight');
    }
    
    const settings = await getGasSettings();
    if (!settings) return 0;
    
    const weightUsed = Math.max(0, initialWeight - finalWeight);
    return weightUsed * settings.pricePerKg;
  } catch (error) {
    console.error('Error calculating gas charge:', error);
    return 0;
  }
};

// Helper function to calculate extra persons charge
export const calculateExtraPersonCharge = async (customer: { numberOfPersons: number }): Promise<number> => {
  if (!customer.numberOfPersons || customer.numberOfPersons <= 0) return 0;
  
  // Get settings from database or default settings
  const settings = await getGasSettings();
  if (!settings) return 0;
  
  const { freePersonLimit, extraPersonCharge } = settings;
  
  // Calculate extra persons (if any)
  const extraPersons = Math.max(0, customer.numberOfPersons - freePersonLimit);
  return extraPersons * extraPersonCharge;
};
