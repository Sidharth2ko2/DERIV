import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AttackMonitor from './pages/AttackMonitor';
import AuditResults from './pages/AuditResults';
import Guardrails from './pages/Guardrails';
import Settings from './pages/Settings';

//const NAVBAR_HEIGHT = 72;

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <BrowserRouter>
            {/* Toasts */}
            <Toaster
              position="top-right"
              containerStyle={{
                zIndex: 9999,
              }}
              toastOptions={{
                style: {
                  background: '#1A1A1A',
                  color: '#FFFFFF',
                  border: '1px solid #2A2A2A',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                },
                success: {
                  iconTheme: { primary: '#4BB543', secondary: '#FFFFFF' },
                  style: {
                    border: '1px solid #4BB543',
                  },
                },
                error: {
                  iconTheme: { primary: '#FF444F', secondary: '#FFFFFF' },
                  style: {
                    border: '1px solid #FF444F',
                  },
                },
                duration: 3000,
              }}
            />

            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />

              {/* Protected */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen bg-[#0E0E0E]">
                      {/* Fixed Navbar */}
                      <Navbar />

                      {/* Spacer to offset fixed navbar */}


                      {/* Page Content */}
                      <main className="px-4 sm:px-6 lg:px-8">
                        <div className="max-w-[1600px] mx-auto py-2">
                          <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/attacks" element={<AttackMonitor />} />
                            <Route path="/audits" element={<AuditResults />} />
                            <Route path="/guardrails" element={<Guardrails />} />
                            <Route path="/settings" element={<Settings />} />

                            {/* Default */}
                            <Route
                              path="/"
                              element={<Navigate to="/dashboard" replace />}
                            />
                            <Route
                              path="*"
                              element={<Navigate to="/dashboard" replace />}
                            />
                          </Routes>
                        </div>
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
