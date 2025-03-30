import { readTextFile, writeTextFile, exists } from '@tauri-apps/api/fs';
import { join } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/tauri';

// Define the structure of user preferences
interface UserPreferences {
  outputDirectory: string;
  companyDetails: {
    name: string;
    contact: string;
    email: string;
    phone: string;
  };
  recentOutputs: string[];
}

// Default user preferences
const defaultPreferences: UserPreferences = {
  outputDirectory: '',
  companyDetails: {
    name: '',
    contact: '',
    email: '',
    phone: ''
  },
  recentOutputs: []
};

// Load user preferences from storage
export const loadUserPreferences = async (): Promise<UserPreferences | null> => {
  try {
    const appDataDir = await invoke('get_app_data_dir') as string;
    const prefsPath = await join(appDataDir, 'preferences.json');
    
    // Check if the preferences file exists
    if (await exists(prefsPath)) {
      const prefsData = await readTextFile(prefsPath);
      try {
        return JSON.parse(prefsData) as UserPreferences;
      } catch (parseError) {
        console.error('Failed to parse preferences, using defaults:', parseError);
        return defaultPreferences;
      }
    } else {
      // If not, create with defaults and return
      await saveUserPreferences(defaultPreferences);
      return defaultPreferences;
    }
  } catch (error) {
    console.error('Failed to load user preferences:', error);
    return null;
  }
};

// Save user preferences to storage
export const saveUserPreferences = async (preferences: UserPreferences | any): Promise<boolean> => {
  try {
    const appDataDir = await invoke('get_app_data_dir') as string;
    const prefsPath = await join(appDataDir, 'preferences.json');
    
    // Ensure we have all required fields
    const completePreferences = {
      ...defaultPreferences,
      ...preferences,
      companyDetails: {
        ...defaultPreferences.companyDetails,
        ...(preferences.companyDetails || {})
      }
    };
    
    await writeTextFile(prefsPath, JSON.stringify(completePreferences, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save user preferences:', error);
    return false;
  }
};

// Save a recent output to the history
export const addRecentOutput = async (outputPath: string): Promise<boolean> => {
  try {
    const prefs = await loadUserPreferences() || defaultPreferences;
    
    if (!prefs.recentOutputs.includes(outputPath)) {
      prefs.recentOutputs.unshift(outputPath);
      // Keep only the last 5 recent outputs
      prefs.recentOutputs = prefs.recentOutputs.slice(0, 5);
      return await saveUserPreferences(prefs);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to add recent output:', error);
    return false;
  }
};
