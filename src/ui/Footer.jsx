import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto py-6 border-t" style={{ 
      backgroundColor: 'var(--surface)',
      borderColor: 'var(--text-secondary)',
      opacity: 0.9
    }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and tagline */}
          <div className="flex flex-col items-center md:items-start">
            <Link to="/" className="flex items-center gap-2">
              <img className="h-8 w-auto" src="/logo.svg" alt="KittyPay Logo" />
              <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                KittyPay
              </span>
            </Link>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              The Modern Desi Way to Split Expenses
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 my-4 md:my-0">
            <Link to="/" className="hover:opacity-80 transition-opacity" 
              style={{ color: 'var(--text-primary)' }}>
              Home
            </Link>
            <Link to="/contact" className="hover:opacity-80 transition-opacity" 
              style={{ color: 'var(--text-primary)' }}>
              Contact
            </Link>
            <Link to="/privacy-policy" className="hover:opacity-80 transition-opacity" 
              style={{ color: 'var(--text-primary)' }}>
              Privacy
            </Link>
            <Link to="/terms-of-use" className="hover:opacity-80 transition-opacity" 
              style={{ color: 'var(--text-primary)' }}>
              Terms
            </Link>
          </div>

          {/* Copyright */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              © {currentYear} KittyPay. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer