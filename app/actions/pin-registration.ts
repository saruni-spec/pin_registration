'use server';

import axios from 'axios';
import { cookies } from 'next/headers';

const BASE_URL = 'https://kratest.pesaflow.com/api/ussd';
const ITAX_URL = 'https://kratest.pesaflow.com/api/itax';

// ============= Types =============

export interface OTPResult {
  success: boolean;
  message: string;
  code?: number;
}

export interface IdLookupResult {
  success: boolean;
  code?: number;
  message: string;
  name?: string;
  pin?: string;
  idNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface PinRegistrationResult {
  success: boolean;
  code?: number;
  message: string;
  pin?: string;
  receiptNumber?: string;
}

// ============= Helper Functions =============

function cleanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  }
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  return cleaned;
}

const getAuthHeaders = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('etims_auth_token')?.value;
  return {
    'Content-Type': 'application/json',
    'x-source-for': 'whatsapp',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// ============= API Functions =============

/**
 * Generate OTP for phone verification
 * POST /api/ussd/otp
 */
export async function generateOTP(msisdn: string): Promise<OTPResult> {
  const cleanNumber = cleanPhoneNumber(msisdn);

  try {
    const response = await axios.post(
      `${BASE_URL}/otp`,
      { msisdn: cleanNumber },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-source-for': 'whatsapp',
        },
        timeout: 30000,
      }
    );

    console.log('Generate OTP response:', response.data);

    return {
      success: true,
      message: response.data.message || 'OTP sent successfully',
      code: response.data.code,
    };
  } catch (error: any) {
    console.error('Generate OTP error:', error.response?.data || error.message);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send OTP',
    };
  }
}

/**
 * Validate OTP code and set session cookie
 * POST /api/ussd/validate-otp
 */
export async function validateOTP(msisdn: string, otp: string): Promise<OTPResult> {
  const cleanNumber = cleanPhoneNumber(msisdn);

  try {
    const response = await axios.post(
      `${BASE_URL}/validate-otp`,
      { 
        msisdn: cleanNumber,
        otp: otp,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-source-for': 'whatsapp',
        },
        timeout: 30000,
      }
    );

    console.log('Validate OTP response:', response.data);

    const success = response.data.success !== false;

    if (success) {
      // Set session cookie for 10 minutes (600 seconds)
      const token = response.data.token;
      if (token) {
        const cookieStore = await cookies();
        cookieStore.set({
          name: 'etims_auth_token',
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 600, // 10 minutes
          path: '/',
        });
      }
    }

    return {
      success: success,
      message: response.data.message || 'OTP validated successfully',
      code: response.data.code,
    };
  } catch (error: any) {
    console.error('Validate OTP error:', error.response?.data || error.message);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Invalid OTP',
    };
  }
}

/**
 * Lookup taxpayer by ID number
 * Primary: GET /api/itax/gui-lookup
 * Fallback: POST /api/ussd/id-lookup
 */
export async function lookupById(
  idNumber: string, 
  msisdn?: string
): Promise<IdLookupResult> {
  const headers = await getAuthHeaders();
  
  // Primary: Use ID Lookup API (most reliable)
  if (msisdn) {
    try {
      const cleanNumber = cleanPhoneNumber(msisdn);
      const response = await axios.post(
        `${BASE_URL}/id-lookup`,
        {
          id_number: idNumber,
          msisdn: cleanNumber,
        },
        {
          headers: headers,
          timeout: 30000,
        }
      );

      console.log('ID Lookup response:', response.data);

      const data = response.data;
      if (data.name || data.success) {
        return {
          success: true,
          message: data.message || 'Valid ID',
          name: data.name,
          idNumber: idNumber,
          pin: data.pin // Some endpoints return PIN here
        };
      }
    } catch (error: any) {
      console.error('ID Lookup error:', error.response?.data || error.message);
    }
  }

  // Fallback: Use GUI Lookup API
  try {
    const response = await axios.get(
      `${ITAX_URL}/gui-lookup`,
      {
        params: {
          gui: idNumber,
          tax_payer_type: 'KE',
        },
        headers: headers,
        timeout: 30000,
      }
    );

    const data = response.data;
    console.log('GUI Lookup response (fallback):', data);

    if (data.Status === 'OK' || data.ResponseCode === '30000' || data.Message === 'Valid ID') {
      return {
        success: true,
        code: parseInt(data.ResponseCode) || 200,
        message: data.Message || 'Valid ID',
        name: data.TaxpayerName,
        pin: data.PIN,
        idNumber: idNumber,
      };
    } else {
      return {
        success: false,
        code: parseInt(data.ResponseCode) || 400,
        message: data.Message || 'Invalid ID number',
      };
    }
  } catch (error: any) {
    console.error('GUI Lookup error:', error.response?.data || error.message);

    return {
      success: false,
      message: error.response?.data?.message || 'Failed to lookup ID',
    };
  }
}

/**
 * Submit PIN Registration
 * POST /api/ussd/pin-registration
 */
export async function submitPinRegistration(
  type: 'citizen' | 'resident',
  idNumber: string,
  email: string,
  msisdn: string
): Promise<PinRegistrationResult> {
  const cleanNumber = cleanPhoneNumber(msisdn);
  const headers = await getAuthHeaders();

  console.log('Submitting PIN registration:', {
    type,
    id_number: idNumber,
    email,
    msisdn: cleanNumber,
  });

  try {
    const response = await axios.post(
      `${BASE_URL}/pin-registration`,
      {
        type: type,
        email: email,
        msisdn: cleanNumber,
        id_number: idNumber,
      },
      {
        headers: headers,
        timeout: 60000, // Longer timeout for registration
      }
    );

    console.log('PIN Registration response:', JSON.stringify(response.data, null, 2));

    const data = response.data;
    
    return {
      success: data.success !== false && !data.error,
      code: data.code,
      message: data.message || 'PIN Registration submitted successfully',
      pin: data.pin || data.kra_pin,
      receiptNumber: data.receipt_number || data.receiptNumber || `REG-${Date.now()}`,
    };
  } catch (error: any) {
    console.error('PIN Registration error:', error.response?.data || error.message);
    
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data?.error || 'Failed to submit PIN registration',
    };
  }
}

/**
 * Initiate session for PIN registration
 * POST /api/ussd/initiate-session
 */
export async function initiateSession(
  idNumber: string,
  msisdn: string,
  type: 'citizen' | 'resident'
): Promise<{ success: boolean; message: string; sessionId?: string }> {
  const cleanNumber = cleanPhoneNumber(msisdn);
  const headers = await getAuthHeaders();

  try {
    const response = await axios.post(
      `${BASE_URL}/initiate-session`,
      {
        id_number: idNumber,
        msisdn: cleanNumber,
        type: type,
      },
      {
        headers: headers,
        timeout: 30000,
      }
    );

    console.log('Initiate session response:', response.data);

    return {
      success: true,
      message: response.data.message || 'Session initiated',
      sessionId: response.data.session_id,
    };
  } catch (error: any) {
    console.error('Initiate session error:', error.response?.data || error.message);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to initiate session',
    };
  }
}
