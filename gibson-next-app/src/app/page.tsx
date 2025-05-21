import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-blue-600 mb-6">
        SplitReceipt
      </h1>
      <p className="text-xl text-slate-600 mb-8 max-w-2xl">
        The easiest way to split expenses with friends and track who owes what.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/login" 
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
      <div className="mt-8 text-sm text-slate-500">
        <p>Demo account: demo@example.com / password</p>
      </div>
    </div>
  );
}