
export enum StorageLocation {
  FRIDGE = 'Fridge',
  PANTRY = 'Pantry',
  FREEZER = 'Freezer'
}

export enum ExpiryStatus {
  FRESH = 'Fresh',
  EXPIRING_SOON = 'Expiring Soon',
  EXPIRED = 'Expired'
}

export enum AllergySeverity {
  MILD = 'Mild',
  MODERATE = 'Moderate',
  SEVERE = 'Severe'
}

export interface Allergy {
  name: string;
  severity: AllergySeverity;
}

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  bloodGroup: string;
  allergies: Allergy[];
  healthConditions: string[];
  photo?: string;
  alertsEnabled: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  expiryDate: string;
  addedDate: string;
  location: StorageLocation;
  quantity: string;
  status: ExpiryStatus;
  price?: number;
  image?: string;
  ingredients?: string[];
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  inStock?: boolean;
  expiryDate?: string;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  prepTime: string;
  servings: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  rating: number;
  reviewCount: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  expiringIngredientsUsed: string[];
  allergyNotes?: string;
  isFavorite?: boolean;
}

export interface UserSettings {
  notifications: {
    expiryReminders: boolean;
    reminderTiming: number;
    allergyRiskAlerts: boolean;
    leftoverExpiryAlerts: boolean;
    donationReminders: boolean;
  };
  appearance: {
    darkMode: boolean;
    textSize: 'Small' | 'Medium' | 'Large';
    accentColor: string;
  };
  language: {
    appLanguage: string;
    dateFormat: 'DD/MM' | 'MM/DD';
    timeFormat: '12h' | '24h';
  };
  privacy: {
    appLock: boolean;
    hideAllergyInfo: boolean;
    dataSharing: boolean;
  };
  smartFeatures: {
    aiRecipeSuggestions: boolean;
    cameraAutoDetect: boolean;
    storageExpiryPrediction: boolean;
  };
  family: {
    sharing: boolean;
    emergencySync: boolean;
    childSafety: boolean;
  };
  backup: {
    cloudBackup: boolean;
    syncFrequency: 'Daily' | 'Weekly' | 'Manual';
  };
}

export interface UserProfile {
  name: string;
  email: string;
  allergies: Allergy[];
  healthConditions: string[];
  householdSize: number;
  age?: number;
  photo?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  settings?: UserSettings;
  familyMembers: FamilyMember[];
}
