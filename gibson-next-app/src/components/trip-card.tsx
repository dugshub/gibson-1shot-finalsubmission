'use client';

import Link from 'next/link';
import { Users, Calendar, Receipt, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TripCardProps {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  description?: string;
  totalAmount: number;
  yourContribution: number;
  yourBalance: number;
  memberCount: number;
  receiptCount: number;
  settled: boolean;
}

export default function TripCard({
  id,
  name,
  startDate,
  endDate,
  description,
  totalAmount,
  yourContribution,
  yourBalance,
  memberCount,
  receiptCount,
  settled,
}: TripCardProps) {
  return (
    <Card className={cn(
      "h-full flex flex-col transition-all hover:shadow-md",
      settled ? "border-green-200 bg-green-50" : "border-slate-200 bg-white"
    )}>
      <CardContent className="flex-1 p-6">
        <div className="space-y-2 mb-4">
          {settled && (
            <div className="text-xs font-semibold text-green-600 bg-green-100 rounded-full px-2 py-1 inline-block mb-2">
              Settled
            </div>
          )}
          <h3 className="font-bold text-xl">{name}</h3>
          <p className="text-sm text-slate-500 line-clamp-2">{description}</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center text-sm text-slate-500">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {formatDate(startDate)}
              {endDate ? ` to ${formatDate(endDate)}` : ''}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-slate-500">
            <Users className="h-4 w-4 mr-2" />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          
          <div className="flex items-center text-sm text-slate-500">
            <Receipt className="h-4 w-4 mr-2" />
            <span>{receiptCount} {receiptCount === 1 ? 'receipt' : 'receipts'}</span>
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Total:</span>
            <span className="font-medium">{formatCurrency(totalAmount)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">You paid:</span>
            <span className="font-medium">{formatCurrency(yourContribution)}</span>
          </div>
          
          <div className="flex justify-between items-center font-medium">
            <span className="text-sm text-slate-500">Your balance:</span>
            <span className={cn(
              yourBalance > 0 
                ? "text-green-600" 
                : yourBalance < 0 
                  ? "text-red-600" 
                  : "text-slate-600"
            )}>
              {yourBalance > 0 
                ? `You are owed ${formatCurrency(yourBalance)}` 
                : yourBalance < 0 
                  ? `You owe ${formatCurrency(Math.abs(yourBalance))}` 
                  : "Settled"}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-4 border-t bg-slate-50">
        <Link href={`/trips/${id}`} className="w-full">
          <Button variant="default" className="w-full">
            <span>View Details</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}