import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaCalendarAlt, FaEdit, FaKey, FaSignOutAlt, FaCreditCard, FaShieldAlt } from 'react-icons/fa';
import { FaSun, FaMoon } from 'react-icons/fa';
import { signOut } from '../firebase/auth';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    createdAt: '',
    lastSignInTime: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false); useEffect(() => {
    // If we have a current user, populate the user data
    if (currentUser) {
      setUserData({
        displayName: currentUser.displayName || 'No Name',
        email: currentUser.email || 'No Email',
        photoURL: currentUser.photoURL || 'https://via.placeholder.com/150',
        createdAt: currentUser.metadata?.creationTime
          ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
          : 'Unknown',
        lastSignInTime: currentUser.metadata?.lastSignInTime
          ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
          : 'Unknown',
        // Check if user is from Google auth
        isGoogleUser: currentUser.providerData?.some(provider => provider.providerId === 'google.com') || false
      });
      setEditedName(currentUser.displayName || '');
    }
  }, [currentUser]);
  // Dark mode toggle effect
  useEffect(() => {
    // Function to check and update theme state
    const updateThemeState = () => {
      const savedTheme = localStorage.getItem('theme') || localStorage.getItem('theme-preference');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

      if (shouldBeDark !== isDark) {
        setIsDark(shouldBeDark);
      }
    };

    // Initial check
    updateThemeState();

    // Listen for theme changes from navbar or other components
    const handleThemeChange = (e) => {
      setIsDark(e.detail.isDark);
    };

    // Listen for storage changes (in case theme is changed from another tab/window)
    const handleStorageChange = (e) => {
      if (e.key === 'theme' || e.key === 'theme-preference') {
        updateThemeState();
      }
    };

    window.addEventListener('theme-changed', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('theme-changed', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array since we only want to set up listeners once
  // Toggle theme function
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme-preference', 'dark');
      localStorage.setItem('theme', 'dark'); // Also set the navbar's theme key
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme-preference', 'light');
      localStorage.setItem('theme', 'light'); // Also set the navbar's theme key
    }

    // Dispatch an event so other components can react to the theme change
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDark: newIsDark } }));
  };

  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Loading profile...
          </h2>
          <div className="animate-spin h-12 w-12 mx-auto" style={{ color: 'var(--primary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async () => {
    if (!editedName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: editedName
      });

      setUserData({
        ...userData,
        displayName: editedName
      });

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error(error);
    }
  };  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Different validation for Google vs email users
    if (userData.isGoogleUser) {
      // Google users - only need new password and confirm
      if (!newPassword || !confirmPassword) {
        toast.error('Password is required');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      
      setPasswordLoading(true);
      
      try {
        // For Google users, set password directly (they're already authenticated)
        await updatePassword(auth.currentUser, newPassword);
        toast.success('Password created successfully');
      } catch (error) {
        console.error('Error setting password:', error);
        
        // Check for common errors with Google users
        if (error.code === 'auth/requires-recent-login') {
          toast.error('For security reasons, please logout and sign in again before creating a password');
        } else {
          toast.error('Failed to create password: ' + (error.message || 'Unknown error'));
        }
        setPasswordLoading(false);
        return;
      }
    } else {
      // Email users - require current password verification
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error('All fields are required');
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      if (newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }

      setPasswordLoading(true);

      try {
        // First, reauthenticate the user
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          currentPassword
        );

        await reauthenticateWithCredential(auth.currentUser, credential);      // Then update the password
        await updatePassword(auth.currentUser, newPassword);
        toast.success('Password updated successfully');
      } catch (error) {
        console.error('Error changing password:', error);
        if (error.code === 'auth/wrong-password') {
          toast.error('Current password is incorrect');
        } else {
          toast.error('Failed to update password: ' + (error.message || 'Unknown error'));
        }
      }
    }
      // Clear form and close modal (regardless of user type)
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(false);
    setPasswordLoading(false);
  };
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="flex flex-col lg:flex-row">
        {/* Left Side - Fixed Panel (40% on large screens) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-2/5 lg:h-screen lg:sticky lg:top-0 overflow-hidden"
        >
          <div className="h-full flex flex-col justify-center p-8 lg:p-12">
            <motion.div
              className="text-center mb-12"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.h1
                className="text-4xl font-bold mb-4"
                style={{ color: 'var(--text-primary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                My Profile
              </motion.h1>
            </motion.div>
            {/* Profile Picture with Enhanced Animated Gradient Border */}
            <motion.div
              className="relative mx-auto mb-8"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-40 h-40 mx-auto rounded-full relative">
                {/* More vibrant animated gradient border with rotation */}
                <motion.div
                  className="absolute inset-0 rounded-full z-0"
                  style={{
                    padding: '4px',
                    background: 'linear-gradient(45deg, var(--primary), #ff36f5, #4580ff, #f660ff, var(--primary))',
                    backgroundSize: '400% 400%',
                    filter: 'brightness(1.2) contrast(1.1)'
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                    rotate: [0, 360]
                  }}
                  transition={{
                    backgroundPosition: {
                      duration: 8,
                      ease: "linear",
                      repeat: Infinity
                    },
                    rotate: {
                      duration: 20,
                      ease: "linear",
                      repeat: Infinity
                    }
                  }}
                >
                  <div className="w-full h-full bg-black rounded-full"></div>
                </motion.div>

                <img
                  src={userData.photoURL}
                  alt="Profile"
                  className="absolute inset-0 w-full h-full object-cover rounded-full p-[6px] z-10"
                />

                {/* Semi-transparent edit overlay */}
                <motion.div
                  className="absolute inset-0 z-20 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 cursor-pointer"
                  style={{
                    background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)'
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 0 15px rgba(255,255,255,0.3)'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FaEdit size={30} color="white" />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* User Info */}
            <motion.div
              className="text-center space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {isEditing ? (
                <motion.div
                  className="mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--input-background)',
                      color: 'var(--text-primary)',
                      focusRing: 'var(--primary)'
                    }}
                  />
                </motion.div>
              ) : (
                <motion.h2
                  className="text-3xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {userData.displayName}
                </motion.h2>
              )}

              <motion.div
                className="flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
              >
                <FaEnvelope style={{ color: 'var(--text-secondary)' }} />
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                  {userData.email}
                </p>
              </motion.div>

              <div className="flex flex-col items-center space-y-2">
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                >
                  <FaCalendarAlt style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Member since: {userData.createdAt}
                  </p>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                >
                  <FaCalendarAlt style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Last sign in: {userData.lastSignInTime}
                  </p>
                </motion.div>
              </div>

              {/* Profile Action Buttons */}
              <motion.div
                className="mt-8 flex flex-wrap justify-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                {isEditing ? (
                  <>
                    <motion.button
                      className="px-5 py-2 rounded-full font-medium flex items-center"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--text-on-primary)'
                      }}
                      onClick={handleUpdateProfile}
                      disabled={isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                    <motion.button
                      className="px-5 py-2 rounded-full font-medium border flex items-center"
                      style={{
                        color: 'var(--text-primary)',
                        borderColor: 'var(--text-secondary)'
                      }}
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(userData.displayName);
                      }}
                      disabled={isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      className="px-5 py-2 rounded-full font-medium mr-3 flex items-center"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--text-on-primary)'
                      }}
                      onClick={() => setIsEditing(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaEdit className="mr-2" /> Edit Profile
                    </motion.button>
                    <motion.button
                      className="px-5 py-2 rounded-full font-medium border flex items-center"
                      style={{
                        color: 'var(--danger, #ff4d4d)',
                        borderColor: 'var(--danger, #ff4d4d)'
                      }}
                      onClick={handleSignOut}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaSignOutAlt className="mr-2" /> Sign Out
                    </motion.button>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Scrollable Content (60% on large screens) */}
        <motion.div
          className="w-full lg:w-3/5 p-6 lg:p-12 lg:overflow-y-auto"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Account Security Section */}
          <motion.div
            className="bg-opacity-60 rounded-xl p-6 shadow-lg mb-8"
            style={{ backgroundColor: 'var(--surface)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.h3
              className="text-2xl font-bold mb-6 flex items-center"
              style={{ color: 'var(--text-primary)' }}
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <FaShieldAlt className="mr-3" /> Account Security
            </motion.h3>

            <div className="space-y-5">              <motion.div
                className="flex justify-between items-center p-4 rounded-lg"
                style={{ backgroundColor: 'var(--background)' }}
                transition={{ duration: 0.2 }}
              >
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Password</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {userData.isGoogleUser
                      ? 'Set password to enable email login'
                      : 'Last changed: Never'}
                  </p>
                </div>
                <motion.button
                  className="px-4 py-2 text-sm rounded-full"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--text-on-primary)'
                  }}
                  onClick={() => setShowPasswordModal(true)}
                  whileTap={{ scale: 0.95 }}
                >
                  {userData.isGoogleUser ? 'Create' : 'Update'}
                </motion.button>
              </motion.div>
              <motion.div
                className="flex justify-between items-center p-4 rounded-lg"
                style={{ backgroundColor: 'var(--background)' }}
                transition={{ duration: 0.2 }}
              >
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Two-factor Authentication</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Current status: Not enabled</p>
                </div>
                <motion.button
                  className="px-4 py-2 text-sm rounded-full"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--text-on-primary)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Enable
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* Account Settings Section */}
          <motion.div
            className="bg-opacity-60 rounded-xl p-6 shadow-lg mb-8"
            style={{ backgroundColor: 'var(--surface)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.h3
              className="text-2xl font-bold mb-6"
              style={{ color: 'var(--text-primary)' }}
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              Account Settings
            </motion.h3>

            <div className="space-y-5">
              <div
                className="flex justify-between items-center pb-4 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <div>
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Email Notifications</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Receive email alerts for account activities</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div
                className="flex justify-between items-center pb-4 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <div>
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Dark Mode</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Switch between light and dark themes</p>
                </div><label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isDark}
                    onChange={toggleTheme}
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                  </div>
                </label>
              </div>
              <div
                className="flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold text-red-500">Delete Account</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Permanently remove your account and data</p>
                </div>
                <motion.button
                  className="px-4 py-2 text-sm rounded-full bg-red-600 text-white"
                  whileHover={{ backgroundColor: '#ff3333' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Activity History Section */}
          <motion.div
            className="bg-opacity-60 rounded-xl p-6 shadow-lg"
            style={{ backgroundColor: 'var(--surface)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.h3
              className="text-2xl font-bold mb-6"
              style={{ color: 'var(--text-primary)' }}
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              Recent Activity
            </motion.h3>
            <div
              className="space-y-3 min-h-[100px] flex items-center justify-center"
            >
              <motion.p
                className="text-sm italic text-center py-3"
                style={{ color: 'var(--text-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                No recent activities to show
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-opacity-90 rounded-xl p-6 shadow-xl w-full max-w-md"
            style={{ backgroundColor: 'var(--surface)' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
          >            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
                <FaKey className="mr-2" /> {userData.isGoogleUser ? 'Create Password' : 'Change Password'}
              </h3>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowPasswordModal(false)}
              >
                &times;
              </motion.button>
            </div>            <form onSubmit={handleChangePassword} className="space-y-4">
              {!userData.isGoogleUser && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--input-background)',
                      color: 'var(--text-primary)',
                    }}
                    required={!userData.isGoogleUser}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--input-background)',
                    color: 'var(--text-primary)',
                  }}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--input-background)',
                    color: 'var(--text-primary)',
                  }}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <motion.button
                  type="button"
                  className="px-4 py-2 rounded-full border"
                  style={{
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border)',
                  }}
                  onClick={() => setShowPasswordModal(false)}
                  whileTap={{ scale: 0.95 }}
                  disabled={passwordLoading}
                >
                  Cancel
                </motion.button>                <motion.button
                  type="submit"
                  className="px-4 py-2 rounded-full font-medium"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--text-on-primary)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : (userData.isGoogleUser ? 'Create Password' : 'Update Password')}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
