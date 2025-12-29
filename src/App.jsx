import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../layout.jsx'
import { DarkModeProvider } from '../Components/DarkModeContext'
import { getTranslations } from '../Components/translations'
import { LanguageProvider } from '../Components/LanguageContext'
import GlobalTTSController from '../components/GlobalTTSController'

// Import pages
import SignIn from '../Pages/SignIn'
import Dashboard from '../Pages/dashboard'
import PillIdentifier from '../Pages/PillIdentifier'
import DoctorSearch from '../Pages/DoctorSearch'
import Emergency from '../Pages/emergency'
import Settings from '../Pages/Settings'
import AdminDashboard from '../Pages/AdminDashboard'
import ViewPrescription from '../Pages/ViewPrescription'
import ExportCode from '../Pages/ExportCode'

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/signin" replace />
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated - must have authToken in sessionStorage (set during sign-in)
    // SessionStorage ensures fresh start on new browser session
    const authToken = sessionStorage.getItem('authToken');
    const userEmail = sessionStorage.getItem('userEmail');
    
    // Only authenticate if both token and email exist in sessionStorage
    setIsAuthenticated(!!(authToken && userEmail));
    setLoading(false);
  }, []);

  const handleLogout = () => {
    // Clear from both localStorage and sessionStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userEmail');
    setIsAuthenticated(false);
  };

  if (loading) {
    const translations = getTranslations('en-IN');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{translations.common?.loading || "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <DarkModeProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {/* Global TTS Controller for route narration */}
          <GlobalTTSController />
          
          <Routes>
            {/* Public Route - Sign In Page */}
            <Route path="/signin" element={<SignIn />} />

            {/* Default Route - Redirect based on auth */}
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/signin"} replace />} />

            {/* Protected Routes - Only render if authenticated */}
            {isAuthenticated && (
              <Route 
                path="/" 
                element={<Layout onLogout={handleLogout} setIsAuthenticated={setIsAuthenticated} />}
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="pillidentifier" element={<PillIdentifier />} />
                <Route path="doctorsearch" element={<DoctorSearch />} />
                <Route path="emergency" element={<Emergency />} />
                <Route path="settings" element={<Settings onLogout={handleLogout} setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="admindashboard" element={<AdminDashboard />} />
                <Route path="viewprescription" element={<ViewPrescription />} />
                <Route path="exportcode" element={<ExportCode />} />
              </Route>
            )}

            {/* Fallback - Redirect to sign in */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </BrowserRouter>
      </DarkModeProvider>
    </LanguageProvider>
  )
}

export default App
