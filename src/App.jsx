import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import PublicBooking from './pages/PublicBooking';
import StarterCheckout from './pages/checkout/StarterCheckout';
import ProfessionalCheckout from './pages/checkout/ProfessionalCheckout';
import Enterprise from './pages/Enterprise';
import AccountSettings from './pages/AccountSettings';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import EmployeeInvite from './pages/dashboard/EmployeeInvite';

// Dashboard pages
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import CalendarPage from './pages/dashboard/CalendarPage';
import Birthdays from './pages/dashboard/Birthdays';
import Clients from './pages/dashboard/Clients';
import Services from './pages/dashboard/Services';
import Employees from './pages/dashboard/Employees';
import Financial from './pages/dashboard/Financial';
import Reports from './pages/dashboard/Reports';
import Notifications from './pages/dashboard/Notifications';
import Settings from './pages/dashboard/Settings';

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 bg-[#0A0B0F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/book/:slug" element={<PublicBooking />} />
      <Route path="/checkout/starter" element={<StarterCheckout />} />
      <Route path="/checkout/professional" element={<ProfessionalCheckout />} />
      <Route path="/enterprise" element={<Enterprise />} />
      <Route path="/login" element={<Login />} />
      <Route path="/account" element={<AccountSettings />} />

      {/* Auth-required routes */}
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/employee" element={<EmployeeDashboard />} />
      <Route path="/employee-invite" element={<EmployeeInvite />} />
      
      {/* Dashboard routes with layout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="clients" element={<Clients />} />
        <Route path="birthdays" element={<Birthdays />} />
        <Route path="services" element={<Services />} />
        <Route path="employees" element={<Employees />} />
        <Route path="financial" element={<Financial />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <SonnerToaster theme="dark" />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App