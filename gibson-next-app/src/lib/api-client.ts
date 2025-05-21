// lib/api-client.ts - Client-side API wrappers
import { getClientToken } from './auth-helpers';
import { Trip, Receipt, LineItem, TripMember, ReceiptSplit, LineItemSplit, Settlement, User } from '../gibson/types';

// Generic API fetcher with authentication and error handling
async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getClientToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || `API error: ${response.status}`);
    } catch (e) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
  }

  return response.json();
}

// Trip-related API functions
export const tripsApi = {
  // Get all trips for the current user
  getTrips: async () => {
    return apiFetch<Trip[]>('/api/trips');
  },
  
  // Get a specific trip by ID
  getTrip: async (id: string) => {
    return apiFetch<Trip>(`/api/trips/${id}`);
  },
  
  // Create a new trip
  createTrip: async (data: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) => {
    return apiFetch<Trip>('/api/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update an existing trip
  updateTrip: async (id: string, data: Partial<Trip>) => {
    return apiFetch<Trip>(`/api/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete a trip
  deleteTrip: async (id: string) => {
    return apiFetch<{ success: boolean }>(`/api/trips/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Get trip balances
  getTripBalances: async (id: string) => {
    return apiFetch<{ balances: Record<string, { paid: number, owed: number, net: number }>, transactions: { from: string, to: string, amount: number }[] }>(`/api/trips/${id}/balances`);
  },
  
  // Mark a trip as settled
  settleTrip: async (id: string) => {
    return apiFetch<Trip>(`/api/trips/${id}/settle`, {
      method: 'PUT',
    });
  },
  
  // Get trip members
  getTripMembers: async (id: string) => {
    return apiFetch<(TripMember & { user: User })[]>(`/api/trips/${id}/members`);
  },
  
  // Add a member to a trip
  addTripMember: async (tripId: string, email: string, role: 'owner' | 'member' = 'member') => {
    return apiFetch<TripMember>(`/api/trips/${tripId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },
  
  // Remove a member from a trip
  removeTripMember: async (tripId: string, userId: string) => {
    return apiFetch<{ success: boolean }>(`/api/trips/${tripId}/members`, {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId }),
    });
  },
};

// Receipt-related API functions
export const receiptsApi = {
  // Get all receipts for a trip
  getTripReceipts: async (tripId: string) => {
    return apiFetch<Receipt[]>(`/api/trips/${tripId}/receipts`);
  },
  
  // Get a specific receipt
  getReceipt: async (id: string) => {
    return apiFetch<Receipt & { line_items?: LineItem[] }>(`/api/receipts/${id}`);
  },
  
  // Create a new receipt
  createReceipt: async (data: Omit<Receipt, 'id' | 'created_at' | 'updated_at'> & { line_items?: Omit<LineItem, 'id' | 'receipt_id' | 'created_at' | 'updated_at'>[] }) => {
    return apiFetch<Receipt>(`/api/trips/${data.trip_id}/receipts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update a receipt
  updateReceipt: async (id: string, data: Partial<Receipt>) => {
    return apiFetch<Receipt>(`/api/receipts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete a receipt
  deleteReceipt: async (id: string) => {
    return apiFetch<{ success: boolean }>(`/api/receipts/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Split a receipt (full receipt split)
  splitReceipt: async (id: string, splits: { user_id: string, percentage: number }[]) => {
    return apiFetch<ReceiptSplit[]>(`/api/receipts/${id}/split`, {
      method: 'POST',
      body: JSON.stringify({ split_type: 'full', splits }),
    });
  },
  
  // Split receipt line items
  splitLineItems: async (id: string, lineSplits: { line_item_id: string, splits: { user_id: string, percentage: number }[] }[]) => {
    return apiFetch<LineItemSplit[]>(`/api/receipts/${id}/split`, {
      method: 'POST',
      body: JSON.stringify({ split_type: 'line_item', line_splits: lineSplits }),
    });
  },
  
  // Calculate even split for a receipt
  calculateEvenSplit: async (id: string) => {
    return apiFetch<{ splits: { user_id: string, percentage: number }[] }>(`/api/receipts/${id}/split`);
  },
};

// Settlement-related API functions
export const settlementsApi = {
  // Get all settlements for a trip
  getTripSettlements: async (tripId: string) => {
    return apiFetch<Settlement[]>(`/api/trips/${tripId}/settlements`);
  },
  
  // Create a new settlement
  createSettlement: async (data: Omit<Settlement, 'id' | 'created_at' | 'updated_at'>) => {
    return apiFetch<Settlement>(`/api/trips/${data.trip_id}/settlements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};