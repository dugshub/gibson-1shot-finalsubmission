'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Receipt, Edit, Trash2, User, DollarSign, Split as SplitIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatCurrency, formatDate, calculateEvenSplit } from '@/lib/utils';
import { receiptsApi } from '@/lib/api-client';

interface Member {
  id: string;
  name: string;
}

interface LineItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  splits?: {
    userId: string;
    percentage: number;
  }[];
}

interface Receipt {
  id: string;
  title: string;
  date: string;
  merchant?: string;
  split_type: 'full' | 'line_item';
  total_amount: number;
  payer: {
    id: string;
    name: string;
  };
  line_items?: LineItem[];
  splits?: {
    userId: string;
    percentage: number;
    amount: number;
  }[];
}

// Demo receipt data
const demoReceipt: Receipt = {
  id: 'receipt-1',
  title: 'Groceries',
  date: '2025-06-16',
  merchant: 'Whole Foods',
  split_type: 'line_item',
  total_amount: 87.45,
  payer: { id: 'default-user', name: 'You' },
  line_items: [
    {
      id: 'line-item-1',
      description: 'Bread',
      amount: 4.99,
      quantity: 1,
      splits: [
        { userId: 'default-user', percentage: 50 },
        { userId: 'user-2', percentage: 50 },
      ]
    },
    {
      id: 'line-item-2',
      description: 'Milk',
      amount: 3.49,
      quantity: 2,
      splits: [
        { userId: 'default-user', percentage: 33.33 },
        { userId: 'user-2', percentage: 33.33 },
        { userId: 'user-3', percentage: 33.34 },
      ]
    },
    {
      id: 'line-item-3',
      description: 'Fruits and vegetables',
      amount: 27.85,
      quantity: 1,
      splits: [
        { userId: 'default-user', percentage: 25 },
        { userId: 'user-2', percentage: 25 },
        { userId: 'user-3', percentage: 25 },
        { userId: 'user-4', percentage: 25 },
      ]
    },
    {
      id: 'line-item-4',
      description: 'Snacks',
      amount: 15.63,
      quantity: 1,
      splits: [
        { userId: 'user-2', percentage: 50 },
        { userId: 'user-4', percentage: 50 },
      ]
    },
    {
      id: 'line-item-5',
      description: 'Drinks',
      amount: 32.00,
      quantity: 1,
      splits: [
        { userId: 'default-user', percentage: 25 },
        { userId: 'user-2', percentage: 25 },
        { userId: 'user-3', percentage: 25 },
        { userId: 'user-4', percentage: 25 },
      ]
    }
  ]
};

// Demo members data
const demoMembers: Member[] = [
  { id: 'default-user', name: 'You' },
  { id: 'user-2', name: 'Alex' },
  { id: 'user-3', name: 'Jamie' },
  { id: 'user-4', name: 'Taylor' }
];

