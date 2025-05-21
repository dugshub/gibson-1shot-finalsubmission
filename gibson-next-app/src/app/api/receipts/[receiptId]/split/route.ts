import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// GET: Calculate even split for a receipt
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
    return NextResponse.json({
      splits: [
        { user_id: 'default-user', percentage: 33.33 },
        { user_id: 'user-2', percentage: 33.33 },
        { user_id: 'user-3', percentage: 33.34 }
      ]
    });
  }
  
  try {
    // 2. Get receipt details to find the trip
    const { data: receipt, error: receiptError } = await gibson.GET(`/v1/receipt/${receiptId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (receiptError) {
      if (receiptError.status === 404) {
        return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
      }
      return NextResponse.json({ error: receiptError.message }, { status: 400 });
    }
    
    // 3. Get trip members
    const { data: tripMembers, error: membersError } = await gibson.GET(`/v1/trip/${receipt.trip_id}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 400 });
    }
    
    // 4. Calculate even split
    const memberCount = tripMembers.length;
    if (memberCount === 0) {
      return NextResponse.json({ error: "No members in trip to split with" }, { status: 400 });
    }
    
    const basePercentage = Math.floor((100 / memberCount) * 100) / 100;
    const remainder = 100 - (basePercentage * memberCount);
    
    const splits = tripMembers.map((member, index) => ({
      user_id: member.user_id,
      percentage: index === 0 
        ? basePercentage + remainder // First member gets the remainder
        : basePercentage
    }));
    
    return NextResponse.json({ splits });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to calculate even split" }, { status: 500 });
  }
}

// POST: Create full receipt or line item splits
export async function POST(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  // 1. Get auth token and validate
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { receiptId } = params;
  
  try {
    // 2. Extract split data from request
    const body = await req.json();
    const { split_type, splits, line_splits } = body;
    
    // 3. Validate request data
    if (!split_type) {
      return NextResponse.json({ error: "Split type is required" }, { status: 400 });
    }
    
    if (split_type === 'full' && (!splits || !Array.isArray(splits))) {
      return NextResponse.json({ error: "Splits array is required for full receipt split" }, { status: 400 });
    }
    
    if (split_type === 'line_item' && (!line_splits || !Array.isArray(line_splits))) {
      return NextResponse.json({ error: "Line splits array is required for line item split" }, { status: 400 });
    }
    
    // For demo user, return mock response
    if (token === 'demo-token') {
      if (split_type === 'full') {
        return NextResponse.json(
          splits.map((split, index) => ({
            id: `receipt-split-${Date.now()}-${index}`,
            receipt_id: receiptId,
            user_id: split.user_id,
            amount: 0, // Would be calculated based on percentage
            percentage: split.percentage,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        );
      } else {
        // For line item splits
        const allSplits = [];
        line_splits.forEach((lineSplit, lineIndex) => {
          lineSplit.splits.forEach((split, splitIndex) => {
            allSplits.push({
              id: `line-item-split-${Date.now()}-${lineIndex}-${splitIndex}`,
              line_item_id: lineSplit.line_item_id,
              user_id: split.user_id,
              amount: 0, // Would be calculated based on percentage
              percentage: split.percentage,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          });
        });
        return NextResponse.json(allSplits);
      }
    }
    
    // 4. Update receipt split type if needed
    const { data: receipt, error: receiptError } = await gibson.GET(`/v1/receipt/${receiptId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (receiptError) {
      if (receiptError.status === 404) {
        return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
      }
      return NextResponse.json({ error: receiptError.message }, { status: 400 });
    }
    
    // If split_type has changed, update the receipt
    if (receipt.split_type !== split_type) {
      const { error: updateError } = await gibson.PUT(`/v1/receipt/${receiptId}`, {
        headers: { Authorization: `Bearer ${token}` },
        json: { split_type }
      });
      
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
    }
    
    // 5. Handle full receipt splits
    if (split_type === 'full') {
      // First, remove any existing splits
      await gibson.DELETE(`/v1/receipt/${receiptId}/splits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Calculate split amounts
      const receiptAmount = receipt.total_amount;
      const splitsWithAmount = splits.map(split => ({
        ...split,
        amount: (receiptAmount * split.percentage) / 100
      }));
      
      // Create receipt splits
      const splitPromises = splitsWithAmount.map(split => 
        gibson.POST("/v1/receipt-split", {
          headers: { Authorization: `Bearer ${token}` },
          json: {
            receipt_id: receiptId,
            user_id: split.user_id,
            amount: split.amount,
            percentage: split.percentage
          }
        })
      );
      
      try {
        const splitResults = await Promise.all(splitPromises);
        const validSplits = splitResults
          .filter(result => !result.error)
          .map(result => result.data);
        
        return NextResponse.json(validSplits);
      } catch (splitError) {
        console.error("Split creation error:", splitError);
        return NextResponse.json({ error: "Failed to create receipt splits" }, { status: 500 });
      }
    } 
    // 6. Handle line item splits
    else if (split_type === 'line_item') {
      // Clear any existing line item splits
      // (This would require a separate endpoint in the actual API)
      
      // Create line item splits
      const allSplitPromises = [];
      
      for (const lineSplit of line_splits) {
        // Get line item to calculate amount
        const { data: lineItem, error: lineItemError } = await gibson.GET(`/v1/line-item/${lineSplit.line_item_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (lineItemError) {
          console.error(`Error fetching line item ${lineSplit.line_item_id}:`, lineItemError);
          continue;
        }
        
        // Calculate split amounts
        const lineItemAmount = lineItem.amount;
        const splitsWithAmount = lineSplit.splits.map(split => ({
          ...split,
          amount: (lineItemAmount * split.percentage) / 100
        }));
        
        // Create promises for each split
        for (const split of splitsWithAmount) {
          allSplitPromises.push(
            gibson.POST("/v1/line-item-split", {
              headers: { Authorization: `Bearer ${token}` },
              json: {
                line_item_id: lineSplit.line_item_id,
                user_id: split.user_id,
                amount: split.amount,
                percentage: split.percentage
              }
            })
          );
        }
      }
      
      try {
        const splitResults = await Promise.all(allSplitPromises);
        const validSplits = splitResults
          .filter(result => !result.error)
          .map(result => result.data);
        
        return NextResponse.json(validSplits);
      } catch (splitError) {
        console.error("Line item split creation error:", splitError);
        return NextResponse.json({ error: "Failed to create line item splits" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "Invalid split type" }, { status: 400 });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to create splits" }, { status: 500 });
  }
}