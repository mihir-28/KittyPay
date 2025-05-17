import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ThemeToggle component that switches between light and dark theme
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.size] - Size of the toggle button ('sm', 'md', 'lg')
 * @returns {JSX.Element} - ThemeToggle component
 */
const ThemeToggle = ({ className = '', size = 'md' }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first on component initialization
    const storedTheme = localStorage.getItem('theme-preference');
    if (storedTheme) {
      return storedTheme === 'dark';
    }
    // If no stored preference, check for system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Get button size based on prop
  const getSize = () => {
    switch (size) {
      case 'sm': return { button: 'p-1.5', icon: 16 };
      case 'lg': return { button: 'p-3', icon: 24 };
      default: return { button: 'p-2', icon: 20 };
    }
  };

  const { button, icon } = getSize();

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode]);
  // Initialize theme based on stored preferences
  useEffect(() => {
    // Listen for system preference changes
    const handleSystemThemeChange = (e) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('theme-preference')) {
        setIsDarkMode(e.matches);
      }
    };

    // Listen for theme changes from other components (like Profile page)
    const handleThemeChange = (e) => {
      setIsDarkMode(e.detail.isDark);
    };

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', handleSystemThemeChange);
    window.addEventListener('theme-changed', handleThemeChange);

    return () => {
      darkModeQuery.removeEventListener('change', handleSystemThemeChange);
      window.removeEventListener('theme-changed', handleThemeChange);
    };
  }, []);

  // Function to apply theme
  const applyTheme = (isDark) => {
    // Update HTML class for theme
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }

    // Force a re-render of the entire page to update all components
    document.body.style.transition = 'background-color 0.3s, color 0.3s';
    document.body.style.backgroundColor = 'var(--background)';
    document.body.style.color = 'var(--text-primary)';
  };
  // Toggle theme manually
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;

    // Store user preference in localStorage using both keys for compatibility
    localStorage.setItem('theme-preference', newMode ? 'dark' : 'light');
    localStorage.setItem('theme', newMode ? 'dark' : 'light');

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDark: newMode } }));

    // Update state
    setIsDarkMode(newMode);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`rounded-full ${button} ${className}`}
      style={{
        backgroundColor: 'var(--surface)',
        color: 'var(--text-primary)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      }}
    >
      {isDarkMode ? <Sun size={icon} /> : <Moon size={icon} />}
    </motion.button>
  );
};

export default ThemeToggle;