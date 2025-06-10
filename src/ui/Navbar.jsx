import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSun, FaMoon, FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    // Check if user has a theme preference saved
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
    
    // Listen for theme changes from other components
    const handleThemeChange = (e) => {
      setIsDark(e.detail.isDark);
    };
    
    window.addEventListener('theme-changed', handleThemeChange);
    
    return () => {
      window.removeEventListener('theme-changed', handleThemeChange);
    };
  }, []);
  const toggleTheme = () => {
    const newIsDark = !isDark;
    
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      localStorage.setItem('theme-preference', 'light'); // Also set theme-preference for consistency
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('theme-preference', 'dark'); // Also set theme-preference for consistency
    }
    
    setIsDark(newIsDark);
    
    // Dispatch event to notify other components like Profile page
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDark: newIsDark } }));
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Prevent scrolling when mobile menu is open
    document.body.style.overflow = isOpen ? 'auto' : 'hidden';
  };

  const handleNavClick = (path) => {
    setIsOpen(false);
    document.body.style.overflow = 'auto';
    navigate(path);
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
            <Link to="/" className="flex items-center cursor-pointer">
              <img className="h-8 w-auto mr-2" src="/logo.svg" alt="KittyPay Logo" />
              <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                KittyPay
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="px-3 py-2 transition-colors cursor-pointer" style={{ color: 'var(--text-primary)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
              Home
            </Link>
            <Link to="/kitties" className="px-3 py-2 transition-colors cursor-pointer" style={{ color: 'var(--text-primary)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
              My Kitties
            </Link>
            <Link to="/dashboard" className="px-3 py-2 transition-colors cursor-pointer" style={{ color: 'var(--text-primary)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
              Dashboard
            </Link>
          </div>

          {/* Sign in/up buttons and theme toggle */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors cursor-pointer"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-primary)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-subtle)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>

            {isAuthenticated ? (
              <Link to="/profile">
                <button className="px-4 py-2 rounded-md transition-colors flex items-center cursor-pointer"
                  style={{
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light)'} 
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <FaUser className="mr-2" /> 
                  {currentUser?.displayName?.split(' ')[0] || 'Profile'}
                </button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button className="px-4 py-2 rounded-md transition-colors cursor-pointer"
                    style={{
                      border: '1px solid var(--primary)',
                      color: 'var(--primary)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light)'} 
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-4 py-2 rounded-md transition-colors cursor-pointer"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}>
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button and theme toggle */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Mobile theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors cursor-pointer"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-primary)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-subtle)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>

            <button
              onClick={toggleMenu}
              className="relative w-10 h-10 flex items-center justify-center focus:outline-none rounded-full hover:bg-[var(--hover-subtle)] transition-all duration-300 cursor-pointer"
              aria-label="Menu"
            >
              {isOpen ? (
                <FaTimes size={24} style={{ color: 'var(--text-primary)' }} />
              ) : (
                <div className="w-6 flex flex-col items-end justify-center">
                  <span 
                    className="block h-0.5 rounded-full transition-all duration-300" 
                    style={{ 
                      width: '100%', 
                      backgroundColor: 'var(--primary)',
                      marginBottom: '5px'
                    }}
                  ></span>
                  <span 
                    className="block h-0.5 rounded-full transition-all duration-300" 
                    style={{ 
                      width: '80%', 
                      backgroundColor: 'var(--text-primary)',
                      marginBottom: '5px'
                    }}
                  ></span>
                  <span 
                    className="block h-0.5 rounded-full transition-all duration-300" 
                    style={{ 
                      width: '60%', 
                      backgroundColor: 'var(--primary)'
                    }}
                  ></span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - with blurred backdrop */}
      <div
        className={`fixed inset-0 backdrop-blur-sm md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        onClick={toggleMenu}
      >
        {/* Actual mobile menu container - now from bottom */}
        <div
          className={`fixed bottom-0 inset-x-0 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
          style={{ 
            backgroundColor: 'var(--surface)', 
            boxShadow: 'var(--shadow-md)',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Logo and Close button */}
          <div className="sticky top-0 backdrop-blur-sm bg-[var(--surface)]/90 pt-2 pb-4 px-4 border-b flex flex-col items-center" style={{ borderColor: 'var(--border)' }}>
            {/* Drag handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-4"></div>
            
            <div className="flex items-center justify-between w-full">
              <Link to="/" className="flex items-center cursor-pointer" onClick={toggleMenu}>
                <img className="h-7 w-auto mr-2" src="/logo.svg" alt="KittyPay Logo" />
                <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                  KittyPay
                </span>
              </Link>
              <button
                onClick={toggleMenu}
                className="focus:outline-none p-2 rounded-full hover:bg-[var(--background)] cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>

          {/* Mobile menu content */}
          <div className="px-6 py-6 space-y-4">
            <div
              className="block px-4 py-3 rounded-xl transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--background)' }}
              onClick={() => handleNavClick('/')}
            >
              <div className="flex items-center">
                <span className="mr-3 text-[var(--primary)]">🏠</span>
                <span style={{ color: 'var(--text-primary)' }}>Home</span>
              </div>
            </div>
            
            <div
              className="block px-4 py-3 rounded-xl transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--background)' }}
              onClick={() => handleNavClick('/kitties')}
            >
              <div className="flex items-center">
                <span className="mr-3 text-[var(--primary)]">💰</span>
                <span style={{ color: 'var(--text-primary)' }}>My Kitties</span>
              </div>
            </div>
            
            <div
              className="block px-4 py-3 rounded-xl transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--background)' }}
              onClick={() => handleNavClick('/dashboard')}
            >
              <div className="flex items-center">
                <span className="mr-3 text-[var(--primary)]">📊</span>
                <span style={{ color: 'var(--text-primary)' }}>Dashboard</span>
              </div>
            </div>

            {/* Theme toggle in mobile menu */}
            <div
              className="block px-4 py-3 rounded-xl transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <button
                onClick={() => {
                  toggleTheme();
                }}
                className="flex items-center w-full text-left cursor-pointer"
              >
                <span className="mr-3 text-[var(--primary)]">
                  {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {isDark ? "Light Mode" : "Dark Mode"}
                </span>
              </button>
            </div>
            
            {/* Mobile sign in/up buttons or profile */}
            <div className="pt-4 space-y-3">
              {isAuthenticated ? (
                <div className="block w-full cursor-pointer" onClick={() => handleNavClick('/profile')}>
                  <button className="w-full px-4 py-3 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}>
                    <FaUser className="mr-2" /> My Profile
                  </button>
                </div>
              ) : (
                <>
                  <div className="block w-full cursor-pointer" onClick={() => handleNavClick('/login')}>
                    <button className="w-full px-4 py-3 rounded-xl transition-colors cursor-pointer"
                      style={{
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        backgroundColor: 'transparent'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      Login
                    </button>
                  </div>
                  <div className="block w-full cursor-pointer" onClick={() => handleNavClick('/signup')}>
                    <button className="w-full px-4 py-3 rounded-xl transition-colors cursor-pointer"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}>
                      Sign Up
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;