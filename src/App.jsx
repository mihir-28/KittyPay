import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import RouteTracker from "./components/common/RouteTracker";
import PWAInstallPrompt from "./components/common/PWAInstallPrompt";
import { Toaster } from 'react-hot-toast';

// Import your pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Terms from "./pages/Terms";
import Policy from "./pages/Policy";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Kitties from "./pages/Kitties";
import Dashboard from "./pages/Dashboard";
import Roadmap from "./pages/Roadmap";
import EmailLinkHandler from "./components/EmailLinkHandler";
import Layout from "./layouts/MainLayout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <RouteTracker />
        <PWAInstallPrompt />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)'
            },
            success: {
              iconTheme: {
                primary: 'var(--success, #4caf50)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--danger, #ff4d4d)',
                secondary: 'white',
              },
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/terms-of-use" element={<Terms />} />
            <Route path="/privacy-policy" element={<Policy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/roadmap" element={<Roadmap />} />
            
            {/* Auth routes - redirect to profile if already logged in */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute redirectTo="/profile">
                  <Login />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/signup" 
              element={
                <ProtectedRoute redirectTo="/profile">
                  <Signup />
                </ProtectedRoute>
              } 
            />
            
            {/* Email link handler */}
            <Route path="/email-signin" element={<EmailLinkHandler />} />
            
            {/* Protected routes - require authentication */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requireAuth redirectTo="/login">
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/kitties" 
              element={
                <ProtectedRoute requireAuth redirectTo="/login">
                  <Kitties />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireAuth redirectTo="/login">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Add more protected routes as needed */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;