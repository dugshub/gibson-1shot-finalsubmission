# SplitReceipt: Technical Implementation Guide

This document provides a precise, linear sequence of technical steps to implement the SplitReceipt application backend and project structure. For UI design guidelines and frontend implementation details, refer to the frontend-design.md document.

## Implementation Overview

```
▢ STEP 1: BACKEND CREATION - Create GibsonAI backend
▢ STEP 2: FRONTEND SETUP - Set up Next.js app with GibsonAI script
▢ STEP 3: CONNECT APIs - Configure backend integration
▢ STEP 4: FEATURE IMPLEMENTATION - Build core features
▢ STEP 5: TESTING - Verify functionality
```

## STEP 1: BACKEND CREATION

### 1.1. Create a new GibsonAI project

```bash
# Execute the MCP Gibson create_project function
mcp__gibson__create_project
```

When prompted for project details, use:
- Project name: "SplitReceipt"

Expected output:
```
{
  "uuid": "[project-uuid]",
  "name": "SplitReceipt",
  ...
}
```

**IMPORTANT:** Save the `uuid` value shown in the response - you'll need it for subsequent steps.

### 1.2. Get project details

```bash
# Execute the MCP Gibson get_project_details function using the UUID from step 1.1
mcp__gibson__get_project_details
```

When prompted for project UUID, enter the UUID saved from step 1.1.

### 1.3. Submit data modeling request

```bash
# Execute the MCP Gibson submit_data_modeling_request function
mcp__gibson__submit_data_modeling_request
```

When prompted, provide:
- UUID: The project UUID from step 1.1
- Data modeling request: Exactly paste the following schema:

```
Create a receipt splitting app with the following entities and relationships:

# Schema Design

1. Users - Store user accounts with authentication info
   - id (primary key, auto-increment)
   - username (varchar, unique, required)
   - email (varchar, unique, required)
   - password_hash (varchar, required)
   - created_at (timestamp)
   - updated_at (timestamp)

2. Trips - Group receipts by trip/event
   - id (primary key, auto-increment)
   - name (varchar, required)
   - description (text, nullable)
   - start_date (date, required)
   - end_date (date, nullable)
   - settled (boolean, default false - indicates if all expenses are settled)
   - created_at (timestamp)
   - updated_at (timestamp)

3. TripMembers - Track which users belong to which trips
   - id (primary key, auto-increment)
   - trip_id (foreign key to Trips.id, required)
   - user_id (foreign key to Users.id, required)
   - role (enum: 'owner', 'member', required)
   - created_at (timestamp)
   - updated_at (timestamp)
   - CONSTRAINT unique_trip_member UNIQUE(trip_id, user_id)

4. Receipts - Store receipt information
   - id (primary key, auto-increment)
   - trip_id (foreign key to Trips.id, required)
   - payer_id (foreign key to Users.id, required) - user who paid
   - title (varchar, required)
   - date (date, required)
   - total_amount (decimal(10,2), required)
   - merchant (varchar, nullable)
   - split_type (enum: 'full', 'line_item', required) - explicitly tracks split method
   - created_at (timestamp)
   - updated_at (timestamp)

5. LineItems - Individual items from receipts
   - id (primary key, auto-increment)
   - receipt_id (foreign key to Receipts.id, required)
   - description (varchar, required)
   - amount (decimal(10,2), required)
   - quantity (int, default 1)
   - created_at (timestamp)
   - updated_at (timestamp)

6. ReceiptSplits - Track how receipts are split between users (for full receipt splits)
   - id (primary key, auto-increment)
   - receipt_id (foreign key to Receipts.id, required)
   - user_id (foreign key to Users.id, required)
   - amount (decimal(10,2), required)
   - percentage (decimal(5,2), check (percentage >= 0 AND percentage <= 100))
   - created_at (timestamp)
   - updated_at (timestamp)
   - CONSTRAINT unique_receipt_split UNIQUE(receipt_id, user_id)

7. LineItemSplits - Track how line items are split between users
   - id (primary key, auto-increment)
   - line_item_id (foreign key to LineItems.id, required)
   - user_id (foreign key to Users.id, required)
   - amount (decimal(10,2), required)
   - percentage (decimal(5,2), check (percentage >= 0 AND percentage <= 100))
   - created_at (timestamp)
   - updated_at (timestamp)
   - CONSTRAINT unique_lineitem_split UNIQUE(line_item_id, user_id)

8. Settlements - Track payments between users to settle balances
   - id (primary key, auto-increment)
   - trip_id (foreign key to Trips.id, required)
   - payer_id (foreign key to Users.id, required) - who paid
   - receiver_id (foreign key to Users.id, required) - who received
   - amount (decimal(10,2), required)
   - date (date, required)
   - note (text, nullable)
   - created_at (timestamp)
   - updated_at (timestamp)

# Authentication Requirements
- JWT-based authentication with secure user registration and login
- Password hashing using bcrypt
- Role-based permissions (trip owner, trip member)
- Resource-based access control:
  - Users can only access trips they are members of
  - Only trip owners can add/remove members
  - Any member can add receipts to a trip
  - Only receipt creators can edit/delete their receipts
  - Any member can view all receipts and balances

# API Endpoints
- RESTful CRUD endpoints for all entities
- Authentication endpoints:
  - User registration (POST /auth/register)
  - User login (POST /auth/login) - returns JWT token
  - Get current user (GET /auth/me)
- Special endpoints for:
  - Calculating balances within a trip (GET /trips/{id}/balances)
  - Marking trips as settled (PUT /trips/{id}/settle)
  - Splitting receipts (POST /receipts/{id}/split)
  - Splitting line items (POST /line-items/{id}/split)
  - Adding settlements (POST /trips/{id}/settlements)

# Sample Data
- Create 3 sample users:
  - user1@example.com / password123
  - user2@example.com / password123
  - user3@example.com / password123
  
- Create a sample trip "Beach Vacation" with all 3 users
- Add 3-5 receipts with various line items
- Create some initial splits for demonstration
- Add one settlement between users
```

