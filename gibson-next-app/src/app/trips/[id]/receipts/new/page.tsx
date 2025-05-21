'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { receiptsApi } from '@/lib/api-client';

interface LineItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
}

export default function NewReceiptPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [splitType, setSplitType] = useState<'full' | 'line_item'>('full');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: `item-${Date.now()}`, description: '', amount: 0, quantity: 1 }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate total from line items
  const calculatedTotal = lineItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
  
  // Add a new line item
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: `item-${Date.now()}`, description: '', amount: 0, quantity: 1 }
    ]);
  };
  
  // Remove a line item
  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };
  
  // Update a line item
  const updateLineItem = (id: string, field: string, value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Prepare receipt data
      const receiptData = {
        trip_id: params.id,
        title,
        date,
        total_amount: splitType === 'full' ? parseFloat(totalAmount) : calculatedTotal,
        merchant: merchant || undefined,
        split_type: splitType,
        line_items: splitType === 'line_item' ? lineItems.map(item => ({
          description: item.description,
          amount: item.amount,
          quantity: item.quantity
        })) : undefined
      };
      
      // In a real implementation, this would submit to the API
      // await receiptsApi.createReceipt(receiptData);
      
      // For demo, just log the data and redirect
      console.log('Creating receipt:', receiptData);
      
      // Redirect to trip detail page
      router.push(`/trips/${params.id}`);
    } catch (err) {
      console.error('Error creating receipt:', err);
      setError('Failed to create receipt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href={`/trips/${params.id}`} className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add New Receipt</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Receipt Details</CardTitle>
            <CardDescription>
              Enter the receipt information and choose how you want to split it
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}
            
            {/* Basic Receipt Info */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <Input 
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Dinner, Groceries, etc."
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium mb-1">
                    Date *
                  </label>
                  <Input 
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="merchant" className="block text-sm font-medium mb-1">
                    Merchant (Optional)
                  </label>
                  <Input 
                    id="merchant"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="e.g., Restaurant name, store, etc."
                  />
                </div>
              </div>
            </div>
            
            {/* Split Type Selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Split Type *</p>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="split-full"
                    name="split-type"
                    className="h-4 w-4 text-blue-600"
                    checked={splitType === 'full'}
                    onChange={() => setSplitType('full')}
                  />
                  <label htmlFor="split-full" className="ml-2 text-sm">
                    Split entire receipt
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="split-line-item"
                    name="split-type"
                    className="h-4 w-4 text-blue-600"
                    checked={splitType === 'line_item'}
                    onChange={() => setSplitType('line_item')}
                  />
                  <label htmlFor="split-line-item" className="ml-2 text-sm">
                    Split by line items
                  </label>
                </div>
              </div>
            </div>
            
            {/* Full Receipt Amount (for full split) */}
            {splitType === 'full' && (
              <div>
                <label htmlFor="total-amount" className="block text-sm font-medium mb-1">
                  Total Amount *
                </label>
                <Input 
                  id="total-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            )}
            
            {/* Line Items (for line item split) */}
            {splitType === 'line_item' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">Line Items</h3>
                  <p className="text-sm text-slate-500">
                    Total: ${calculatedTotal.toFixed(2)}
                  </p>
                </div>
                
                <div className="space-y-4">
                  {lineItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-5">
                        <Input 
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Input 
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value))}
                          required
                        />
                      </div>
                      
                      <div className="col-span-3">
                        <Input 
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Price"
                          value={item.amount}
                          onChange={(e) => updateLineItem(item.id, 'amount', parseFloat(e.target.value))}
                          required
                        />
                      </div>
                      
                      <div className="col-span-2 flex items-center">
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length <= 1}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <span className="text-sm ml-2">
                          ${(item.amount * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addLineItem}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push(`/trips/${params.id}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Receipt'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}