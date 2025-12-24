// Simple state management for PIN Registration

export interface RegistrationData {
  type: 'kenyan' | 'non-kenyan';
  nationalId?: string;
  alienId?: string;
  yearOfBirth: string;
  email: string;
  phoneNumber?: string;
}

export interface ValidatedData {
  idNumber: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
}

const REGISTRATION_KEY = 'pin_registration_data';
const VALIDATED_KEY = 'pin_validated_data';
const PHONE_KEY = 'pin_registration_phone';

// Registration Data Store
export const saveRegistrationData = (data: Partial<RegistrationData>) => {
  if (typeof window === 'undefined') return;
  const existing = getRegistrationData() || {};
  const updated = { ...existing, ...data };
  sessionStorage.setItem(REGISTRATION_KEY, JSON.stringify(updated));
};

export const getRegistrationData = (): RegistrationData | null => {
  if (typeof window === 'undefined') return null;
  const data = sessionStorage.getItem(REGISTRATION_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearRegistrationData = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(REGISTRATION_KEY);
  sessionStorage.removeItem(VALIDATED_KEY);
};

// Validated Data Store
export const saveValidatedData = (data: ValidatedData) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(VALIDATED_KEY, JSON.stringify(data));
};

export const getValidatedData = (): ValidatedData | null => {
  if (typeof window === 'undefined') return null;
  const data = sessionStorage.getItem(VALIDATED_KEY);
  return data ? JSON.parse(data) : null;
};

// Phone Number Store (from URL param or OTP verification)
export const formatPhoneNumber = (phone: string): string => {
  // Remove any non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Ensure it starts with 254
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  }
  if (!cleaned.startsWith('254') && cleaned.length === 9) {
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
};

export const savePhoneNumber = (phone: string) => {
  if (typeof window === 'undefined') return;
  const formatted = formatPhoneNumber(phone);
  sessionStorage.setItem(PHONE_KEY, formatted);
  localStorage.setItem(PHONE_KEY, formatted);
};

export const getPhoneNumber = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(PHONE_KEY) || localStorage.getItem(PHONE_KEY);
};

export const getFormattedPhoneNumber = (): string | null => {
  const phone = getPhoneNumber();
  if (!phone) return null;
  // Return in +254 7XX XXX XXX format
  if (phone.length === 12 && phone.startsWith('254')) {
    return `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`;
  }
  return phone;
};

// Helper to mask ID numbers
export const maskIdNumber = (id: string): string => {
  if (!id || id.length < 4) return id;
  return `${id.slice(0, 4)}****${id.slice(-2)}`;
};
