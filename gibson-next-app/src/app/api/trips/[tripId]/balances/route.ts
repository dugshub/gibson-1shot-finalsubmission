import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

// GET: Calculate balances for a trip
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
        balances: {
          'default-user': { paid: 87.45, owed: 80.79, net: 6.66 },
          'user-2': { paid: 154.92, owed: 80.79, net: 74.13 },
          'user-3': { paid: 0.00, owed: 80.79, net: -80.79 }
        },
        transactions: [
          { from: 'user-3', to: 'default-user', amount: 6.66 },
          { from: 'user-3', to: 'user-2', amount: 74.13 }
        ]
      });
    } else {
      return NextResponse.json({
        balances: {},
        transactions: []
      });
    }
  }
  
  try {
    // 2. Get trip details
    const { data: trip, error: tripError } = await gibson.GET(`/v1/trip/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (tripError) {
      if (tripError.status === 404) {
        return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      }
      return NextResponse.json({ error: tripError.message }, { status: 400 });
    }
    
    // 3. Get trip members
    const { data: members, error: membersError } = await gibson.GET(`/v1/trip/${tripId}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 400 });
    }
    
    // 4. Get receipts
    const { data: receipts, error: receiptsError } = await gibson.GET(`/v1/trip/${tripId}/receipts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (receiptsError && receiptsError.status !== 404) {
      return NextResponse.json({ error: receiptsError.message }, { status: 400 });
    }
    
    const tripReceipts = receipts || [];
    
    // 5. Get settlements
    const { data: settlements, error: settlementsError } = await gibson.GET(`/v1/trip/${tripId}/settlements`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (settlementsError && settlementsError.status !== 404) {
      return NextResponse.json({ error: settlementsError.message }, { status: 400 });
    }
    
    const tripSettlements = settlements || [];
    
    // 6. Calculate balances
    
    // Initialize balances for each member
    const balances = {};
    members.forEach(member => {
      balances[member.user_id] = { paid: 0, owed: 0, net: 0 };
    });
    
    // Process receipts by type
    for (const receipt of tripReceipts) {
      const receiptAmount = parseFloat(receipt.total_amount);
      
      // Add to payer's paid amount
      if (balances[receipt.payer_id]) {
        balances[receipt.payer_id].paid += receiptAmount;
      }
      
      if (receipt.split_type === 'full') {
        // Get receipt splits
        const { data: receiptSplits, error: splitsError } = await gibson.GET(`/v1/receipt/${receipt.id}/splits`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!splitsError && receiptSplits) {
          // Add to each member's owed amount based on splits
          receiptSplits.forEach(split => {
            if (balances[split.user_id]) {
              balances[split.user_id].owed += parseFloat(split.amount);
            }
          });
        }
      } else if (receipt.split_type === 'line_item') {
        // Get line items
        const { data: lineItems, error: lineItemsError } = await gibson.GET(`/v1/receipt/${receipt.id}/line-items`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!lineItemsError && lineItems) {
          // For each line item, get splits
          for (const lineItem of lineItems) {
            const { data: lineSplits, error: lineSplitsError } = await gibson.GET(`/v1/line-item/${lineItem.id}/splits`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!lineSplitsError && lineSplits) {
              // Add to each member's owed amount based on line item splits
              lineSplits.forEach(split => {
                if (balances[split.user_id]) {
                  balances[split.user_id].owed += parseFloat(split.amount);
                }
              });
            }
          }
        }
      }
    }
    
    // Process settlements
    for (const settlement of tripSettlements) {
      const amount = parseFloat(settlement.amount);
      
      // Add to payer's paid amount
      if (balances[settlement.payer_id]) {
        balances[settlement.payer_id].paid += amount;
      }
      
      // Add to receiver's owed amount
      if (balances[settlement.receiver_id]) {
        balances[settlement.receiver_id].owed += amount;
      }
    }
    
    // Calculate net balance for each member
    Object.keys(balances).forEach(userId => {
      balances[userId].net = balances[userId].paid - balances[userId].owed;
      
      // Round to 2 decimal places for currency
      balances[userId].paid = Math.round(balances[userId].paid * 100) / 100;
      balances[userId].owed = Math.round(balances[userId].owed * 100) / 100;
      balances[userId].net = Math.round(balances[userId].net * 100) / 100;
    });
    
    // 7. Calculate optimal payment paths
    const transactions = [];
    
    // Create arrays of debtors and creditors
    const debtors = Object.entries(balances)
      .filter(([, balance]) => balance.net < 0)
      .map(([userId, balance]) => ({ userId, amount: Math.abs(balance.net) }))
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending
    
    const creditors = Object.entries(balances)
      .filter(([, balance]) => balance.net > 0)
      .map(([userId, balance]) => ({ userId, amount: balance.net }))
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending
    
    // Create payment transactions
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];
      
      // Calculate payment amount (minimum of what's owed and what's due)
      const paymentAmount = Math.min(debtor.amount, creditor.amount);
      
      // Round to 2 decimal places
      const roundedAmount = Math.round(paymentAmount * 100) / 100;
      
      if (roundedAmount > 0) {
        transactions.push({
          from: debtor.userId,
          to: creditor.userId,
          amount: roundedAmount
        });
      }
      
      // Update balances
      debtor.amount -= paymentAmount;
      creditor.amount -= paymentAmount;
      
      // Remove users who have settled their balance
      if (debtor.amount < 0.01) debtors.shift();
      if (creditor.amount < 0.01) creditors.shift();
    }
    
    return NextResponse.json({
      balances,
      transactions
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to calculate balances" }, { status: 500 });
  }
}