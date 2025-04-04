
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
      pricePerKg: Number(data.pricePerKg),
      freePersonLimit: Number(data.freePersonLimit),
      extraPersonCharge: Number(data.extraPersonCharge)
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
    
    return {
      id: result.id,
      pricePerKg: Number(result.pricePerKg),
      freePersonLimit: Number(result.freePersonLimit),
      extraPersonCharge: Number(result.extraPersonCharge)
    };
  } catch (err) {
    console.error('Unexpected error saving gas settings:', err);
    return null;
  }
};
