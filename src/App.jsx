import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";

// Import your pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Terms from "./pages/Terms";
import Policy from "./pages/Policy";
// import Dashboard from "./pages/Dashboard";
import EmailLinkHandler from "./components/EmailLinkHandler";
import Layout from "./layouts/MainLayout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/terms-of-use" element={<Terms />} />
            <Route path="/privacy-policy" element={<Policy />} />
            
            {/* Auth routes - redirect to dashboard if already logged in */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute redirectTo="/dashboard">
                  <Login />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/signup" 
              element={
                <ProtectedRoute redirectTo="/dashboard">
                  <Signup />
                </ProtectedRoute>
              } 
            />
            
            {/* Email link handler */}
            <Route path="/email-signin" element={<EmailLinkHandler />} />
            
            {/* Protected routes - require authentication */}
            {/* <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireAuth redirectTo="/login">
                  <Dashboard />
                </ProtectedRoute>
              } 
            /> */}
            
            {/* Add more protected routes as needed */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;