'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout, Card, Button } from '../../_components/Layout';
import { lookupById } from '../../../actions/etims';
import { Loader2, User, CreditCard } from 'lucide-react';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('number') || '';
  
  const [step, setStep] = useState(1); // 1: ID input, 2: Preview, 3: OTP
  const [idNumber, setIdNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [userDetails, setUserDetails] = useState<{ idNumber: string; name: string } | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleValidateId = async () => {
    setError('');
    if (!idNumber.trim()) { setError('Enter ID number'); return; }
    if (!/^\d{6,8}$/.test(idNumber.trim())) { setError('ID must be 6-8 digits'); return; }

    setLoading(true);
    try {
      const result = await lookupById(idNumber.trim());
      if (result.success && result.name) {
        // Verify first name matches (optional validation)
        if (firstName.trim()) {
          const apiFirstName = result.name.split(' ')[0].toLowerCase();
          const inputFirstName = firstName.trim().toLowerCase();
          if (!apiFirstName.includes(inputFirstName) && !inputFirstName.includes(apiFirstName)) {
            setError('First name does not match records');
            setLoading(false);
            return;
          }
        }
        setUserDetails({ idNumber: result.idNumber!, name: result.name });
        setStep(2);
      } else {
        setError(result.error || 'ID validation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (!termsAccepted) { setError('Please accept terms & conditions'); return; }
    // Go to OTP step
    router.push(`/etims/auth/otp?number=${encodeURIComponent(phoneNumber)}&id=${encodeURIComponent(userDetails?.idNumber || '')}&name=${encodeURIComponent(userDetails?.name || '')}`);
  };

  if (!phoneNumber) {
    return (
      <Layout title="Sign Up" onBack={() => router.push('/etims/auth')}>
        <Card className="text-center py-6">
          <p className="text-red-600 text-sm">Phone number missing</p>
          <Button className="mt-3" onClick={() => router.push('/etims/auth')}>Go Back</Button>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title="Sign Up" showHeader={false} showFooter={false} onBack={() => step === 1 ? router.push('/etims/auth') : setStep(1)}>
      <div className="space-y-4">
        {/* Logo */}
        <div className="flex justify-center py-2">
          <img src="/kra_logo.png" alt="KRA Logo" className="h-12 w-auto" />
        </div>

        {/* Header */}
        <div className="bg-[var(--kra-black)] rounded-xl p-4 text-white">
          <h1 className="text-base font-semibold">
            {step === 1 ? 'Sign Up' : 'Confirm Details'}
          </h1>
          <p className="text-gray-400 text-xs">
            {step === 1 ? 'Step 1/3 - Verify identity' : 'Step 2/3 - Review & accept'}
          </p>
        </div>

        {step === 1 ? (
          <>
            {/* Phone Display */}
            <div className="bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">Phone:</span>
              <span className="text-sm font-medium text-gray-800">{phoneNumber}</span>
            </div>

            {/* ID Input */}
            <Card>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 font-medium mb-1">
                    <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                    ID Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="12345678"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 font-medium mb-1">
                    <User className="w-3.5 h-3.5 inline mr-1" />
                    First Name <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="As per ID"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </Card>

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <Button onClick={handleValidateId} disabled={loading || !idNumber.trim()}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-1" />Validating...</> : 'Validate'}
            </Button>
          </>
        ) : userDetails && (
          <>
            {/* Preview */}
            <Card className="bg-green-50 border-green-200">
              <p className="text-xs text-green-700 font-medium mb-2">Identity Verified</p>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">ID:</span> <span className="font-medium">{userDetails.idNumber}</span></p>
                <p><span className="text-gray-500">Name:</span> <span className="font-medium">{userDetails.name}</span></p>
                <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{phoneNumber}</span></p>
              </div>
            </Card>

            {/* Terms */}
            <Card>
              <div className="text-xs text-gray-600 mb-3 max-h-24 overflow-y-auto">
                <p className="font-medium mb-1">Terms & Conditions</p>
                <p>By registering, you agree to use the eTIMS service in accordance with KRA guidelines. You confirm that the information provided is accurate and you are authorized to use this phone number for tax-related services.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-[var(--kra-red)]"
                />
                <span className="text-xs text-gray-700">I accept the Terms & Conditions</span>
              </label>
            </Card>

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Button onClick={handleRegister}>Register</Button>
              <button onClick={() => setStep(1)} className="w-full py-2 text-gray-600 text-xs font-medium">
                Edit Details
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
