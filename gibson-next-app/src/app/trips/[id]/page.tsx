'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarRange, Users, Receipt, CreditCard, Check, PlusCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { tripsApi } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

interface Balance {
  userId: string;
  userName: string;
  paid: number;
  owed: number;
  net: number;
}

interface Transaction {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

interface ReceiptItem {
  id: string;
  title: string;
  date: string;
  amount: number;
  payer: {
    id: string;
    name: string;
  };
  split_type: 'full' | 'line_item';
  merchant?: string;
}

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  paid: number;
  owed: number;
  net: number;
}

interface TripDetails {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  settled: boolean;
  totalAmount: number;
  balances: Balance[];
  transactions: Transaction[];
  receipts: ReceiptItem[];
  members: MemberItem[];
}

// Demo data for display
const demoTrip: TripDetails = {
  id: 'trip-1',
  name: 'Beach Vacation',
  description: 'Annual trip to the beach house with friends',
  startDate: '2025-06-15',
  endDate: '2025-06-22',
  settled: false,
  totalAmount: 1245.87,
  balances: [
    { userId: 'default-user', userName: 'You', paid: 450.00, owed: 311.47, net: 138.53 },
    { userId: 'user-2', userName: 'Alex', paid: 580.92, owed: 311.47, net: 269.45 },
    { userId: 'user-3', userName: 'Jamie', paid: 120.50, owed: 311.47, net: -190.97 },
    { userId: 'user-4', userName: 'Taylor', paid: 94.45, owed: 311.47, net: -217.02 }
  ],
  transactions: [
    { from: 'user-3', fromName: 'Jamie', to: 'default-user', toName: 'You', amount: 138.53 },
    { from: 'user-3', fromName: 'Jamie', to: 'user-2', toName: 'Alex', amount: 52.44 },
    { from: 'user-4', fromName: 'Taylor', to: 'user-2', toName: 'Alex', amount: 217.02 }
  ],
  receipts: [
    {
      id: 'receipt-1',
      title: 'Groceries',
      date: '2025-06-16',
      amount: 87.45,
      payer: { id: 'default-user', name: 'You' },
      split_type: 'line_item',
      merchant: 'Whole Foods'
    },
    {
      id: 'receipt-2',
      title: 'Restaurant dinner',
      date: '2025-06-17',
      amount: 154.92,
      payer: { id: 'user-2', name: 'Alex' },
      split_type: 'full',
      merchant: 'Seaside Grill'
    },
    {
      id: 'receipt-3',
      title: 'Beach house rental',
      date: '2025-06-15',
      amount: 850.00,
      payer: { id: 'user-2', name: 'Alex' },
      split_type: 'full',
      merchant: 'Beach Rentals Inc.'
    },
    {
      id: 'receipt-4',
      title: 'Water sports',
      date: '2025-06-18',
      amount: 120.50,
      payer: { id: 'user-3', name: 'Jamie' },
      split_type: 'full',
      merchant: 'Ocean Adventures'
    },
    {
      id: 'receipt-5',
      title: 'Gas',
      date: '2025-06-19',
      amount: 33.00,
      payer: { id: 'default-user', name: 'You' },
      split_type: 'full',
      merchant: 'Shell'
    }
  ],
  members: [
    { id: 'default-user', name: 'You', email: 'demo@example.com', role: 'owner', paid: 450.00, owed: 311.47, net: 138.53 },
    { id: 'user-2', name: 'Alex', email: 'alex@example.com', role: 'member', paid: 580.92, owed: 311.47, net: 269.45 },
    { id: 'user-3', name: 'Jamie', email: 'jamie@example.com', role: 'member', paid: 120.50, owed: 311.47, net: -190.97 },
    { id: 'user-4', name: 'Taylor', email: 'taylor@example.com', role: 'member', paid: 94.45, owed: 311.47, net: -217.02 }
  ]
};

