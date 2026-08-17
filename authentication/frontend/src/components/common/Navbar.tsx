import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Layers, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isGuest, role, enterGuestMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDiscoverClick = () => {
    enterGuestMode();
    navigate('/brand/discover');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'How It Works', path: '/#how-it-works' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-pink-500/20 transition-transform group-hover:scale-105">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent tracking-tight">
            CollabX
          </span>
        </Link>

        {/* Public Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-[#EC4899] ${
                location.pathname === link.path ? 'text-[#EC4899] font-semibold' : 'text-slate-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <button
            type="button"
            onClick={handleDiscoverClick}
            className="text-sm font-medium transition-colors hover:text-[#EC4899] text-slate-600"
          >
            Discover Creators
          </button>
        </nav>

        {/* Action Buttons - Desktop & Mobile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && !isGuest ? (
            <Link
              to={`/${role}/dashboard`}
              className="px-3.5 py-2 bg-[#EC4899] hover:bg-pink-600 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Go to Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-[#EC4899] hover:bg-pink-600 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 py-4 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === link.path
                    ? 'bg-pink-50 text-[#EC4899]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleDiscoverClick}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 text-left w-full"
            >
              Discover Creators
            </button>
          </nav>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-bold text-white bg-[#EC4899] hover:bg-pink-600 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
