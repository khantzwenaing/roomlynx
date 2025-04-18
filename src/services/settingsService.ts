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
      return addDefaultGasSettings();
    }

    return {
      id: data.id,
      pricePerKg: data.priceperkg,
      extraPersonCharge: data.extrapersoncharge,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error("Error in getGasSettings:", error);
    return null;
  }
};

export const updateGasSettings = async (
  settings: Partial<GasSettings>
): Promise<GasSettings | null> => {
  try {
    const updates: Record<string, number> = {};
    if (settings.pricePerKg !== undefined)
      updates.priceperkg = settings.pricePerKg;
    if (settings.extraPersonCharge !== undefined)
      updates.extrapersoncharge = settings.extraPersonCharge;

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
      extraPersonCharge: data.extrapersoncharge,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error("Error in updateGasSettings:", error);
    return null;
  }
};

// Add default gas settings if none exist
export const addDefaultGasSettings = async (): Promise<GasSettings | null> => {
  try {
    // Create default settings
    const defaultSettings = {
      priceperkg: 100, // Default price per kg
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
      extraPersonCharge: data.extrapersoncharge,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error("Error in addDefaultGasSettings:", error);
    return null;
  }
};

// Function to save gas settings - wrapper around updateGasSettings or addDefaultGasSettings
export const saveGasSettings = async (
  settings: Omit<GasSettings, "id" | "created_at">
): Promise<GasSettings | null> => {
  try {
    // First check if we have settings already
    const existingSettings = await getGasSettings();

    if (existingSettings) {
      // Update existing settings
      return updateGasSettings({
        ...settings,
        id: existingSettings.id,
      });
    } else {
      // Create new settings
      const defaultSettings = {
        priceperkg: settings.pricePerKg,
        extrapersoncharge: settings.extraPersonCharge,
      };

      const { data, error } = await supabase
        .from("gas_settings")
        .insert(defaultSettings)
        .select()
        .single();

      if (error) {
        console.error("Error creating gas settings:", error);
        return null;
      }

      return {
        id: data.id,
        pricePerKg: data.priceperkg,
        extraPersonCharge: data.extrapersoncharge,
        created_at: data.created_at,
      };
    }
  } catch (error) {
    console.error("Error in saveGasSettings:", error);
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
export const calculateExtraPersonCharge = async (
  customer: Customer
): Promise<number> => {
  try {
    // Get current settings
    const settings = await getGasSettings();
    if (!settings) return 0;

    // If no extra persons (single occupancy), no charge
    if (customer.numberOfPersons <= 1) {
      return 0;
    }

    // Calculate extra persons (subtract 1 for single occupancy)
    const extraPersons = customer.numberOfPersons - 1;

    // Calculate charge
    return extraPersons * settings.extraPersonCharge;
  } catch (error) {
    console.error("Error calculating extra person charge:", error);
    return 0;
  }
};

// Get extra person charge value
export const getExtraPersonCharge = async (): Promise<number> => {
  try {
    const settings = await getGasSettings();
    return settings ? settings.extraPersonCharge : 0;
  } catch (error) {
    console.error("Error getting extra person charge:", error);
    return 0;
  }
};
