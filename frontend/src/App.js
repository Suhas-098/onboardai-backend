import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import EmployeeIntelligence from './pages/EmployeeIntelligence';
import AIRiskCommand from './pages/AIRiskCommand';
import AlertsInsights from './pages/AlertsInsights';
import Reports from './pages/Reports';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import EmployeeManagement from './pages/EmployeeManagement';
import TemplatesPage from './pages/admin/TemplatesPage';
import AppLayout from './components/layout/AppLayout';

const queryClient = new QueryClient();

const DashboardLayout = ({ children }) => (
  <AppLayout>
    {children}
  </AppLayout>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Employee Routes */}
                <Route path="/my-dashboard" element={
                  <DashboardLayout>
                    <EmployeeDashboard />
                  </DashboardLayout>
                } />

                {/* HR/Admin Routes */}
                <Route path="/dashboard" element={
                  <DashboardLayout>
                    <AIRiskCommand />
                  </DashboardLayout>
                } />

                <Route path="/employees" element={
                  <DashboardLayout>
                    <EmployeeIntelligence />
                  </DashboardLayout>
                } />

                <Route path="/employees/:userId" element={
                  <DashboardLayout>
                    <EmployeeDetailPage />
                  </DashboardLayout>
                } />

                <Route path="/insights" element={
                  <DashboardLayout>
                    <AlertsInsights />
                  </DashboardLayout>
                } />

                <Route path="/reports" element={
                  <DashboardLayout>
                    <Reports />
                  </DashboardLayout>
                } />

                <Route path="/manage" element={
                  <DashboardLayout>
                    <EmployeeManagement />
                  </DashboardLayout>
                } />

                <Route path="/templates" element={
                  <DashboardLayout>
                    <TemplatesPage />
                  </DashboardLayout>
                } />

                {/* Default Redirects */}
                <Route path="/risk" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
