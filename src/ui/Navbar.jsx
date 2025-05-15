import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if user has a theme preference saved
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark-theme');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Prevent scrolling when mobile menu is open
    document.body.style.overflow = isOpen ? 'auto' : 'hidden';
  };

  // Clean up the body overflow style when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <nav style={{ 
      backgroundColor: 'var(--surface)',
      boxShadow: 'var(--shadow-sm)'
    }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-22">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img className="h-8 w-auto mr-2" src="/logo.svg" alt="KittyPay Logo" />
              <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                KittyPay
              </span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="px-3 py-2 transition-colors" style={{ color: 'var(--text-primary)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
              Home
            </Link>
            <Link to="/send" className="px-3 py-2 transition-colors" style={{ color: 'var(--text-primary)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
              Send Money
            </Link>
            <Link to="/receive" className="px-3 py-2 transition-colors" style={{ color: 'var(--text-primary)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
              Receive
            </Link>
            <Link to="/history" className="px-3 py-2 transition-colors" style={{ color: 'var(--text-primary)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
              History
            </Link>
          </div>
          
          {/* Sign in/up buttons and theme toggle */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {/* Theme toggle button */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors"
              style={{ 
                backgroundColor: 'transparent',
                color: 'var(--text-primary)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-subtle)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button className="px-4 py-2 rounded-md transition-colors" 
              style={{ 
                border: '1px solid var(--primary)', 
                color: 'var(--primary)',
                backgroundColor: 'transparent'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              Sign In
            </button>
            <button className="px-4 py-2 rounded-md transition-colors" 
              style={{ 
                backgroundColor: 'var(--primary)', 
                color: 'white'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}>
              Sign Up
            </button>
          </div>
          
          {/* Mobile menu button and theme toggle */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Mobile theme toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors"
              style={{ 
                backgroundColor: 'transparent',
                color: 'var(--text-primary)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-subtle)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button 
              onClick={toggleMenu} 
              className="focus:outline-none transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
              {isOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - slide from left */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleMenu}>
        {/* Actual mobile menu container */}
        <div 
          className={`fixed inset-y-0 left-0 w-1/2 max-w-xs transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-md)' }}
          onClick={(e) => e.stopPropagation()}>
          
          {/* Header with Logo and Close button */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <Link to="/" className="flex items-center" onClick={toggleMenu}>
              <img className="h-7 w-auto mr-2" src="/logo.svg" alt="KittyPay Logo" />
              <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                KittyPay
              </span>
            </Link>
            <button 
              onClick={toggleMenu} 
              className="focus:outline-none" 
              style={{ color: 'var(--text-primary)' }}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Mobile menu content */}
          <div className="px-4 py-4 space-y-2">
            <Link 
              to="/" 
              className="block px-3 py-3 rounded-md transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onClick={toggleMenu}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}>
              Home
            </Link>
            <Link 
              to="/send" 
              className="block px-3 py-3 rounded-md transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onClick={toggleMenu}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}>
              Send Money
            </Link>
            <Link 
              to="/receive" 
              className="block px-3 py-3 rounded-md transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onClick={toggleMenu}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}>
              Receive
            </Link>
            <Link 
              to="/history" 
              className="block px-3 py-3 rounded-md transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onClick={toggleMenu}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}>
              History
            </Link>
            
            {/* Theme toggle in mobile menu */}
            <div className="block px-3 py-3 rounded-md transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}>
              <button 
                onClick={toggleTheme}
                className="flex items-center w-full text-left"
              >
                {isDark ? (
                  <>
                    <Sun size={18} className="mr-2" /> Light Mode
                  </>
                ) : (
                  <>
                    <Moon size={18} className="mr-2" /> Dark Mode
                  </>
                )}
              </button>
            </div>
            
            {/* Mobile sign in/up buttons */}
            <div className="pt-4 space-y-3">
              <button className="w-full px-4 py-2 rounded-md transition-colors" 
                style={{ 
                  border: '1px solid var(--primary)', 
                  color: 'var(--primary)',
                  backgroundColor: 'transparent'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Sign In
              </button>
              <button className="w-full px-4 py-2 rounded-md transition-colors" 
                style={{ 
                  backgroundColor: 'var(--primary)', 
                  color: 'white'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;