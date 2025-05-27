import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaEye, FaEyeSlash, FaAt, FaGithub, FaEnvelope, FaArrowRight } from 'react-icons/fa';
import { signInWithEmail, signInWithGoogle, sendSignInLink } from '../firebase/auth';
import { toast } from 'react-hot-toast';
import { trackUserLogin } from "../firebase/analytics";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [showMagicLinkInput, setShowMagicLinkInput] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {      
      const { user, error } = await signInWithEmail(formData.email, formData.password);
      if (error) {
        setError(error.message || 'Failed to sign in');
        toast.error(error.message || 'Failed to sign in');
        setIsLoading(false);
        return;
      }
      
      // Track login event
      trackUserLogin('email');
      
      // Success - navigate to profile
      toast.success('Login successful! Welcome back!');
      navigate('/profile');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
      setIsLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {      
      const { user, error } = await signInWithGoogle();
      
      if (error) {
        setError(error.message || 'Failed to sign in with Google');
        toast.error(error.message || 'Failed to sign in with Google');
        setIsLoading(false);
        return;
      }
      
      // Track login event
      trackUserLogin('google');
        
      // Success - navigate to profile
      toast.success('Login successful! Welcome back!');
      navigate('/profile');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleMagicLinkChange = (e) => {
    setMagicLinkEmail(e.target.value);
  };  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Let the auth function handle the redirect URL based on configuration
      const { success, error } = await sendSignInLink(magicLinkEmail);
      
      if (error) {
        setError(error.message || 'Failed to send magic link');
        toast.error(error.message || 'Failed to send magic link');
        setIsLoading(false);
        return;
      }
      
      // Track magic link request
      trackUserLogin('magic_link_request');
      
      // Show success message
      toast.success('Magic link sent! Check your email.');
      setMagicLinkSent(true);
      setIsLoading(false);
    } catch (err) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: 'var(--background)',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M14 16H9v-2h5V9.87a4 4 0 1 1 2 0V14h5v2h-5v15.95A10 10 0 0 0 23.66 27l-3.46-2 8.2-2.2-2.9 5a12 12 0 0 1-21 0l-2.89-5 8.2 2.2-3.47 2A10 10 0 0 0 14 31.95V16zm40 40h-5v-2h5v-4.13a4 4 0 1 1 2 0V54h5v2h-5v15.95A10 10 0 0 0 63.66 67l-3.47-2 8.2-2.2-2.88 5a12 12 0 0 1-21.02 0l-2.88-5 8.2 2.2-3.47 2A10 10 0 0 0 54 71.95V56zm-39 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm40-40a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM15 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm40 40a2 2 0 1 0 0-4 2 2 0 0 0 0 4z\' fill=\'%239C92AC\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
      }}
    >
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-purple-100/30 to-transparent"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl"
      >
        {/* Horizontal rectangle card with two sections */}
        <div className="bg-[var(--surface)] rounded-[24px] shadow-lg overflow-hidden relative z-0 flex flex-col md:flex-row">

          {/* Left section - Login form */}
          <div className="w-full md:w-1/2 px-8 py-12">
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-[var(--primary-light)] p-2 inline-flex mr-3">
                  <img src="/logo.svg" alt="KittyPay Logo" className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  KittyPay
                </h2>
              </div>

              <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                Welcome Back!
              </h1>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Sign in to access your purr-sonal account
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700">
                {error}
              </div>
            )}

            {showMagicLinkInput ? (
              <div>
                {magicLinkSent ? (
                  <div className="p-4 mb-4 bg-green-100 text-green-700 rounded-xl">
                    <p className="font-medium">Magic link sent!</p>
                    <p className="text-sm mt-1">Check your email and click the link to sign in.</p>
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleSendMagicLink}>
                    <div>
                      <label htmlFor="magic-link-email" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaAt size={18} style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <input
                          id="magic-link-email"
                          type="email"
                          required
                          value={magicLinkEmail}
                          onChange={handleMagicLinkChange}
                          className="appearance-none relative block w-full px-3 py-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:z-10 text-sm transition-all"
                          style={{
                            backgroundColor: 'var(--input-background)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-sm)',
                          }}
                          placeholder="your-email@example.com"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`group relative w-full flex justify-center py-3 px-4 rounded-xl text-sm font-medium transition duration-150 ease-in-out ${isLoading ? 'opacity-80' : 'hover:opacity-90'}`}
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        boxShadow: 'var(--shadow-md)'
                      }}
                    >
                      {isLoading && (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isLoading ? 'Sending...' : 'Send Magic Link'}
                    </button>
                    <div className="text-center">
                      <button 
                        type="button" 
                        onClick={() => setShowMagicLinkInput(false)}
                        className="text-sm hover:underline"
                        style={{ color: 'var(--primary)' }}
                      >
                        Back to login
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <div className="mb-5">
                    <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaAt size={18} style={{ color: 'var(--text-secondary)' }} />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="appearance-none relative block w-full px-3 py-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:z-10 text-sm transition-all"
                        style={{
                          backgroundColor: 'var(--input-background)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                        placeholder="your-email@example.com"
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock size={18} style={{ color: 'var(--text-secondary)' }} />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="appearance-none relative block w-full px-3 py-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:z-10 text-sm transition-all"
                        style={{
                          backgroundColor: 'var(--input-background)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                        placeholder="Enter your password"
                      />
                      <div
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ?
                          <FaEyeSlash size={18} style={{ color: 'var(--text-secondary)' }} /> :
                          <FaEye size={18} style={{ color: 'var(--text-secondary)' }} />
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 border-gray-300 rounded"
                      style={{
                        color: 'var(--primary)',
                        borderColor: 'var(--border)'
                      }}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`group relative w-full flex justify-center py-3 px-4 rounded-xl text-sm font-medium transition duration-150 ease-in-out ${isLoading ? 'opacity-80' : 'hover:opacity-90'}`}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    {isLoading && (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
            )}

            <div className="text-center mt-6">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                  Sign up now
                </Link>
              </p>
            </div>
          </div>

          {/* Right section - Illustrations and alternative login methods */}
          <div className="w-full md:w-1/2 bg-[var(--primary-light)] p-12 flex flex-col justify-center items-center relative md:flex">
            <div className="absolute bottom-8 left-8 opacity-30" style={{ transform: 'rotate(15deg)' }}>
              <img src="/logo.svg" alt="KittyPay Logo" className="w-6 h-6" />
            </div>

            <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--primary)' }}>
              Other ways to sign in
            </h3>

            {/* Alternative login buttons */}
            <div className="space-y-4 w-full max-w-xs">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-between px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
                style={{
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                  </svg>
                  <span>Continue with Google</span>
                </div>
                <FaArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => setShowMagicLinkInput(true)}
                className="w-full flex items-center justify-between px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
                style={{
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div className="flex items-center">
                  <FaEnvelope size={20} className="mr-3" />
                  <span>Continue with Magic Link</span>
                </div>
                <FaArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;