'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function AppHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">SplitReceipt</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium ${
                    pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm font-medium text-slate-700 hover:text-blue-600"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-sm font-medium text-slate-700 hover:text-blue-600">
                    <User className="w-5 h-5" />
                    <span>{user?.username || 'User'}</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className={`text-sm font-medium ${
                    pathname === '/login' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className={`text-sm font-medium px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className="text-slate-700 hover:text-blue-600"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-b border-slate-200">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
                  }`}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <div className="px-3 py-2 text-base font-medium text-slate-700">
                  {user?.username || 'User'}
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === '/login' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
                  }`}
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === '/register' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
                  }`}
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}