### 1.4. Deploy the GibsonAI project

```bash
# Execute the MCP Gibson deploy_project function
mcp__gibson__deploy_project
```

When prompted, provide:
- UUID: The project UUID from step 1.1

### 1.5. Get the deployment details

```bash
# Execute the MCP Gibson get_project_details function to get the API key
mcp__gibson__get_project_details
```

When prompted, provide:
- UUID: The project UUID from step 1.1

**IMPORTANT:** From the response, record the following information:
1. The development API key (will look like `gAAAAABo...`)
2. The OpenAPI spec URL (will look like `https://api.gibsonai.com/-/openapi/[docs_slug]`)

You will need these in the next step.

## STEP 2: FRONTEND SETUP

### 2.1. Use the GibsonAI startup application script

```bash 
# Run the GibsonAI setup script directly
bash <(curl -s https://raw.githubusercontent.com/GibsonAI/next-app/main/setup.sh)
```

**WHEN PROMPTED, PROVIDE THESE RESPONSES:**

When you see: `Enter project name:`
Type: `splitreceipt`

When you see: `Enter Gibson API key:`
Enter the API key you recorded from step 1.5

When you see: `Enter OpenAPI spec URL:`
Enter the OpenAPI spec URL you recorded from step 1.5

This will generate a complete Next.js application with GibsonAI API integration. Unlike our previous approach, we'll use this app directly instead of copying files from it.

### 2.2. Install Required Dependencies

```bash
# Install UI and utility dependencies
npm install class-variance-authority clsx tailwind-merge lucide-react tailwindcss-animate
npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-avatar @radix-ui/react-dropdown-menu

# Install ShadCN UI for component generation
npm install -D @shadcn/ui
```

Refer to the frontend-design.md document for detailed UI component setup and styling guidelines.

## STEP 3: API INTEGRATION

### 3.1. Create Next.js API Routes Structure

Create an API route structure to handle all interactions with the GibsonAI backend:

```
app/
  api/
    auth/
      login/
        route.ts
      register/
        route.ts
      me/
        route.ts
      logout/
        route.ts
    trips/
      route.ts
      [tripId]/
        route.ts
        receipts/
          route.ts
        members/
          route.ts
        balances/
          route.ts
    receipts/
      [receiptId]/
        route.ts
        split/
          route.ts
```

Create a base API route implementation pattern:

```typescript
// app/api/trips/route.ts - Basic structure for all API routes
import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  // 1. Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    // 2. Call Gibson API with authentication
    const { data, error } = await gibson.GET("/v1/trip", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 3. Handle success/error responses
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}
```

### 3.2. Create Auth Helper Utilities

Create helper functions for authentication at `lib/auth-helpers.ts`:

