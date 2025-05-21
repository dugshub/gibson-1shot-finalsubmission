import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// GET: Fetch all trips for the current user
export async function GET(req: NextRequest) {
  // 1. Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  // For demo user, return sample data
  if (token === 'demo-token') {
    return NextResponse.json([
      {
        id: 'trip-1',
        name: 'Beach Vacation',
        description: 'Annual trip to the beach house',
        start_date: '2025-06-15',
        end_date: '2025-06-22',
        settled: false,
        created_at: '2025-05-01T10:00:00Z',
        updated_at: '2025-05-01T10:00:00Z'
      },
      {
        id: 'trip-2',
        name: 'City Weekend',
        description: 'Weekend getaway to the city',
        start_date: '2025-07-04',
        end_date: '2025-07-06',
        settled: true,
        created_at: '2025-05-10T14:30:00Z',
        updated_at: '2025-05-15T09:20:00Z'
      }
    ]);
  }
  
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

// POST: Create a new trip
export async function POST(req: NextRequest) {
  // 1. Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    // 2. Extract trip data from request
    const body = await req.json();
    const { name, description, start_date, end_date } = body;
    
    // 3. Validate required fields
    if (!name || !start_date) {
      return NextResponse.json({
        error: "Name and start date are required"
      }, { status: 400 });
    }
    
    // For demo user, return mock response
    if (token === 'demo-token') {
      return NextResponse.json({
        id: `trip-${Date.now()}`,
        name,
        description,
        start_date,
        end_date,
        settled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    // 4. Call Gibson API to create trip
    const { data, error } = await gibson.POST("/v1/trip", {
      headers: { Authorization: `Bearer ${token}` },
      json: { name, description, start_date, end_date, settled: false }
    });
    
    // 5. Handle success/error responses
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}