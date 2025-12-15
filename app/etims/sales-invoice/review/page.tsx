'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, TotalsCard, IdentityStrip } from '../../_components/Layout';
import { getSalesInvoice, Invoice, getUserSession } from '../../_lib/store';
import { submitInvoice } from '../../../actions/etims';
import { Loader2 } from 'lucide-react';

export default function SalesInvoiceReview() {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Partial<Invoice> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getSalesInvoice();
    if (!saved || !saved.items || saved.items.length === 0) {
      router.push('/etims/sales-invoice/details');
      return;
    }
    setInvoice(saved);
  }, [router]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const session = getUserSession();
      if (!session?.msisdn) {
        alert('User session not found. Please go back to home page.');
        return;
      }
  
      if (!invoice || !invoice.items) {
         alert('Invalid invoice data');
         return;
      }

      // Calculate total if not present
      const calculatedTotal = invoice.total || invoice.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  
      const result = await submitInvoice({
        msisdn: session.msisdn,
        total_amount: calculatedTotal,
        items: invoice.items.map(item => ({
          item_name: item.name,
          taxable_amount: item.unitPrice,
          quantity: item.quantity
        }))
      });
  
      if (result.success) {
        router.push('/etims/sales-invoice/success');
      } else {
        alert(result.error || 'Failed to submit invoice');
      }
    } catch (error: any) {
      alert(error.message || 'An error occurred while submitting the invoice');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!mounted || !invoice) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <Layout 
      title="Review Invoice" 
      step="Step 3 of 3"
      onBack={() => router.push('/etims/sales-invoice/details')}
    >
      <div className="space-y-3">
        {/* Buyer Info */}
        {invoice.buyer && (
          <IdentityStrip 
            label="Buyer"
            value={`${invoice.buyer.name} (${invoice.buyer.pin})`}
          />
        )}

        {/* Items Summary - Table Format */}
        <Card>
          <h3 className="text-sm text-gray-900 font-medium mb-3">
            Products/Services ({invoice.items?.length || 0})
          </h3>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-xs text-gray-500 font-medium">Name</th>
                  <th className="text-right py-2 text-xs text-gray-500 font-medium">Price</th>
                  <th className="text-center py-2 text-xs text-gray-500 font-medium">Qty</th>
                  <th className="text-right py-2 text-xs text-gray-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-2.5">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">{item.name}</span>
                        {item.description && (
                          <span className="text-xs text-gray-500 line-clamp-1">{item.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-2.5 text-gray-700 whitespace-nowrap">
                      KES {item.unitPrice.toLocaleString()}
                    </td>
                    <td className="text-center py-2.5 text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="text-right py-2.5 text-gray-900 font-medium whitespace-nowrap">
                      KES {(item.unitPrice * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Totals */}
        {invoice.subtotal !== undefined && invoice.tax !== undefined && invoice.total !== undefined && (
          <TotalsCard 
            subtotal={invoice.subtotal} 
            tax={invoice.tax} 
            total={invoice.total} 
          />
        )}

        {/* Actions */}
        {isGenerating ? (
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-center gap-3 py-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-blue-900 font-medium">Generating Invoice...</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            <Button onClick={handleGenerate}>
              Generate Invoice
            </Button>
            <Button variant="secondary" onClick={() => router.push('/etims/sales-invoice/details')}>
              Edit Details
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
