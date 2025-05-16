import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaCalendarAlt, FaEdit, FaKey, FaSignOutAlt, FaCreditCard, FaShieldAlt } from 'react-icons/fa';
import { signOut } from '../firebase/auth';
import { updateProfile } from 'firebase/auth'; 
import { auth } from '../firebase/config';
import { toast } from 'react-hot-toast';

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

  useEffect(() => {
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
          : 'Unknown'
      });
      setEditedName(currentUser.displayName || '');
    }
  }, [currentUser]);

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
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
          My Profile
        </h1>
        
        <div className="bg-opacity-60 rounded-lg p-6 shadow-lg" style={{ backgroundColor: 'var(--surface)' }}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* User avatar */}
            <div className="flex-shrink-0 relative group">
              <img 
                src={userData.photoURL} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4"
                style={{ borderColor: 'var(--primary)' }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <FaEdit size={24} color="white" />
              </div>
            </div>
            
            {/* User info */}
            <div className="flex-grow">
              {isEditing ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--input-background)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              ) : (
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {userData.displayName}
                </h2>
              )}
              
              <div className="flex items-center mt-2">
                <FaEnvelope className="mr-2" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                  {userData.email}
                </p>
              </div>
              
              <div className="flex items-center mt-2">
                <FaCalendarAlt className="mr-2" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Member since: {userData.createdAt}
                </p>
              </div>
              
              <div className="flex items-center mt-1">
                <FaCalendarAlt className="mr-2" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Last sign in: {userData.lastSignInTime}
                </p>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3">
                {isEditing ? (
                  <>
                    <button 
                      className="px-4 py-2 rounded font-medium flex items-center"
                      style={{ 
                        backgroundColor: 'var(--primary)',
                        color: 'var(--text-on-primary)'
                      }}
                      onClick={handleUpdateProfile}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      className="px-4 py-2 rounded font-medium border flex items-center"
                      style={{ 
                        color: 'var(--text-primary)',
                        borderColor: 'var(--text-secondary)'
                      }}
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(userData.displayName);
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="px-4 py-2 rounded font-medium mr-3 flex items-center"
                      style={{ 
                        backgroundColor: 'var(--primary)',
                        color: 'var(--text-on-primary)'
                      }}
                      onClick={() => setIsEditing(true)}
                    >
                      <FaEdit className="mr-2" /> Edit Profile
                    </button>
                    <button 
                      className="px-4 py-2 rounded font-medium border flex items-center"
                      style={{ 
                        color: 'var(--text-primary)',
                        borderColor: 'var(--text-secondary)'
                      }}
                    >
                      <FaKey className="mr-2" /> Change Password
                    </button>
                    <button 
                      className="px-4 py-2 rounded font-medium border flex items-center"
                      style={{ 
                        color: 'var(--danger, #ff4d4d)',
                        borderColor: 'var(--danger, #ff4d4d)'
                      }}
                      onClick={handleSignOut}
                    >
                      <FaSignOutAlt className="mr-2" /> Sign Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Account Security Section */}
        <div className="mt-8 bg-opacity-60 rounded-lg p-6 shadow-lg" style={{ backgroundColor: 'var(--surface)' }}>
          <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
            <FaShieldAlt className="mr-2" /> Account Security
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'var(--background)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Password</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Last changed: Never</p>
              </div>
              <button 
                className="px-3 py-1 text-sm rounded"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-on-primary)'
                }}
              >
                Update
              </button>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'var(--background)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Two-factor Authentication</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Current status: Not enabled</p>
              </div>
              <button 
                className="px-3 py-1 text-sm rounded"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-on-primary)'
                }}
              >
                Enable
              </button>
            </div>
          </div>
        </div>
        
        {/* Payment Methods Section */}
        <div className="mt-8 bg-opacity-60 rounded-lg p-6 shadow-lg" style={{ backgroundColor: 'var(--surface)' }}>
          <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
            <FaCreditCard className="mr-2" /> Payment Methods
          </h3>
          
          <div className="space-y-4">
            <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center" style={{ borderColor: 'var(--border)' }}>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>No payment methods added yet</p>
              <button 
                className="px-4 py-2 rounded font-medium mt-2"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-on-primary)'
                }}
              >
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
        
        {/* Account Settings Section */}
        <div className="mt-8 bg-opacity-60 rounded-lg p-6 shadow-lg" style={{ backgroundColor: 'var(--surface)' }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Account Settings
          </h3>
          
          <div className="space-y-4">
            {/* Setting items */}
            <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Email Notifications</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Receive email alerts for account activities</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Dark Mode</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Switch between light and dark themes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-red-500">Delete Account</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Permanently remove your account and data</p>
              </div>
              <button 
                className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        
        {/* Activity History Section */}
        <div className="mt-8 bg-opacity-60 rounded-lg p-6 shadow-lg" style={{ backgroundColor: 'var(--surface)' }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Recent Activity
          </h3>
          
          <div className="space-y-3">
            <p className="text-sm italic text-center py-3" style={{ color: 'var(--text-secondary)' }}>
              No recent activities to show
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