export default function ReceiptDetailsPage({ 
  params 
}: { 
  params: { id: string; receiptId: string }
}) {
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [splits, setSplits] = useState<{ userId: string; percentage: number }[]>([]);
  const [lineSplits, setLineSplits] = useState<{ lineItemId: string; splits: { userId: string; percentage: number }[] }[]>([]);
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load receipt and members data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would fetch from API
        // const receipt = await receiptsApi.getReceipt(params.receiptId);
        // const members = await tripsApi.getTripMembers(params.id);
        
        // For demo purposes, use demo data
        setReceipt(demoReceipt);
        setMembers(demoMembers);
        
        // Initialize splits data if available
        if (demoReceipt.split_type === 'full' && demoReceipt.splits) {
          setSplits(demoReceipt.splits.map(s => ({ userId: s.userId, percentage: s.percentage })));
        } else if (demoReceipt.split_type === 'line_item' && demoReceipt.line_items) {
          const initialLineSplits = demoReceipt.line_items
            .filter(item => item.splits)
            .map(item => ({
              lineItemId: item.id,
              splits: item.splits || []
            }));
          setLineSplits(initialLineSplits);
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching receipt details:', err);
        setError('Failed to load receipt details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params.id, params.receiptId]);

  // Enter split mode
  const handleSplitMode = () => {
    setIsSplitMode(true);
    
    // Initialize splits if needed
    if (receipt?.split_type === 'full' && splits.length === 0) {
      // Start with even split
      const evenSplits = members.map((member, index) => {
        const percentages = calculateEvenSplit(members.length);
        return { userId: member.id, percentage: percentages[index] };
      });
      setSplits(evenSplits);
    } else if (receipt?.split_type === 'line_item' && lineSplits.length === 0) {
      // Initialize line splits
      if (receipt.line_items) {
        const initialLineSplits = receipt.line_items.map(item => {
          const evenSplits = members.map((member, index) => {
            const percentages = calculateEvenSplit(members.length);
            return { userId: member.id, percentage: percentages[index] };
          });
          
          return {
            lineItemId: item.id,
            splits: evenSplits
          };
        });
        setLineSplits(initialLineSplits);
      }
    }
  };

  // Apply even split
  const applyEvenSplit = () => {
    if (receipt?.split_type === 'full') {
      const evenSplits = members.map((member, index) => {
        const percentages = calculateEvenSplit(members.length);
        return { userId: member.id, percentage: percentages[index] };
      });
      setSplits(evenSplits);
    } else if (receipt?.split_type === 'line_item' && receipt.line_items) {
      const newLineSplits = receipt.line_items.map(item => {
        const evenSplits = members.map((member, index) => {
          const percentages = calculateEvenSplit(members.length);
          return { userId: member.id, percentage: percentages[index] };
        });
        
        return {
          lineItemId: item.id,
          splits: evenSplits
        };
      });
      setLineSplits(newLineSplits);
    }
  };

  // Update a member's percentage in full receipt split
  const updateSplitPercentage = (userId: string, value: number) => {
    const newSplits = splits.map(split => 
      split.userId === userId ? { ...split, percentage: value } : split
    );
    setSplits(newSplits);
  };

  // Update a member's percentage in line item split
  const updateLineSplitPercentage = (lineItemId: string, userId: string, value: number) => {
    const newLineSplits = lineSplits.map(item => 
      item.lineItemId === lineItemId
        ? {
            ...item,
            splits: item.splits.map(split => 
              split.userId === userId ? { ...split, percentage: value } : split
            )
          }
        : item
    );
    setLineSplits(newLineSplits);
  };

  // Save splits
  const saveSplits = async () => {
    setIsSaving(true);
    try {
      if (receipt?.split_type === 'full') {
        // Validate total is 100%
        const total = splits.reduce((sum, split) => sum + split.percentage, 0);
        if (Math.abs(total - 100) > 0.1) {
          setError('Split percentages must add up to 100%.');
          return;
        }
        
        // In a real implementation, this would save to API
        // await receiptsApi.splitReceipt(receipt.id, splits);
        console.log('Saving full receipt splits:', splits);
      } else if (receipt?.split_type === 'line_item') {
        // Validate each line item splits to 100%
        for (const lineSplit of lineSplits) {
          const total = lineSplit.splits.reduce((sum, split) => sum + split.percentage, 0);
          if (Math.abs(total - 100) > 0.1) {
            setError(`Line item splits must add up to 100%. Check all items.`);
            return;
          }
        }
        
        // In a real implementation, this would save to API
        // await receiptsApi.splitLineItems(receipt.id, lineSplits);
        console.log('Saving line item splits:', lineSplits);
      }
      
      // Exit split mode
      setIsSplitMode(false);
      setError('');
      
      // Update receipt with new splits
      if (receipt?.split_type === 'full') {
        const updatedReceipt = { 
          ...receipt, 
          splits: splits.map(split => {
            const amount = (receipt.total_amount * split.percentage) / 100;
            return { ...split, amount };
          })
        };
        setReceipt(updatedReceipt);
      } else if (receipt?.split_type === 'line_item' && receipt.line_items) {
        const updatedLineItems = receipt.line_items.map(item => {
          const itemSplits = lineSplits.find(ls => ls.lineItemId === item.id)?.splits || [];
          return { ...item, splits: itemSplits };
        });
        setReceipt({ ...receipt, line_items: updatedLineItems });
      }
    } catch (err) {
      console.error('Error saving splits:', err);
      setError('Failed to save splits. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate total split amount
  const calculateSplitAmount = (userId: string): number => {
    if (!receipt) return 0;
    
    if (receipt.split_type === 'full') {
      const userSplit = splits.find(split => split.userId === userId);
      if (!userSplit) return 0;
      return (receipt.total_amount * userSplit.percentage) / 100;
    } else if (receipt.split_type === 'line_item' && receipt.line_items) {
      return receipt.line_items.reduce((total, item) => {
        const lineSplit = lineSplits.find(ls => ls.lineItemId === item.id);
        if (!lineSplit) return total;
        
        const userSplit = lineSplit.splits.find(split => split.userId === userId);
        if (!userSplit) return total;
        
        const itemTotal = item.amount * item.quantity;
        return total + (itemTotal * userSplit.percentage) / 100;
      }, 0);
    }
    
    return 0;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading receipt details...</p>
      </div>
    );
  }

  if (error && !receipt) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-red-600">
        <p>{error}</p>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={() => router.push(`/trips/${params.id}`)}
        >
          Go Back to Trip
        </Button>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-6 bg-slate-50 rounded-lg text-slate-600">
        <p>Receipt not found.</p>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={() => router.push(`/trips/${params.id}`)}
        >
          Go Back to Trip
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href={`/trips/${params.id}`} className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{receipt.title}</h1>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {isSplitMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Split {receipt.split_type === 'full' ? 'Receipt' : 'Line Items'}</CardTitle>
            <CardDescription>
              Assign percentages to each member. Total for each {receipt.split_type === 'full' ? 'receipt' : 'line item'} must equal 100%.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={applyEvenSplit}>
                Split Evenly
              </Button>
            </div>
            
            {receipt.split_type === 'full' ? (
              <div className="space-y-4 mt-2">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="py-2">Member</th>
                      <th className="py-2">Percentage</th>
                      <th className="py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.map(member => {
                      const memberSplit = splits.find(s => s.userId === member.id);
                      const percentage = memberSplit?.percentage || 0;
                      const amount = (receipt.total_amount * percentage) / 100;
                      
                      return (
                        <tr key={member.id}>
                          <td className="py-3 font-medium">
                            {member.name}
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={percentage}
                                onChange={(e) => updateSplitPercentage(member.id, parseFloat(e.target.value))}
                                className="w-20 h-8 px-2 border border-slate-200 rounded-md"
                              />
                              <span className="ml-1">%</span>
                            </div>
                          </td>
                          <td className="py-3">
                            {formatCurrency(amount)}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="font-medium">
                      <td className="py-3">Total</td>
                      <td className="py-3">
                        {splits.reduce((sum, split) => sum + split.percentage, 0).toFixed(2)}%
                      </td>
                      <td className="py-3">{formatCurrency(receipt.total_amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-6 mt-2">
                {receipt.line_items?.map(item => {
                  const itemTotal = item.amount * item.quantity;
                  const itemSplits = lineSplits.find(ls => ls.lineItemId === item.id)?.splits || [];
                  const totalPercentage = itemSplits.reduce((sum, split) => sum + split.percentage, 0);
                  
                  return (
                    <div key={item.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex justify-between mb-3">
                        <h3 className="font-medium">
                          {item.description} {item.quantity > 1 ? `(${item.quantity} × ${formatCurrency(item.amount)})` : ''}
                        </h3>
                        <span className="font-medium">{formatCurrency(itemTotal)}</span>
                      </div>
                      
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-slate-500">
                            <th className="py-1">Member</th>
                            <th className="py-1">Percentage</th>
                            <th className="py-1">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {members.map(member => {
                            const memberSplit = itemSplits.find(s => s.userId === member.id);
                            const percentage = memberSplit?.percentage || 0;
                            const amount = (itemTotal * percentage) / 100;
                            
                            return (
                              <tr key={`${item.id}-${member.id}`}>
                                <td className="py-2 text-sm">
                                  {member.name}
                                </td>
                                <td className="py-2 pr-4">
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      value={percentage}
                                      onChange={(e) => updateLineSplitPercentage(item.id, member.id, parseFloat(e.target.value))}
                                      className="w-16 h-7 px-2 text-sm border border-slate-200 rounded-md"
                                    />
                                    <span className="ml-1 text-sm">%</span>
                                  </div>
                                </td>
                                <td className="py-2 text-sm">
                                  {formatCurrency(amount)}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="font-medium text-sm">
                            <td className="py-2">Total</td>
                            <td className="py-2">
                              {totalPercentage.toFixed(2)}%
                            </td>
                            <td className="py-2">{formatCurrency(itemTotal)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setIsSplitMode(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveSplits} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Splits'}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs defaultValue="details" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="splits">Splits</TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Receipt Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Title</p>
                    <p className="font-medium">{receipt.title}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Date</p>
                    <p className="font-medium">{formatDate(receipt.date)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Amount</p>
                    <p className="font-medium">{formatCurrency(receipt.total_amount)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Paid By</p>
                    <p className="font-medium">{receipt.payer.name}</p>
                  </div>
                  
                  {receipt.merchant && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-500">Merchant</p>
                      <p className="font-medium">{receipt.merchant}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Split Type</p>
                    <p className="font-medium capitalize">{receipt.split_type.replace('_', ' ')}</p>
                  </div>
                </div>
                
                {receipt.split_type === 'line_item' && receipt.line_items && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="font-medium mb-3">Line Items</h3>
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-slate-500">
                          <th className="pb-2">Description</th>
                          <th className="pb-2">Qty</th>
                          <th className="pb-2">Price</th>
                          <th className="pb-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {receipt.line_items.map(item => (
                          <tr key={item.id}>
                            <td className="py-2">{item.description}</td>
                            <td className="py-2">{item.quantity}</td>
                            <td className="py-2">{formatCurrency(item.amount)}</td>
                            <td className="py-2 text-right font-medium">
                              {formatCurrency(item.amount * item.quantity)}
                            </td>
                          </tr>
                        ))}
                        <tr className="font-medium">
                          <td colSpan={3} className="py-2 text-right">Total</td>
                          <td className="py-2 text-right">{formatCurrency(receipt.total_amount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Splits Tab */}
          <TabsContent value="splits" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {receipt.split_type === 'full' ? 'Receipt Split' : 'Line Item Splits'}
                  </CardTitle>
                  <CardDescription>
                    How this receipt is split between members
                  </CardDescription>
                </div>
                <Button onClick={handleSplitMode}>
                  <SplitIcon className="mr-2 h-4 w-4" />
                  Edit Splits
                </Button>
              </CardHeader>
              <CardContent>
                {receipt.split_type === 'full' ? (
                  <div className="space-y-4">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left">
                          <th className="py-2">Member</th>
                          <th className="py-2">Percentage</th>
                          <th className="py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {members.map(member => {
                          const memberSplit = splits.find(s => s.userId === member.id);
                          const percentage = memberSplit?.percentage || 0;
                          const amount = (receipt.total_amount * percentage) / 100;
                          
                          return (
                            <tr key={member.id}>
                              <td className="py-3 font-medium">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-2 text-slate-400" />
                                  {member.name}
                                </div>
                              </td>
                              <td className="py-3">{percentage.toFixed(2)}%</td>
                              <td className="py-3">{formatCurrency(amount)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {receipt.line_items?.map(item => {
                      const itemTotal = item.amount * item.quantity;
                      const itemSplits = lineSplits.find(ls => ls.lineItemId === item.id)?.splits || [];
                      
                      return (
                        <div key={item.id} className="p-4 border border-slate-200 rounded-lg">
                          <div className="flex justify-between mb-3">
                            <h3 className="font-medium">
                              {item.description} {item.quantity > 1 ? `(${item.quantity} × ${formatCurrency(item.amount)})` : ''}
                            </h3>
                            <span className="font-medium">{formatCurrency(itemTotal)}</span>
                          </div>
                          
                          <table className="w-full">
                            <thead>
                              <tr className="text-left text-sm text-slate-500">
                                <th className="py-1">Member</th>
                                <th className="py-1">Percentage</th>
                                <th className="py-1">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {itemSplits.filter(s => s.percentage > 0).map(split => {
                                const member = members.find(m => m.id === split.userId);
                                const amount = (itemTotal * split.percentage) / 100;
                                
                                return (
                                  <tr key={`${item.id}-${split.userId}`}>
                                    <td className="py-2 text-sm">
                                      <div className="flex items-center">
                                        <User className="h-3 w-3 mr-1 text-slate-400" />
                                        {member?.name || 'Unknown'}
                                      </div>
                                    </td>
                                    <td className="py-2">{split.percentage.toFixed(2)}%</td>
                                    <td className="py-2">{formatCurrency(amount)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Member Totals</CardTitle>
                <CardDescription>
                  Total amount each member owes for this receipt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="py-2">Member</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.map(member => {
                      const amount = calculateSplitAmount(member.id);
                      const isPayer = receipt.payer.id === member.id;
                      
                      return (
                        <tr key={member.id}>
                          <td className="py-3">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-slate-400" />
                              <span className="font-medium">{member.name}</span>
                              {isPayer && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                  Paid
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-right font-medium">
                            {formatCurrency(amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}