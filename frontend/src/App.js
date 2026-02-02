import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import EmployeeIntelligence from './pages/EmployeeIntelligence';
import AIRiskCommand from './pages/AIRiskCommand';
import AlertsInsights from './pages/AlertsInsights';
import ExecutiveDemo from './pages/ExecutiveDemo';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import AppLayout from './components/layout/AppLayout';
import DocsPage from './pages/DocsPage';

// Mock Placeholders
const Reports = () => <div className="text-center py-20"><h2 className="text-2xl font-bold mb-2">Enterprise Reports</h2><p className="text-text-secondary">Advanced CSV/PDF exports are available in the production build.</p></div>;
const EmployeeManagement = () => <div className="text-center py-20"><h2 className="text-2xl font-bold mb-2">Employee Directory</h2><p className="text-text-secondary">Manage access, roles, and permissions.</p></div>;

const DashboardLayout = ({ children }) => (
  <AppLayout>
    {children}
  </AppLayout>
);

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/demo" element={<ExecutiveDemo />} />
            <Route path="/docs" element={<DocsPage />} />

            {/* Employee Routes */}
            <Route path="/my-dashboard" element={
              <DashboardLayout>
                <EmployeeDashboard />
              </DashboardLayout>
            } />

            {/* HR Routes */}
            <Route path="/employees" element={
              <DashboardLayout>
                <EmployeeIntelligence />
              </DashboardLayout>
            } />

            <Route path="/risk" element={
              <DashboardLayout>
                <AIRiskCommand />
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

            {/* Default Redirects */}
            <Route path="/dashboard" element={<Navigate to="/risk" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
