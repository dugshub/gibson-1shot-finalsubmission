import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// GET: Fetch specific trip by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // 1. Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { tripId } = params;
  
  // For demo user, return sample data
  if (token === 'demo-token') {
    if (tripId === 'trip-1') {
      return NextResponse.json({
        id: 'trip-1',
        name: 'Beach Vacation',
        description: 'Annual trip to the beach house',
        start_date: '2025-06-15',
        end_date: '2025-06-22',
        settled: false,
        created_at: '2025-05-01T10:00:00Z',
        updated_at: '2025-05-01T10:00:00Z'
      });
    } else if (tripId === 'trip-2') {
      return NextResponse.json({
        id: 'trip-2',
        name: 'City Weekend',
        description: 'Weekend getaway to the city',
        start_date: '2025-07-04',
        end_date: '2025-07-06',
        settled: true,
        created_at: '2025-05-10T14:30:00Z',
        updated_at: '2025-05-15T09:20:00Z'
      });
    } else {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
  }
  
  try {
    // 2. Call Gibson API with authentication
    const { data, error } = await gibson.GET(`/v1/trip/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 3. Handle success/error responses
    if (error) {
      if (error.status === 404) {
        return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}

// PUT: Update a trip
export async function PUT(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // 1. Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { tripId } = params;
  
  try {
    // 2. Extract trip update data from request
    const body = await req.json();
    
    // For demo user, return mock response
    if (token === 'demo-token') {
      return NextResponse.json({
        id: tripId,
        ...body,
        updated_at: new Date().toISOString()
      });
    }
    
    // 3. Call Gibson API to update trip
    const { data, error } = await gibson.PUT(`/v1/trip/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
      json: body
    });
    
    // 4. Handle success/error responses
    if (error) {
      if (error.status === 404) {
        return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}

// DELETE: Delete a trip
export async function DELETE(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // 1. Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { tripId } = params;
  
  // For demo user, return success
  if (token === 'demo-token') {
    return NextResponse.json({ success: true });
  }
  
  try {
    // 2. Call Gibson API to delete trip
    const { data, error } = await gibson.DELETE(`/v1/trip/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 3. Handle success/error responses
    if (error) {
      if (error.status === 404) {
        return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}