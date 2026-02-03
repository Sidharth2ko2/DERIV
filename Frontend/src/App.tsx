import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AttackMonitor from './pages/AttackMonitor';
import AuditResults from './pages/AuditResults';
import Guardrails from './pages/Guardrails';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1A1A1A',
                color: '#FFFFFF',
                border: '1px solid #2A2A2A',
              },
              success: { iconTheme: { primary: '#4BB543', secondary: '#FFFFFF' } },
              error: { iconTheme: { primary: '#FF444F', secondary: '#FFFFFF' } },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-[#0E0E0E]">
                    <Navbar />
                    <main className="pt-40 px-6 max-w-7xl mx-auto">
                      <div className="border-t border-[#2A2A2A]/70 mb-10 pt-10">
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/attacks" element={<AttackMonitor />} />
                          <Route path="/audits" element={<AuditResults />} />
                          <Route path="/guardrails" element={<Guardrails />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
    </ThemeProvider>
  );
}

export default App;