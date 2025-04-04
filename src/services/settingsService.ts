
import { supabase } from "@/integrations/supabase/client";
import { GasSettings } from "@/types";

const defaultSettings = {
  pricePerKg: 100, 
  freePersonLimit: 3,
  extraPersonCharge: 50
};

export const getGasSettings = async (): Promise<GasSettings | null> => {
  try {
    // Try to get settings from database first
    const { data, error } = await supabase
      .from('gas_settings')
      .select('*')
      .single();
      
    if (error) {
      console.error('Error fetching gas settings from database:', error);
      
      // If no settings exist yet, use default settings from local storage or hardcoded defaults
      const storedSettings = localStorage.getItem('gas_settings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        return {
          id: 'local',
          ...parsedSettings
        };
      }
      
      return {
        id: 'default',
        ...defaultSettings
      };
    }
    
    return data;
  } catch (err) {
    console.error('Unexpected error fetching gas settings:', err);
    return null;
  }
};

export const saveGasSettings = async (settings: Omit<GasSettings, 'id'>): Promise<GasSettings | null> => {
  try {
    // Always save to local storage as backup
    localStorage.setItem('gas_settings', JSON.stringify(settings));
    
    // Try to get existing settings first
    const { data: existingData } = await supabase
      .from('gas_settings')
      .select('id')
      .single();
    
    let result;
    
    if (existingData) {
      // Update existing settings
      const { data, error } = await supabase
        .from('gas_settings')
        .update(settings)
        .eq('id', existingData.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating gas settings:', error);
        return null;
      }
      
      result = data;
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('gas_settings')
        .insert(settings)
        .select()
        .single();
        
      if (error) {
        console.error('Error inserting gas settings:', error);
        return null;
      }
      
      result = data;
    }
    
    return result;
  } catch (err) {
    console.error('Unexpected error saving gas settings:', err);
    return null;
  }
};

// Function to calculate extra person charges
export const calculateExtraPersonCharge = async (numberOfPersons: number): Promise<number> => {
  const settings = await getGasSettings();
  if (!settings) return 0;
  
  const { freePersonLimit, extraPersonCharge } = settings;
  const extraPersons = Math.max(0, numberOfPersons - freePersonLimit);
  return extraPersons * extraPersonCharge;
};

// Function to calculate gas usage charge
export const calculateGasCharge = async (
  initialWeight: number, 
  finalWeight: number
): Promise<number> => {
  const settings = await getGasSettings();
  if (!settings) return 0;
  
  const { pricePerKg } = settings;
  const usedKg = Math.max(0, initialWeight - finalWeight);
  return usedKg * pricePerKg;
};