```typescript
// lib/auth-helpers.ts - Key authentication helper functions
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

// Token retrieval functions for server and client components
export function getAuthToken(req?: NextRequest): string | null {
  // Get from request header for API routes
  if (req) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) return authHeader.substring(7);
  }
  
  // Or from server-side cookies
  const cookieStore = cookies();
  return cookieStore.get("auth-token")?.value || null;
}

// Client-side helpers for token management
export function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth-token");
}

export function setClientToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem("auth-token", token);
}

export function removeClientToken(): void {
  if (typeof window !== "undefined") localStorage.removeItem("auth-token");
}
```

### 3.3. Implement Auth Context Provider

Create an authentication context for client components at `lib/auth-context.tsx`:

```typescript
// lib/auth-context.tsx - Authentication context for client components
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setClientToken, getClientToken, removeClientToken } from './auth-helpers';

// Core types for auth context
type User = { id: string; username: string; email: string; };

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

// Create and implement context with auth functionality
const AuthContext = createContext<AuthContextType>({/* Default values */});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Implementation should include:
  // - User state management
  // - Token persistence 
  // - Login/logout functionality
  // - User validation on initial load
}

// Custom hook for accessing auth context
export const useAuth = () => useContext(AuthContext);
```

### 3.4. Create Client-Side API Functions

Create a file at `lib/api-client.ts` for client-side API communication:

```typescript
// lib/api-client.ts - Client-side API wrappers (simplified pattern)

// Pattern for API clients with error handling
export const tripsApi = {
  // Get all trips for the current user
  getTrips: async () => {
    const response = await fetch('/api/trips');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch trips');
    }
    return response.json();
  },
  
  // Similar pattern for other trip-related operations
  getTrip: async (id: string) => { /* ... */ },
  createTrip: async (data: any) => { /* ... */ },
  updateTrip: async (id: string, data: any) => { /* ... */ },
};

// Follow similar patterns for other entity APIs
export const receiptsApi = {
  getReceipts: async (tripId: string) => { /* ... */ },
  createReceipt: async (data: any) => { /* ... */ },
  splitReceipt: async (id: string, splits: any) => { /* ... */ },
};
```

## STEP 4: FEATURE IMPLEMENTATION

### 4.1. Receipt Splitting Implementation

#### Overview of Split Types
The application supports two types of receipt splits:

1. **Full Receipt Split**:
   - The entire receipt amount is split among users based on percentages
   - Uses the ReceiptSplits table to track each user's portion
   - Simple for basic expenses where everyone shares equally
   - Good for meals, transportation, and accommodation where detailed breakdown isn't needed

2. **Line Item Split**:
   - Individual items on the receipt are assigned to specific users
   - Uses the LineItemSplits table to track assignments
   - Better for shopping trips or mixed expenses where people bought different items
   - Allows for more granular and fair distribution

#### Data Model Implementation

The data model enforces that a receipt can only have one split type at a time:

- The `split_type` field on the Receipt entity explicitly tracks whether it's a "full" or "line_item" split
- When changing split types, all existing splits of the other type must be removed
- Both split types require that percentages total exactly 100%

#### Split Type Validation

The backend uses these validation rules:

- Full receipt splits must total 100% across all users
- Line item splits must total 100% for each individual line item
- Amount calculations must match the total receipt amount
- The receipt's split_type field must match the type of splits being created

#### Receipt Split API Implementation

```typescript
// app/api/receipts/[receiptId]/split/route.ts - Core logic for receipt splitting
import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// Full receipt split handler (POST endpoint)
export async function POST(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  // Key steps in implementation:
  // 1. Validate split percentages total 100%
  // 2. Update receipt split_type field
  // 3. Remove existing splits of either type
  // 4. Create new splits based on the selected type
  
  // For 'full' split: Create ReceiptSplits entries
  // For 'line_item' split: Create LineItemSplits entries
}

// Calculate even splits utility (GET endpoint)
export async function GET(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  // Logic to get trip members and calculate even percentage split
}
```

### 4.2. Balance Calculation Implementation

Create an endpoint for calculating balances within a trip:

```typescript
// app/api/trips/[tripId]/balances/route.ts - Balance calculation algorithm
import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // High-level algorithm steps:
  // 1. Get trip data: members, receipts, settlements
  // 2. Initialize balance tracking for each member
  // 3. Process receipts to calculate amounts paid and owed
  //    - For full splits: use ReceiptSplits
  //    - For line item splits: aggregate LineItemSplits
  // 4. Factor in settlements (payments between members)
  // 5. Calculate net balances for each member
  // 6. Determine optimal payment paths to settle debts
  
  // Example response structure:
  return NextResponse.json({
    balances: {
      "user1": { paid: 120.50, owed: 80.33, net: 40.17 },
      "user2": { paid: 45.00, owed: 85.17, net: -40.17 }
    },
    transactions: [
      { from: "user2", to: "user1", amount: 40.17 }
    ]
  });
}
```

