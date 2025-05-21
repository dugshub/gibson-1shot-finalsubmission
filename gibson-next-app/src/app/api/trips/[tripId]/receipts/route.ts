import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// GET: Fetch receipts for a specific trip
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
      return NextResponse.json([
        {
          id: 'receipt-1',
          trip_id: 'trip-1',
          payer_id: 'default-user',
          title: 'Groceries',
          date: '2025-06-16',
          total_amount: 87.45,
          merchant: 'Whole Foods',
          split_type: 'full',
          created_at: '2025-06-16T15:30:00Z',
          updated_at: '2025-06-16T15:30:00Z'
        },
        {
          id: 'receipt-2',
          trip_id: 'trip-1',
          payer_id: 'user-2',
          title: 'Restaurant dinner',
          date: '2025-06-17',
          total_amount: 154.92,
          merchant: 'Seaside Grill',
          split_type: 'full',
          created_at: '2025-06-17T22:15:00Z',
          updated_at: '2025-06-17T22:15:00Z'
        }
      ]);
    } else {
      return NextResponse.json([]);
    }
  }
  
  try {
    // 2. Call Gibson API with authentication
    const { data, error } = await gibson.GET(`/v1/trip/${tripId}/receipts`, {
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
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 });
  }
}

// POST: Create a new receipt for a trip
export async function POST(
  req: NextRequest,
  { params }: { params: { tripId: string } }
) {
  // 1. Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { tripId } = params;
  
  try {
    // 2. Extract receipt data from request
    const body = await req.json();
    const { title, date, total_amount, merchant, split_type, line_items } = body;
    
    // 3. Validate required fields
    if (!title || !date || total_amount === undefined || !split_type) {
      return NextResponse.json({
        error: "Title, date, total amount, and split type are required"
      }, { status: 400 });
    }
    
    // For demo user, return mock response
    if (token === 'demo-token') {
      const newReceiptId = `receipt-${Date.now()}`;
      const now = new Date().toISOString();
      
      const newReceipt = {
        id: newReceiptId,
        trip_id: tripId,
        payer_id: 'default-user',
        title,
        date,
        total_amount,
        merchant,
        split_type,
        created_at: now,
        updated_at: now
      };
      
      // If line items are included, add them to the response
      if (line_items && Array.isArray(line_items)) {
        return NextResponse.json({
          ...newReceipt,
          line_items: line_items.map((item, index) => ({
            id: `line-item-${Date.now()}-${index}`,
            receipt_id: newReceiptId,
            description: item.description,
            amount: item.amount,
            quantity: item.quantity || 1,
            created_at: now,
            updated_at: now
          }))
        });
      }
      
      return NextResponse.json(newReceipt);
    }
    
    // 4. Call Gibson API to create receipt
    let receiptData = {
      trip_id: tripId,
      title,
      date,
      total_amount,
      merchant,
      split_type
    };
    
    const { data, error } = await gibson.POST("/v1/receipt", {
      headers: { Authorization: `Bearer ${token}` },
      json: receiptData
    });
    
    // 5. Handle success/error responses
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    
    // 6. If line items are included, create them as well
    if (line_items && Array.isArray(line_items) && data.id) {
      const lineItemPromises = line_items.map(item => 
        gibson.POST("/v1/line-item", {
          headers: { Authorization: `Bearer ${token}` },
          json: {
            receipt_id: data.id,
            description: item.description,
            amount: item.amount,
            quantity: item.quantity || 1
          }
        })
      );
      
      try {
        const lineItemResults = await Promise.all(lineItemPromises);
        const validLineItems = lineItemResults
          .filter(result => !result.error)
          .map(result => result.data);
        
        return NextResponse.json({
          ...data,
          line_items: validLineItems
        });
      } catch (lineItemError) {
        console.error("Line item creation error:", lineItemError);
        // Return the receipt even if line items failed
        return NextResponse.json({
          ...data,
          line_items_error: "Some line items could not be created"
        });
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to create receipt" }, { status: 500 });
  }
}