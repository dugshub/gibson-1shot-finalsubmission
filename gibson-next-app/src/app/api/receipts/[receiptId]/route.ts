import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// GET: Fetch receipt details including line items
export async function GET(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  // 1. Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { receiptId } = params;
  
  // For demo user, return sample data
  if (token === 'demo-token') {
    if (receiptId === 'receipt-1') {
      return NextResponse.json({
        id: 'receipt-1',
        trip_id: 'trip-1',
        payer_id: 'default-user',
        title: 'Groceries',
        date: '2025-06-16',
        total_amount: 87.45,
        merchant: 'Whole Foods',
        split_type: 'line_item',
        created_at: '2025-06-16T15:30:00Z',
        updated_at: '2025-06-16T15:30:00Z',
        line_items: [
          {
            id: 'line-item-1',
            receipt_id: 'receipt-1',
            description: 'Bread',
            amount: 4.99,
            quantity: 1,
            created_at: '2025-06-16T15:30:00Z',
            updated_at: '2025-06-16T15:30:00Z'
          },
          {
            id: 'line-item-2',
            receipt_id: 'receipt-1',
            description: 'Milk',
            amount: 3.49,
            quantity: 2,
            created_at: '2025-06-16T15:30:00Z',
            updated_at: '2025-06-16T15:30:00Z'
          },
          {
            id: 'line-item-3',
            receipt_id: 'receipt-1',
            description: 'Fruits and vegetables',
            amount: 27.85,
            quantity: 1,
            created_at: '2025-06-16T15:30:00Z',
            updated_at: '2025-06-16T15:30:00Z'
          },
          {
            id: 'line-item-4',
            receipt_id: 'receipt-1',
            description: 'Snacks',
            amount: 15.63,
            quantity: 1,
            created_at: '2025-06-16T15:30:00Z',
            updated_at: '2025-06-16T15:30:00Z'
          },
          {
            id: 'line-item-5',
            receipt_id: 'receipt-1',
            description: 'Drinks',
            amount: 32.00,
            quantity: 1,
            created_at: '2025-06-16T15:30:00Z',
            updated_at: '2025-06-16T15:30:00Z'
          }
        ]
      });
    } else if (receiptId === 'receipt-2') {
      return NextResponse.json({
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
      });
    } else {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }
  }
  
  try {
    // 2. Call Gibson API to get receipt details
    const { data: receipt, error: receiptError } = await gibson.GET(`/v1/receipt/${receiptId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (receiptError) {
      if (receiptError.status === 404) {
        return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
      }
      return NextResponse.json({ error: receiptError.message }, { status: 400 });
    }
    
    // 3. Get line items if available
    const { data: lineItems, error: lineItemsError } = await gibson.GET(`/v1/receipt/${receiptId}/line-items`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (lineItemsError && lineItemsError.status !== 404) {
      console.error("Line items error:", lineItemsError);
      // Continue with receipt data even if line items fetch fails
    }
    
    // Combine receipt with line items
    return NextResponse.json({
      ...receipt,
      line_items: lineItems || []
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to fetch receipt details" }, { status: 500 });
  }
}

// PUT: Update receipt details
export async function PUT(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  // 1. Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { receiptId } = params;
  
  try {
    // 2. Extract receipt update data
    const body = await req.json();
    
    // For demo user, return updated mock data
    if (token === 'demo-token') {
      return NextResponse.json({
        id: receiptId,
        ...body,
        updated_at: new Date().toISOString()
      });
    }
    
    // 3. Call Gibson API to update receipt
    const { data, error } = await gibson.PUT(`/v1/receipt/${receiptId}`, {
      headers: { Authorization: `Bearer ${token}` },
      json: body
    });
    
    // 4. Handle success/error responses
    if (error) {
      if (error.status === 404) {
        return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to update receipt" }, { status: 500 });
  }
}

// DELETE: Delete a receipt
export async function DELETE(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  // 1. Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { receiptId } = params;
  
  // For demo user, return success
  if (token === 'demo-token') {
    return NextResponse.json({ success: true });
  }
  
  try {
    // 2. Call Gibson API to delete receipt
    const { data, error } = await gibson.DELETE(`/v1/receipt/${receiptId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 3. Handle success/error responses
    if (error) {
      if (error.status === 404) {
        return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to delete receipt" }, { status: 500 });
  }
}