### 4.3. Client-Side Split Components

Implement client-side components for receipt splitting. Below are key components you'll need to create:

1. **SplitTypeToggle Component**
   - Purpose: Let users switch between full receipt and line item splits
   - Behavior: Warns user that changing split type removes existing splits
   - Implementation: Use tabs or toggle buttons with clear labeling

2. **FullReceiptSplit Component**
   - Purpose: UI for splitting entire receipt amount
   - Features:
     - "Split Evenly" button for quick division
     - Per-user percentage and amount inputs
     - Live calculation and validation (must total 100%)
     - Visual feedback on valid/invalid splits

3. **LineItemSplit Component**
   - Purpose: UI for assigning individual items to users
   - Features:
     - Line item selection interface
     - Individual percentage allocation per item
     - Option to assign whole items to specific users

4. **SplitSummary Component**
   - Purpose: Show the outcome of split calculations
   - Features: 
     - User-centric view of "you owe" and "you are owed"
     - Per-user breakdown of expenses
     - Visual indicators for payment status

The components should provide real-time feedback, clear validation, and handle edge cases like rounding errors appropriately.

### 4.4. Split Amount Calculation Utility

Create a utility function to help calculate split amounts based on percentages:

```typescript
// utils/split-calculations.ts - Helper functions for receipt splitting

// Calculate split amounts based on percentages and total amount
export function calculateSplitAmounts(totalAmount: number, percentages: { userId: string; percentage: number }[]) {
  // 1. Validate percentages total 100%
  // 2. Convert percentages to monetary amounts
  // 3. Handle rounding errors to ensure split amounts sum to total
}

// Create even splits among a group of users
export function createEvenSplits(totalAmount: number, userIds: string[]) {
  // 1. Calculate even percentage (100 / number of users)
  // 2. Handle rounding of percentages to ensure they total exactly 100%
  // 3. Calculate monetary amounts for each user
}
```

Follow this order of implementation for remaining features:

1. Authentication flow (login/register)
2. Trip listing and creation
3. Trip details with tabs
4. Receipt management
5. Splitting functionality
6. Balance calculation
7. Settlement recording

## STEP 5: TESTING

### 5.1. Testing API Integration

Before starting the development server, test your API integration:

```bash
# Test API key and OpenAPI spec URL
curl -H "X-Gibson-API-Key: YOUR_API_KEY" https://api.gibsonai.com/-/openapi/YOUR_DOCS_SLUG
```

If you receive valid response, your API is properly configured.

### 5.2. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

### 5.3. Functional Testing Checklist

1. **Authentication**
   - User registration
   - User login
   - Protected route access

2. **Trip Management**
   - Creating trips
   - Viewing trip lists
   - Trip details access

3. **Receipt Management**
   - Adding receipts to trips
   - Adding line items
   - Splitting functionality
   - Test both full receipt splits and line item splits
   - Verify split percentages total 100%

4. **Balance Calculation**
   - Verify balance calculations are correct
   - Test balance updates after splits
   - Check balance updates after settlements

5. **Settlements**
   - Record payments between users
   - Verify balance updates
   - Trip settlement status

Refer to the frontend-design.md document for detailed UI testing steps and visual verification.

## Debugging Tips

If you encounter issues:

1. **API Integration Problems**:
   - Check `.env.local` file for correct API credentials
   - Verify OpenAPI schema is correctly fetched
   - Check network requests for proper authorization headers

2. **Authentication Issues**:
   - Verify token storage and retrieval
   - Check if the token is included in API requests
   - Validate token expiration handling

3. **Data Flow Problems**:
   - Check data structure consistency between frontend and API
   - Verify type definitions match the API schema
   - Monitor API responses for unexpected formats

4. **Receipt Split Issues**:
   - Ensure split percentages add up to 100%
   - Verify correct split type is set on receipt
   - Check that correct splits table is being used based on split type

5. **Balance Calculation Issues**:
   - Verify all receipt splits are being included
   - Check that settlements are properly accounted for
   - Ensure rounding doesn't cause small discrepancies

For UI-specific troubleshooting, styling issues, and component debugging, refer to the frontend-design.md document.