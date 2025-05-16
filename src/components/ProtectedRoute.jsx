import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Route component that redirects based on authentication state
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if conditions are met
 * @param {boolean} props.requireAuth - Whether the route requires authentication
 * @param {string} props.redirectTo - Where to redirect if conditions aren't met
 */
const ProtectedRoute = ({ children, requireAuth = false, redirectTo = "/" }) => {
  const { isAuthenticated, loading } = useAuth();

  // If auth is still being checked, show nothing or a loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <svg className="animate-spin h-12 w-12 text-[var(--primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // For pages that require auth (dashboard, profile, etc.)
  if (requireAuth) {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  }
  
  // For auth pages (login/signup) - redirect away if already logged in
  return isAuthenticated ? <Navigate to={redirectTo} replace /> : children;
};

export default ProtectedRoute;