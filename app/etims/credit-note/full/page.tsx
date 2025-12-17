'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button } from '../../_components/Layout';
import { getCreditNote, CreditNoteData } from '../../_lib/store';

const reasonLabels: Record<string, string> = {
  missing_quantity: 'Missing Quantity',
  missing_data: 'Missing Data',
  damaged: 'Damaged',
  wasted: 'Wasted',
  raw_material_shortage: 'Raw Material Shortage',
  refund: 'Refund',
};

export default function CreditNoteFull() {
  const router = useRouter();
  const [creditNote, setCreditNote] = useState<CreditNoteData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getCreditNote();
    if (!saved || !saved.invoice || saved.type !== 'full' || !saved.reason) {
      router.push('/etims/credit-note/search');
      return;
    }
    setCreditNote(saved);
  }, [router]);

  const handleReview = () => {
    router.push('/etims/credit-note/review');
  };

  if (!mounted || !creditNote?.invoice) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <Layout 
      title="Full Credit Note" 
      step="Step 3 of 5"
      onBack={() => router.push('/etims/credit-note/found')}
    >
      <div className="space-y-4">
        <Card>
          <h3 className="text-gray-900 font-medium mb-3">Invoice Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice Number:</span>
              <span className="text-gray-900 font-medium">{creditNote.invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="text-gray-900 font-medium">
                KES {creditNote.invoice.total.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reason:</span>
              <span className="text-gray-900 font-medium">
                {creditNote.reason ? (reasonLabels[creditNote.reason] || creditNote.reason) : 'N/A'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-900">
            <strong>Full Credit Note:</strong> This will credit the entire invoice amount of KES {creditNote.invoice.total.toLocaleString()}.
          </p>
        </Card>

        <Button onClick={handleReview}>
          Review Credit Note
        </Button>
      </div>
    </Layout>
  );
}
