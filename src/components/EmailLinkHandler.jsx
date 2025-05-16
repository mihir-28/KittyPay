import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeSignInWithEmailLink } from '../firebase/auth';

/**
 * Component to handle email link sign-in flow
 * Place this in your app routing to handle the callback URL
 */
const EmailLinkHandler = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [needsEmail, setNeedsEmail] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailLink = async () => {
      const result = await completeSignInWithEmailLink();
      
      if (result.user) {
        // Successfully signed in
        navigate('/dashboard'); // Redirect to dashboard or home
      } else if (result.promptForEmail) {
        // Need email from user
        setNeedsEmail(true);
        setLoading(false);
      } else if (result.error) {
        // Error occurred
        setError(result.error.message);
        setLoading(false);
      }
    };
    
    handleEmailLink();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await completeSignInWithEmailLink(email);
    
    if (result.user) {
      navigate('/dashboard'); // Redirect to dashboard or home
    } else if (result.error) {
      setError(result.error.message);
      setLoading(false);
    }
  };

  if (loading && !needsEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background)' }}>
        <div className="w-full max-w-md bg-[var(--surface)] p-8 rounded-[24px] shadow-lg">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 mx-auto text-[var(--primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Completing sign in...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md bg-[var(--surface)] p-8 rounded-[24px] shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Almost there!</h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Please enter your email to complete the sign in process</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:z-10 text-sm transition-all"
              style={{
                backgroundColor: 'var(--input-background)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
              placeholder="your-email@example.com"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            Complete Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailLinkHandler;