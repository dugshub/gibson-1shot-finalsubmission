'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { tripsApi, settlementsApi } from '@/lib/api-client';

interface Member {
  id: string;
  name: string;
  email: string;
  balance: number;
}

interface Transaction {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

// Demo data
const demoMembers: Member[] = [
  { id: 'default-user', name: 'You', email: 'demo@example.com', balance: 138.53 },
  { id: 'user-2', name: 'Alex', email: 'alex@example.com', balance: 269.45 },
  { id: 'user-3', name: 'Jamie', email: 'jamie@example.com', balance: -190.97 },
  { id: 'user-4', name: 'Taylor', email: 'taylor@example.com', balance: -217.02 }
];

const demoTransactions: Transaction[] = [
  { from: 'user-3', fromName: 'Jamie', to: 'default-user', toName: 'You', amount: 138.53 },
  { from: 'user-3', fromName: 'Jamie', to: 'user-2', toName: 'Alex', amount: 52.44 },
  { from: 'user-4', fromName: 'Taylor', to: 'user-2', toName: 'Alex', amount: 217.02 }
];

export default function SettlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Settlement form state
  const [fromUserId, setFromUserId] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // For settling a specific transaction
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Load trip balances data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would fetch from the API
        // const { balances, transactions } = await tripsApi.getTripBalances(params.id);
        
        // For demo purposes, use demo data
        setMembers(demoMembers);
        setTransactions(demoTransactions);
        setError('');
      } catch (err) {
        console.error('Error fetching balances:', err);
        setError('Failed to load balances. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);

  // Handle selecting a transaction to settle
  const handleSelectTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFromUserId(transaction.from);
    setToUserId(transaction.to);
    setAmount(transaction.amount.toString());
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    
    try {
      if (!fromUserId || !toUserId || !amount || !date) {
        setError('Please fill in all required fields.');
        setIsSaving(false);
        return;
      }
      
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        setError('Please enter a valid amount.');
        setIsSaving(false);
        return;
      }
      
      // Prepare settlement data
      const settlementData = {
        trip_id: params.id,
        payer_id: fromUserId,
        receiver_id: toUserId,
        amount: amountValue,
        date,
        note: note || undefined
      };
      
      // In a real implementation, this would submit to the API
      // await settlementsApi.createSettlement(settlementData);
      
      // For demo, just log the data and redirect
      console.log('Creating settlement:', settlementData);
      
      // Update the UI to reflect the new settlement
      // This is simplified for the demo
      const updatedTransactions = transactions.filter(t => 
        !(t.from === fromUserId && t.to === toUserId && Math.abs(t.amount - amountValue) < 0.01)
      );
      setTransactions(updatedTransactions);
      
      // Clear form if more settlements needed
      if (updatedTransactions.length > 0) {
        setSelectedTransaction(null);
        setFromUserId('');
        setToUserId('');
        setAmount('');
        setNote('');
        setIsSaving(false);
      } else {
        // If all settled, redirect back to trip
        router.push(`/trips/${params.id}`);
      }
    } catch (err) {
      console.error('Error creating settlement:', err);
      setError('Failed to record settlement. Please try again.');
      setIsSaving(false);
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
        <h1 className="text-2xl font-bold">Settle Up</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading balances...</p>
        </div>
      ) : error ? (
        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-5">
          {/* Left column - settlement form */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Record a Settlement</CardTitle>
                <CardDescription>
                  {selectedTransaction 
                    ? `Recording payment from ${selectedTransaction.fromName} to ${selectedTransaction.toName}`
                    : 'Record a payment between trip members'}
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="from-user" className="block text-sm font-medium">
                      Payer (Who paid) *
                    </label>
                    <select
                      id="from-user"
                      value={fromUserId}
                      onChange={(e) => setFromUserId(e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!!selectedTransaction}
                    >
                      <option value="">Select payer</option>
                      {members
                        .filter(m => m.balance < 0)
                        .map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name} ({formatCurrency(Math.abs(member.balance))})
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="to-user" className="block text-sm font-medium">
                      Receiver (Who received payment) *
                    </label>
                    <select
                      id="to-user"
                      value={toUserId}
                      onChange={(e) => setToUserId(e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!!selectedTransaction}
                    >
                      <option value="">Select receiver</option>
                      {members
                        .filter(m => m.balance > 0)
                        .map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name} ({formatCurrency(member.balance)})
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="amount" className="block text-sm font-medium">
                      Amount *
                    </label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      disabled={!!selectedTransaction}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="date" className="block text-sm font-medium">
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
                  
                  <div className="space-y-2">
                    <label htmlFor="note" className="block text-sm font-medium">
                      Note (Optional)
                    </label>
                    <Input
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g., Venmo payment, cash, etc."
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => router.push(`/trips/${params.id}`)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Record Payment'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
          
          {/* Right column - transaction suggestions */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Suggested Settlements</CardTitle>
                <CardDescription>
                  Recommended payments to settle balances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((transaction, index) => (
                      <div 
                        key={index} 
                        className={`p-3 border rounded-md ${
                          selectedTransaction && 
                          selectedTransaction.from === transaction.from && 
                          selectedTransaction.to === transaction.to
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        } cursor-pointer transition-colors`}
                        onClick={() => handleSelectTransaction(transaction)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">
                              {transaction.fromName} pays {transaction.toName}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Tap to fill payment details
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="font-bold text-sm mr-1">
                              {formatCurrency(transaction.amount)}
                            </span>
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <p>All balances are settled!</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="block space-y-4 text-sm text-slate-500">
                <p>
                  Record payments as they happen in real life. This will update
                  the balances for all members.
                </p>
                <p>
                  When all balances are settled, the trip will be marked as
                  complete.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}