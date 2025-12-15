'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Input, Button, TotalsCard } from '../../_components/Layout';
import { saveSalesInvoice, getSalesInvoice, calculateTotals, InvoiceItem } from '../../_lib/store';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const MAX_DESCRIPTION_LENGTH = 600;

export default function SalesInvoiceDetails() {
  const router = useRouter();
  const [itemType, setItemType] = useState<'product' | 'service'>('product');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getSalesInvoice();
    if (saved?.items) {
      setItems(saved.items);
    }
  }, []);

  const totals = calculateTotals(items);

  const handleDescriptionChange = (value: string) => {
    // Limit description to 600 characters
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(value);
    }
  };

  const handleAddItem = () => {
    if (!itemName.trim() || !unitPrice || parseFloat(unitPrice) <= 0 || parseInt(quantity) <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }

    const newItem: InvoiceItem = {
      id: editingId || Date.now().toString(),
      type: itemType,
      name: itemName.trim(),
      description: description.trim() || undefined,
      unitPrice: parseFloat(unitPrice),
      quantity: parseInt(quantity),
    };

    if (editingId) {
      setItems(items.map(item => item.id === editingId ? newItem : item));
      setEditingId(null);
    } else {
      setItems([...items, newItem]);
    }

    // Reset form
    setItemName('');
    setDescription('');
    setUnitPrice('');
    setQuantity('1');
    setItemType('product');
  };

  const handleEditItem = (item: InvoiceItem) => {
    setEditingId(item.id);
    setItemType(item.type);
    setItemName(item.name);
    setDescription(item.description || '');
    setUnitPrice(item.unitPrice.toString());
    setQuantity(item.quantity.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveItem = (id: string) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      setItems(items.filter(item => item.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setItemName('');
        setDescription('');
        setUnitPrice('');
        setQuantity('1');
      }
    }
  };

  const handleReview = () => {
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    saveSalesInvoice({ items, ...totals });
    router.push('/etims/sales-invoice/review');
  };

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <Layout 
      title="Invoice Details" 
      step="Step 2 of 3"
      onBack={() => router.push('/etims/sales-invoice/buyer')}
    >
      <div className="space-y-3">
        {/* Item Type - Compact for mobile */}
        <Card>
          <p className="text-xs text-gray-600 mb-2 font-medium">Item Type</p>
          <div className="flex gap-2">
            <button
              onClick={() => setItemType('product')}
              className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                itemType === 'product'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              Product
            </button>
            <button
              onClick={() => setItemType('service')}
              className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                itemType === 'service'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              Service
            </button>
          </div>
        </Card>

        {/* Item Details - Compact inputs for mobile */}
        <Card>
          <h3 className="text-sm text-gray-900 font-medium mb-3">Item Details</h3>
          <div className="space-y-3">
            <Input
              label="Item Name"
              value={itemName}
              onChange={setItemName}
              placeholder="Enter item name"
              required
            />
            
            {/* Description with character counter */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Optional description"
                maxLength={MAX_DESCRIPTION_LENGTH}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <p className={`text-xs mt-1 text-right ${
                description.length >= MAX_DESCRIPTION_LENGTH ? 'text-red-500' : 'text-gray-400'
              }`}>
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </p>
            </div>

            {/* Price and Quantity in a row for mobile */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Unit Price (KES)"
                value={unitPrice}
                onChange={setUnitPrice}
                placeholder="0.00"
                type="number"
                required
              />
              <Input
                label="Quantity"
                value={quantity}
                onChange={setQuantity}
                placeholder="1"
                type="number"
                required
              />
            </div>
          </div>
          <div className="mt-3">
            <Button onClick={handleAddItem}>
              {editingId ? (
                <>
                  <Edit2 className="w-4 h-4 inline mr-1" />
                  Update Item
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Item
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Items List - Compact table format */}
        {items.length > 0 && (
          <Card>
            <h3 className="text-sm text-gray-900 font-medium mb-2">Items ({items.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">Item</th>
                    <th className="text-right py-2 text-xs text-gray-500 font-medium">Price</th>
                    <th className="text-center py-2 text-xs text-gray-500 font-medium">Qty</th>
                    <th className="text-right py-2 text-xs text-gray-500 font-medium">Total</th>
                    <th className="text-right py-2 text-xs text-gray-500 font-medium w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-2">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium text-xs">{item.name}</span>
                          <span className="text-xs text-gray-400">{item.type}</span>
                        </div>
                      </td>
                      <td className="text-right py-2 text-xs text-gray-700">
                        {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="text-center py-2 text-xs text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="text-right py-2 text-xs text-gray-900 font-medium">
                        {(item.unitPrice * item.quantity).toLocaleString()}
                      </td>
                      <td className="text-right py-2">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            aria-label="Edit item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Totals */}
        {items.length > 0 && (
          <TotalsCard subtotal={totals.subtotal} tax={totals.tax} total={totals.total} />
        )}

        {/* Review Button */}
        <Button onClick={handleReview} disabled={items.length === 0}>
          Continue
        </Button>
      </div>
    </Layout>
  );
}