export default function TripDetailsPage({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch trip data
  const fetchTripDetails = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from the API
      // const tripData = await tripsApi.getTrip(params.id);
      
      // For demo purposes, use demo data
      setTrip(demoTrip);
      setError('');
    } catch (err) {
      console.error('Error fetching trip details:', err);
      setError('Failed to load trip details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load trip details when component mounts and auth is complete
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchTripDetails();
      } else {
        router.push('/login');
      }
    }
  }, [authLoading, isAuthenticated, router, params.id]);

  // Your balance from the trip
  const yourBalance = trip?.balances.find(b => b.userId === 'default-user')?.net || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{trip?.name || 'Trip Details'}</h1>
          {trip?.settled && (
            <span className="ml-3 text-xs font-semibold text-green-600 bg-green-100 rounded-full px-2 py-1 inline-block">
              Settled
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <Link href={`/trips/${params.id}/receipts/new`}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Receipt
            </Button>
          </Link>
          {!trip?.settled && yourBalance !== 0 && (
            <Link href={`/trips/${params.id}/settle`}>
              <Button variant="outline">
                <Check className="mr-2 h-4 w-4" />
                Settle Up
              </Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading trip details...</p>
        </div>
      ) : trip ? (
        <>
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="receipts">Receipts</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Trip Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trip Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start">
                      <CalendarRange className="h-5 w-5 text-slate-500 mt-0.5 mr-2" />
                      <div>
                        <p className="font-medium">{formatDate(trip.startDate)}</p>
                        {trip.endDate && <p className="text-sm text-slate-500">to {formatDate(trip.endDate)}</p>}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-slate-500 mt-0.5 mr-2" />
                      <div>
                        <p className="font-medium">{trip.members.length} Members</p>
                        <p className="text-sm text-slate-500">
                          {trip.members.map(m => m.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Receipt className="h-5 w-5 text-slate-500 mt-0.5 mr-2" />
                      <div>
                        <p className="font-medium">{trip.receipts.length} Receipts</p>
                        <p className="text-sm text-slate-500">Total: {formatCurrency(trip.totalAmount)}</p>
                      </div>
                    </div>
                    {trip.description && (
                      <div className="pt-2">
                        <p className="text-sm text-slate-600">{trip.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Your Balance Card */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Your Balance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-500 mb-1">You paid</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(trip.balances.find(b => b.userId === 'default-user')?.paid || 0)}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-500 mb-1">You owe</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(trip.balances.find(b => b.userId === 'default-user')?.owed || 0)}
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${
                        yourBalance > 0 ? 'bg-green-50' : 
                        yourBalance < 0 ? 'bg-red-50' : 'bg-slate-50'
                      }`}>
                        <p className="text-sm text-slate-500 mb-1">Balance</p>
                        <p className={`text-2xl font-bold ${
                          yourBalance > 0 ? 'text-green-600' : 
                          yourBalance < 0 ? 'text-red-600' : 'text-slate-700'
                        }`}>
                          {yourBalance > 0 
                            ? `+${formatCurrency(yourBalance)}` 
                            : yourBalance < 0 
                              ? `-${formatCurrency(Math.abs(yourBalance))}` 
                              : formatCurrency(0)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Settlement Actions */}
                    {!trip.settled && yourBalance !== 0 && (
                      <div className="text-center pt-2">
                        <Link href={`/trips/${params.id}/settle`}>
                          <Button>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Settle Up
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Settlement Transactions</CardTitle>
                  <CardDescription>
                    How to settle all balances in this trip
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trip.transactions.length > 0 ? (
                    <div className="space-y-4">
                      {trip.transactions.map((transaction, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-md"
                        >
                          <div className="flex items-center">
                            <div className="bg-white rounded-full p-2 mr-3 shadow-sm">
                              <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                <span className={transaction.from === 'default-user' ? 'font-bold' : ''}>
                                  {transaction.fromName}
                                </span>
                                {' pays '}
                                <span className={transaction.to === 'default-user' ? 'font-bold' : ''}>
                                  {transaction.toName}
                                </span>
                              </p>
                              <p className="text-sm text-slate-500">
                                {transaction.from === 'default-user' ? 
                                  'You need to pay' : 
                                  transaction.to === 'default-user' ? 
                                    'You will receive' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="font-bold">
                            {formatCurrency(transaction.amount)}
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
              </Card>
            </TabsContent>
            
            {/* Receipts Tab */}
            <TabsContent value="receipts" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">All Receipts</h2>
                <Link href={`/trips/${params.id}/receipts/new`}>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Receipt
                  </Button>
                </Link>
              </div>
              
              {trip.receipts.length > 0 ? (
                <div className="space-y-4">
                  {trip.receipts.map((receipt) => (
                    <Link key={receipt.id} href={`/trips/${params.id}/receipts/${receipt.id}`}>
                      <div className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{receipt.title}</h3>
                            <p className="text-sm text-slate-500">
                              {receipt.merchant && `${receipt.merchant} • `}{formatDate(receipt.date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(receipt.amount)}</p>
                            <p className="text-sm text-slate-500">
                              Paid by {receipt.payer.name}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            receipt.split_type === 'full' ? 
                              'bg-blue-100 text-blue-700' : 
                              'bg-purple-100 text-purple-700'
                          }`}>
                            {receipt.split_type === 'full' ? 'Full Split' : 'Line Item Split'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
                  <p className="text-slate-600 mb-4">No receipts have been added to this trip yet.</p>
                  <Link href={`/trips/${params.id}/receipts/new`}>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add First Receipt
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
            
            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Trip Members</h2>
                <Button variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
              
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-500">Name</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-500">Role</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-slate-500">Paid</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-slate-500">Owed</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-slate-500">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trip.members.map((member) => (
                      <tr key={member.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-slate-500">{member.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            member.role === 'owner' ? 
                              'bg-blue-100 text-blue-700' : 
                              'bg-slate-100 text-slate-700'
                          }`}>
                            {member.role === 'owner' ? 'Owner' : 'Member'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(member.paid)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(member.owed)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-bold ${
                            member.net > 0 ? 'text-green-600' : 
                            member.net < 0 ? 'text-red-600' : 'text-slate-600'
                          }`}>
                            {member.net > 0 ? '+' : ''}{formatCurrency(member.net)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}