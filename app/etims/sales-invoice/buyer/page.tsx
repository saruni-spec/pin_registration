'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Input } from '../../_components/Layout';
import { PINInput } from '@/app/_components/KRAInputs';
import { saveSalesInvoice, getSalesInvoice } from '../../_lib/store';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { lookupCustomer } from '../../../actions/etims';

export default function SalesInvoiceBuyer() {
  const router = useRouter();
  const [buyerPin, setBuyerPin] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [isPinValid, setIsPinValid] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState<{ pin: string; name: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameOverridden, setNameOverridden] = useState(false);
  const [originalName, setOriginalName] = useState('');

  // Load previous buyer info if exists
  useEffect(() => {
    const saved = getSalesInvoice();
    if (saved?.buyer) {
      setBuyerInfo(saved.buyer);
      setBuyerName(saved.buyer.name);
      setBuyerPin(saved.buyer.pin);
    }
  }, []);

  const handleValidate = async () => {
    setError('');
    setLoading(true);
    setNameOverridden(false);
    
    try {
      const result = await lookupCustomer(buyerPin);
      if (result.success && result.customer) {
        const validatedName = result.customer.name;
        const enteredName = buyerName.trim();
        
        // Check if name was different and will be overridden
        if (enteredName && enteredName.toLowerCase() !== validatedName.toLowerCase()) {
          setOriginalName(enteredName);
          setNameOverridden(true);
        }
        
        // Use validated name from PIN lookup
        setBuyerInfo({ pin: result.customer.pin, name: validatedName });
      } else {
        setError(result.error || 'Buyer not found. Please check the PIN and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while validating buyer.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndContinue = () => {
    if (buyerInfo) {
      saveSalesInvoice({ buyer: buyerInfo });
      router.push('/etims/sales-invoice/details');
    }
  };

  const handleSkip = () => {
    saveSalesInvoice({ buyer: undefined });
    router.push('/etims/sales-invoice/details');
  };

  const handleEditBuyer = () => {
    setBuyerInfo(null);
    setBuyerPin('');
    setBuyerName('');
    setError('');
    setNameOverridden(false);
    setOriginalName('');
  };

  return (
    <Layout 
      title="Buyer Details" 
      step="Step 1 of 3"
      onBack={() => router.push('/etims')}
    >
      <div className="space-y-3">
        {!buyerInfo ? (
          <>
            <Card>
              <div className="space-y-4">
               
                
                {/* Buyer PIN Input */}
                <PINInput
                  label="Buyer PIN"
                  value={buyerPin}
                  onChange={setBuyerPin}
                  onValidationChange={setIsPinValid}
                  helperText="Enter 11-character KRA PIN (e.g., A012345678Z)"
                />

                 {/* Buyer Name Input */}
                <Input
                  label="Buyer Name"
                  value={buyerName}
                  onChange={setBuyerName}
                  placeholder="Enter buyer's name"
                />
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}
            </Card>

            <div className="space-y-3">
              <Button onClick={handleValidate} disabled={!isPinValid || loading}>
                {loading ? 'Validating...' : 'Validate Buyer'}
              </Button>
              <Button variant="secondary" onClick={handleSkip}>
                Skip Buyer Verification
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-green-900 font-medium mb-2 text-sm">Buyer Verified</h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-600">Name:</span>{' '}
                      <span className="text-gray-900 font-medium">{buyerInfo.name}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">PIN:</span>{' '}
                      <span className="text-gray-900 font-mono">{buyerInfo.pin}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Show notice when name was overridden */}
            {nameOverridden && (
              <Card className="bg-amber-50 border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-medium mb-1">Name Updated</p>
                    <p>
                      Your entered name "<span className="font-medium">{originalName}</span>" has been 
                      replaced with "<span className="font-medium">{buyerInfo.name}</span>" from KRA records.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-3">
              <Button onClick={handleConfirmAndContinue}>
                Confirm & Continue
              </Button>
              <Button variant="secondary" onClick={handleEditBuyer}>
                Change Buyer
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
