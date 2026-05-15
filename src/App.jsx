import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider, useTheme } from '@/lib/ThemeContext';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';

const Onboarding = lazy(() => import('./pages/Onboarding'));
const PublicBooking = lazy(() => import('./pages/PublicBooking'));
const StarterCheckout = lazy(() => import('./pages/checkout/StarterCheckout'));
const ProfessionalCheckout = lazy(() => import('./pages/checkout/ProfessionalCheckout'));
const Enterprise = lazy(() => import('./pages/Enterprise'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const EmployeeDashboard = lazy(() => import('./pages/dashboard/EmployeeDashboard'));
const EmployeeInvite = lazy(() => import('./pages/dashboard/EmployeeInvite'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const CalendarPage = lazy(() => import('./pages/dashboard/CalendarPage'));
const Birthdays = lazy(() => import('./pages/dashboard/Birthdays'));
const Clients = lazy(() => import('./pages/dashboard/Clients'));
const Services = lazy(() => import('./pages/dashboard/Services'));
const Employees = lazy(() => import('./pages/dashboard/Employees'));
const Coupons = lazy(() => import('./pages/dashboard/Coupons'));
const Financial = lazy(() => import('./pages/dashboard/Financial'));
const Reports = lazy(() => import('./pages/dashboard/Reports'));
const Notifications = lazy(() => import('./pages/dashboard/Notifications'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));

function PageLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function Lazy({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function ThemedSonner() {
  const { theme } = useTheme();
  return <SonnerToaster theme={theme === 'dark' ? 'dark' : 'light'} />;
}

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
      <Route path="/book/:slug" element={<Lazy><PublicBooking /></Lazy>} />
      <Route path="/checkout/starter" element={<Lazy><StarterCheckout /></Lazy>} />
      <Route path="/checkout/professional" element={<Lazy><ProfessionalCheckout /></Lazy>} />
      <Route path="/enterprise" element={<Lazy><Enterprise /></Lazy>} />
      <Route path="/login" element={<Login />} />
      <Route path="/account" element={<Lazy><AccountSettings /></Lazy>} />

      <Route path="/onboarding" element={<Lazy><Onboarding /></Lazy>} />
      <Route path="/employee" element={<Lazy><EmployeeDashboard /></Lazy>} />
      <Route path="/employee-invite" element={<Lazy><EmployeeInvite /></Lazy>} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Lazy><DashboardHome /></Lazy>} />
        <Route path="calendar" element={<Lazy><CalendarPage /></Lazy>} />
        <Route path="clients" element={<Lazy><Clients /></Lazy>} />
        <Route path="birthdays" element={<Lazy><Birthdays /></Lazy>} />
        <Route path="services" element={<Lazy><Services /></Lazy>} />
        <Route path="employees" element={<Lazy><Employees /></Lazy>} />
        <Route path="coupons" element={<Lazy><Coupons /></Lazy>} />
        <Route path="financial" element={<Lazy><Financial /></Lazy>} />
        <Route path="reports" element={<Lazy><Reports /></Lazy>} />
        <Route path="notifications" element={<Lazy><Notifications /></Lazy>} />
        <Route path="settings" element={<Lazy><Settings /></Lazy>} />
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
          <ThemedSonner />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App