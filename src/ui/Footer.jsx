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
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
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
              Developed by <a href="https://github.com/mihir-28" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--primary)' }}>Mihir Nagda</a>
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              © {currentYear} KittyPay. All Rights Reserved.
            </p>
          </div>
        </div>
        
        {/* Tagline centered below all sections */}
        <div className="text-center mt-4 pt-4 border-t border-opacity-20" style={{ borderColor: 'var(--text-secondary)' }}>
          <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
            Because samosas are better shared — and so are expenses!
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer