import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaCalendarAlt, FaEdit, FaKey, FaSignOutAlt, FaShieldAlt, FaCamera, FaMoneyBillWave, FaClipboardList, FaSync } from 'react-icons/fa';
import { FaSun, FaMoon } from 'react-icons/fa';
import { signOut } from '../firebase/auth';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getDashboardData } from '../firebase/kitties';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    createdAt: '',
    lastSignInTime: '',
    isGoogleUser: false,
    isEmailUser: false,
    isEmailLinkUser: false,
    passwordLastChanged: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef(null);

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Add state for user's recent expenses
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Add state for PWA installation
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isPWAInstallable, setIsPWAInstallable] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);

  // Fetch user data function - made reusable with useCallback
  const fetchUserData = useCallback(async () => {
    if (!currentUser) {
      setProfileLoading(false);
      return;
    }

    try {
      setProfileLoading(true);
      
      // Check login providers
      const isGoogleUser = currentUser.providerData?.some(provider => provider.providerId === 'google.com') || false;
      const isEmailUser = currentUser.providerData?.some(provider => provider.providerId === 'password') || false;
      const isEmailLinkUser = currentUser.providerData?.some(provider => provider.providerId === 'emailLink') || false;
      
      // We'll get user metadata from Firestore in a production app
      // For now, we'll simulate password last changed date
      const passwordLastChanged = localStorage.getItem(`password_last_changed_${currentUser.uid}`) 
        ? new Date(localStorage.getItem(`password_last_changed_${currentUser.uid}`)).toLocaleDateString()
        : null;

      // First try to get user data from Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let photoURL = '/default.png';
      let displayName = currentUser.displayName || (userDoc.exists() ? userDoc.data().displayName : null) || '';
      
      // If we have a photoURL in Firestore, use it
      if (userDoc.exists() && userDoc.data().photoURL) {
        photoURL = userDoc.data().photoURL;
      }
      // If user has a Google profile picture and no custom picture yet, use the Google one
      else if (isGoogleUser && currentUser.providerData) {
        // Find the Google provider data
        const googleProvider = currentUser.providerData.find(
          provider => provider.providerId === 'google.com'
        );
        
        if (googleProvider && googleProvider.photoURL) {
          photoURL = googleProvider.photoURL;
          
          // Also save the Google profile picture to Firestore for future use
          if (userDoc.exists()) {
            await updateDoc(userDocRef, {
              photoURL: googleProvider.photoURL,
              lastUpdated: new Date()
            });
          } else {
            await setDoc(userDocRef, {
              photoURL: googleProvider.photoURL,
              displayName: displayName || googleProvider.displayName || 'No Name',
              email: currentUser.email,
              lastUpdated: new Date()
            });
          }
        }
      }
      // Otherwise fall back to Firebase Auth photoURL or default.png
      else if (currentUser.photoURL && !currentUser.photoURL.startsWith('user_photo:')) {
        photoURL = currentUser.photoURL;
      }
      
      // Set user data with the determined photoURL
      setUserData({
        displayName: displayName || 'No Name',
        email: currentUser.email || 'No Email',
        photoURL: photoURL,
        createdAt: currentUser.metadata?.creationTime
          ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
          : 'Unknown',
        lastSignInTime: currentUser.metadata?.lastSignInTime
          ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
          : 'Unknown',
        isGoogleUser, 
        isEmailUser,
        isEmailLinkUser,
        passwordLastChanged
      });
      
      setEditedName(displayName || '');
      setProfileLoading(false);
      
      // If the name is missing but we're within retry attempts, try again in a moment
      // This helps after signup when Firebase might not have propagated the displayName yet
      if (!displayName && retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchUserData();
        }, 1500); // Wait 1.5 seconds before retrying
      }
      
    } catch (error) {
      console.error("Error fetching user data:", error);
      
      // Fallback to basic Auth data if Firestore fetch fails
      setUserData({
        displayName: currentUser.displayName || 'No Name',
        email: currentUser.email || 'No Email',
        photoURL: currentUser.photoURL || '/default.png',
        createdAt: currentUser.metadata?.creationTime
          ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
          : 'Unknown',
        lastSignInTime: currentUser.metadata?.lastSignInTime
          ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
          : 'Unknown',
        isGoogleUser: currentUser.providerData?.some(provider => provider.providerId === 'google.com') || false, 
        isEmailUser: currentUser.providerData?.some(provider => provider.providerId === 'password') || false,
        isEmailLinkUser: currentUser.providerData?.some(provider => provider.providerId === 'emailLink') || false,
        passwordLastChanged
      });
      
      setEditedName(currentUser.displayName || '');
      setProfileLoading(false);
    }
  }, [currentUser, retryCount]);

  useEffect(() => {
    fetchUserData();
    
    // Fetch user's recent activity
    const fetchUserActivity = async () => {
      if (!currentUser) return;
      
      try {
        setActivityLoading(true);
        const dashboardData = await getDashboardData(currentUser.uid);
        setRecentActivity(dashboardData.recentExpenses || []);
      } catch (error) {
        console.error("Error fetching user activity:", error);
      } finally {
        setActivityLoading(false);
      }
    };
    
    fetchUserActivity();
  }, [currentUser, fetchUserData]);
  
  // Function to manually refresh profile data
  const handleRefreshProfile = () => {
    setRetryCount(0); // Reset retry count
    fetchUserData();
  };

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

  // Add effect for PWA installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      console.log('🔧 beforeinstallprompt event fired!');
      setInstallPrompt(e);
      setIsPWAInstallable(true);
    };
    
    const handleAppInstalled = () => {
      console.log('🎉 App was installed!');
      setIsPWAInstalled(true);
      setIsPWAInstallable(false);
      localStorage.setItem('pwa_installed', 'true');
    };
    
    // Check if app is actually installed in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true; // For iOS
    
    if (isStandalone) {
      console.log('📱 App already in standalone mode');
      setIsPWAInstalled(true);
      setIsPWAInstallable(false);
      localStorage.setItem('pwa_installed', 'true');
    } else {
      // Only if not in standalone mode, check localStorage
      const isStorageInstalled = localStorage.getItem('pwa_installed') === 'true';
      
      if (isStorageInstalled) {
        console.log('⚠️ Storage says installed but not in standalone mode, correcting...');
        // If storage says installed but we're not in standalone mode, correct it
        localStorage.removeItem('pwa_installed');
        setIsPWAInstalled(false);
        // Show the install option regardless of prompt availability
        setIsPWAInstallable(true);
      } else {
        // Not installed according to any method
        console.log('📲 App not installed, showing manual install option');
        setIsPWAInstalled(false);
        // Show the install option regardless of prompt availability
        setIsPWAInstallable(true);
      }
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  
  // Add installation handler
  const handleInstallApp = async () => {
    console.log('📲 Install button clicked!', { installPrompt });
    
    if (installPrompt) {
      // Show the installation prompt
      installPrompt.prompt();
      
      // Wait for the user to respond
      const { outcome } = await installPrompt.userChoice;
      console.log(`👤 User choice: ${outcome}`);
      
      if (outcome === 'accepted') {
        setIsPWAInstalled(true);
        localStorage.setItem('pwa_installed', 'true');
      }
      
      // We can only use the prompt once, need to reset for next time
      setInstallPrompt(null);
    } else {
      // If no install prompt is available (iOS or manual installation needed)
      console.log('⚠️ No install prompt available, showing manual instructions');
      alert(
        "To install this app on your device:\n\n" +
        "• On iOS: tap the Share icon (rectangle with arrow) and select 'Add to Home Screen'\n\n" +
        "• On Android: open browser menu and select 'Install App' or 'Add to Home Screen'"
      );
    }
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
    if (!userData.isEmailUser) {
      // First time setting a password - no current password needed
      if (!newPassword) {
        toast.error('New password is required');
        return;
      }

      if (!confirmPassword) {
        toast.error('Password confirmation is required');
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
        // Set password directly (they're already authenticated)
        await updatePassword(auth.currentUser, newPassword);

        // Save the password change date
        localStorage.setItem(`password_last_changed_${currentUser.uid}`, new Date().toISOString());

        // Update local state
        setUserData({
          ...userData,
          passwordLastChanged: new Date().toLocaleDateString(),
          isEmailUser: true // User now has email+password auth too
        });

        toast.success('Password created successfully');
      } catch (error) {
        console.error('Error setting password:', error);

        // Check for common errors
        if (error.code === 'auth/requires-recent-login') {
          toast.error('For security reasons, please logout and sign in again before creating a password');
        } else {
          toast.error('Failed to create password: ' + (error.message || 'Unknown error'));
        }
        setPasswordLoading(false);
        return;
      }
    } else {
      // Updating existing password - require current password verification
      if (!currentPassword) {
        toast.error('Current password is required');
        return;
      }

      if (!newPassword) {
        toast.error('New password is required');
        return;
      }

      if (!confirmPassword) {
        toast.error('Password confirmation is required');
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

        await reauthenticateWithCredential(auth.currentUser, credential);

        // Then update the password
        await updatePassword(auth.currentUser, newPassword);

        // Save the password change date
        localStorage.setItem(`password_last_changed_${currentUser.uid}`, new Date().toISOString());

        // Update local state
        setUserData({
          ...userData,
          passwordLastChanged: new Date().toLocaleDateString()
        });

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

  // Handle profile picture upload using base64 encoding and Firestore
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (limit to 1MB for base64 storage)
    if (file.size > 1 * 1024 * 1024) {
      toast.error('Image must be smaller than 1MB when using Firestore storage');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Create a unique identifier for this upload to use in toast messages
    const toastId = 'upload-toast-' + Date.now();
    toast.loading('Processing image...', { id: toastId });

    try {
      // Read the file as a data URL (base64)
      const reader = new FileReader();

      reader.onloadstart = () => {
        setUploadProgress(10);
      };

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 50; // First 50% is reading the file
          setUploadProgress(progress);
          toast.loading(`Processing image: ${Math.round(progress)}%`, { id: toastId });
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read the image file', { id: toastId });
        setIsUploading(false);
      };

      reader.onload = async () => {
        try {
          const base64Image = reader.result;
          setUploadProgress(60);
          toast.loading('Uploading to database...', { id: toastId });

          // Generate a unique photo identifier for this user
          const photoId = `profile_${currentUser.uid}_${Date.now()}`;

          // Store the actual image data in Firestore first
          const userDocRef = doc(db, "users", currentUser.uid);

          // Get existing user doc or create new one
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            await updateDoc(userDocRef, {
              photoURL: base64Image,
              photoId: photoId,
              lastUpdated: new Date()
            });
          } else {
            await setDoc(userDocRef, {
              photoURL: base64Image,
              photoId: photoId,
              displayName: currentUser.displayName || 'No Name',
              email: currentUser.email,
              lastUpdated: new Date()
            });
          }

          setUploadProgress(90);

          // Then update Auth profile with a reference marker
          await updateProfile(auth.currentUser, {
            photoURL: `user_photo:${photoId}` // Just a reference marker
          });

          // Update local state with the actual image data
          setUserData({
            ...userData,
            photoURL: base64Image
          });

          setUploadProgress(100);
          toast.success('Profile picture updated successfully!', { id: toastId });
        } catch (error) {
          console.error('Error updating profile with new image:', error);
          toast.error('Failed to update profile: ' + (error.message || 'Unknown error'), { id: toastId });
        } finally {
          setIsUploading(false);
        }
      };

      // Start reading the file
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error handling file upload:', error);
      toast.error('Failed to process image: ' + (error.message || 'Unknown error'), { id: toastId });
      setIsUploading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    const date = dateValue.seconds 
      ? new Date(dateValue.seconds * 1000) 
      : new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'N/A';
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format: Today/Yesterday at HH:MM or MM/DD/YYYY
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Helper function to format category name
  const formatCategoryName = (category) => {
    if (!category) return 'Uncategorized';
    
    // Add emoji based on category
    let emoji = '';
    switch (category) {
      case 'food': emoji = '🍔 '; break;
      case 'groceries': emoji = '🛒 '; break;
      case 'transport': emoji = '🚗 '; break;
      case 'accommodation': emoji = '🏠 '; break;
      case 'entertainment': emoji = '🎭 '; break;
      case 'shopping': emoji = '🛍️ '; break;
      case 'utilities': emoji = '💡 '; break;
      case 'medical': emoji = '🏥 '; break;
      case 'travel': emoji = '✈️ '; break;
      case 'other': emoji = '📦 '; break;
      default: emoji = '📝 ';
    }
    
    // Convert to title case (first letter capitalized)
    const formattedName = category.charAt(0).toUpperCase() + category.slice(1);
    return emoji + formattedName;
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
              
              {/* Profile refresh button */}
              {userData.displayName === 'No Name' && (
                <motion.button
                  className="flex items-center mx-auto mt-2 text-sm px-3 py-1 rounded-full"
                  style={{ 
                    backgroundColor: 'var(--primary-light)', 
                    color: 'var(--primary)' 
                  }}
                  onClick={handleRefreshProfile}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaSync className="mr-1" size={14} /> Refresh Profile
                </motion.button>
              )}
            </motion.div>
            
            {/* Profile loading indicator */}
            {profileLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
              </div>
            ) : (
              <>
                {/* Profile Picture with Enhanced Animated Gradient Border */}
                <motion.div
                  className="relative mx-auto mb-8"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

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
                      src={userData.photoURL || null}
                      alt="Profile"
                      className="absolute inset-0 w-full h-full object-cover rounded-full p-[6px] z-10"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default.png';
                      }}
                    />

                    {/* Visible edit overlay on both mobile and desktop */}
                    <motion.div
                      className={`absolute inset-0 z-20 flex items-center justify-center rounded-full cursor-pointer backdrop-blur-sm ${isUploading ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                      style={{
                        background: 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)',
                        transition: 'opacity 0.2s ease-in-out'
                      }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: '0 0 15px rgba(255,255,255,0.3)'
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {isUploading ? (
                        <div className="text-center text-white">
                          <div className="font-medium mb-2">Uploading...</div>
                          <div className="text-white text-lg font-medium mb-1">{Math.round(uploadProgress)}%</div>
                          <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="flex flex-col items-center"
                          >
                            <FaCamera size={30} color="white" className="mb-1" />
                            <span className="text-white text-xs font-medium">Change Photo</span>
                          </motion.div>
                        </div>
                      )}
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
              </>
            )}
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
                    {userData.isEmailUser 
                      ? `Last changed: ${userData.passwordLastChanged || 'Unknown'}`
                      : 'Set password to enable email login'}
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
                  {userData.isEmailUser ? 'Update' : 'Create'}
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
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Dark Mode</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Switch between light and dark themes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
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
            className="bg-opacity-60 rounded-xl p-6 shadow-lg mb-8"
            style={{ backgroundColor: 'var(--surface)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.h3
              className="text-2xl font-bold mb-6 flex items-center"
              style={{ color: 'var(--text-primary)' }}
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <FaClipboardList className="mr-3" /> Recent Activity
            </motion.h3>
            
            {activityLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {recentActivity.map((expense, idx) => {
                  const date = expense.createdAt ? 
                    new Date(expense.createdAt.seconds ? expense.createdAt.seconds * 1000 : expense.createdAt) : 
                    null;
                  
                  return (
                    <div key={idx} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-[var(--background)] transition-colors">
                      <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                        <span className="text-[var(--primary)]">
                          <FaMoneyBillWave />
                        </span>
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{expense.description}</p>
                                                          <p className="text-xs text-[var(--text-secondary)]">
                              {formatCategoryName(expense.category || 'uncategorized')} • {expense.kittyName}
                              {expense.paidBy && expense.paidBy !== "You" && expense.paidById !== currentUser.uid && 
                                ` • Paid by ${expense.paidBy}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{expense.currency || '₹'}{expense.amount.toFixed(2)}</p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {date ? formatDate(date) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        {expense.notes && (
                          <p className="text-sm mt-2 text-[var(--text-secondary)] bg-[var(--background)] p-2 rounded">
                            {expense.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[var(--background)] p-6 rounded-lg text-center">
                <p className="text-[var(--text-secondary)]">No activity recorded yet</p>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Your recent expenses will appear here once you start adding them to your kitties
                </p>
              </div>
            )}
          </motion.div>

          {/* Add PWA Installation section */}
          {isPWAInstallable && !isPWAInstalled && (
            <motion.div 
              className="rounded-lg shadow-md p-4 mb-6 mt-8"
              style={{ backgroundColor: 'var(--surface)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="flex items-center gap-3 mb-3 md:mb-0">
                  <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--primary-light, rgba(239, 71, 111, 0.1))' }}>
                    <svg className="w-6 h-6" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Install KittyPay App</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Install our app for a better experience, offline access, and faster loading</p>
                  </div>
                </div>
                <motion.button
                  onClick={handleInstallApp}
                  className="px-4 py-2 text-white rounded-md transition-colors"
                  style={{ backgroundColor: 'var(--primary)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Install Now
                </motion.button>
              </div>
            </motion.div>
          )}
          
          {isPWAInstalled && (
            <motion.div 
              className="border rounded-lg p-4 mb-6 mt-8"
              style={{ 
                backgroundColor: 'var(--success-light, rgba(6, 214, 160, 0.1))', 
                borderColor: 'var(--success, #06D6A0)',
                color: 'var(--text-primary)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--success, #06D6A0)', opacity: 0.2 }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--success, #06D6A0)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>KittyPay App Installed</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>You've successfully installed our app and can access it from your home screen</p>
                </div>
              </div>
            </motion.div>
          )}
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
                <FaKey className="mr-2" /> {userData.isEmailUser ? 'Update Password' : 'Create Password'}
              </h3>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowPasswordModal(false)}
              >
                &times;
              </motion.button>
            </div>            <form onSubmit={handleChangePassword} className="space-y-4">
              {userData.isEmailUser && (
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
                    required={userData.isEmailUser}
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
                  {passwordLoading ? 'Updating...' : (userData.isEmailUser ? 'Update Password' : 'Create Password')}
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