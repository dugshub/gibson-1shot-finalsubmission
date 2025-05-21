'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TripCard from '@/components/trip-card';
import { tripsApi } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch trips data
  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const tripsData = await tripsApi.getTrips();
      setTrips(tripsData);
      setError('');
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to load trips. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load trips when component mounts and auth is complete
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchTrips();
      } else {
        router.push('/login');
      }
    }
  }, [authLoading, isAuthenticated, router]);

  // Separate active and settled trips
  const activeTrips = trips.filter(trip => !trip.settled);
  const settledTrips = trips.filter(trip => trip.settled);

  // Demo data for display when no trips exist
  const demoTrips = [
    {
      id: 'trip-1',
      name: 'Beach Vacation',
      startDate: '2025-06-15',
      endDate: '2025-06-22',
      description: 'Annual trip to the beach house with friends',
      totalAmount: 1245.87,
      yourContribution: 450.00,
      yourBalance: -50.20,
      memberCount: 4,
      receiptCount: 8,
      settled: false
    },
    {
      id: 'trip-2',
      name: 'Weekend Getaway',
      startDate: '2025-05-10',
      endDate: '2025-05-12',
      description: 'City break with roommates',
      totalAmount: 560.45,
      yourContribution: 320.45,
      yourBalance: 90.15,
      memberCount: 3,
      receiptCount: 5,
      settled: false
    },
    {
      id: 'trip-3',
      name: 'Movie Night',
      startDate: '2025-04-28',
      endDate: null,
      description: 'Weekly movie night with snacks',
      totalAmount: 85.75,
      yourContribution: 85.75,
      yourBalance: 42.87,
      memberCount: 5,
      receiptCount: 2,
      settled: false
    },
    {
      id: 'trip-4',
      name: 'New Year Party',
      startDate: '2024-12-31',
      endDate: '2025-01-01',
      description: 'New Year celebration',
      totalAmount: 450.20,
      yourContribution: 120.00,
      yourBalance: 0,
      memberCount: 8,
      receiptCount: 6,
      settled: true
    }
  ];

  const tripsToDisplay = trips.length > 0 ? trips : demoTrips;
  const activeTripsToDisplay = tripsToDisplay.filter(trip => !trip.settled);
  const settledTripsToDisplay = tripsToDisplay.filter(trip => trip.settled);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Trips</h1>
        <div className="flex space-x-2">
          <Button onClick={fetchTrips} variant="outline" size="icon" aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/trips/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Trip
            </Button>
          </Link>
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
          <p className="mt-4 text-slate-600">Loading your trips...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Active Trips Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Active Trips</h2>
            {activeTripsToDisplay.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
                <p className="text-slate-600 mb-4">You don't have any active trips yet.</p>
                <Link href="/trips/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Trip
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeTripsToDisplay.map((trip) => (
                  <TripCard
                    key={trip.id}
                    id={trip.id}
                    name={trip.name}
                    startDate={trip.startDate}
                    endDate={trip.endDate}
                    description={trip.description}
                    totalAmount={trip.totalAmount}
                    yourContribution={trip.yourContribution}
                    yourBalance={trip.yourBalance}
                    memberCount={trip.memberCount}
                    receiptCount={trip.receiptCount}
                    settled={trip.settled}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Settled Trips Section */}
          {settledTripsToDisplay.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Settled Trips</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {settledTripsToDisplay.map((trip) => (
                  <TripCard
                    key={trip.id}
                    id={trip.id}
                    name={trip.name}
                    startDate={trip.startDate}
                    endDate={trip.endDate}
                    description={trip.description}
                    totalAmount={trip.totalAmount}
                    yourContribution={trip.yourContribution}
                    yourBalance={trip.yourBalance}
                    memberCount={trip.memberCount}
                    receiptCount={trip.receiptCount}
                    settled={trip.settled}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}