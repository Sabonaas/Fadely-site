import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useBusiness } from '@/hooks/useBusiness';
import { useQuery } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import { goToLogin } from '@/lib/authRedirect';
import * as db from '@/repositories/db';

export default function DashboardLayout() {
  const { isAuthenticated, isLoadingAuth, user } = useAuth();
  const { business, isLoading, isFetching } = useBusiness();
  const navigate = useNavigate();

  // Check if user is a linked employee (not an owner)
  const { data: employeeRecords = [], isLoading: loadingEmployeeCheck } = useQuery({
    queryKey: ['employee-by-email', user?.email],
    queryFn: () => db.listLinkedEmployeesForUser(user?.id, user?.email),
    enabled: !!user?.email && isAuthenticated,
  });

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      goToLogin('/dashboard');
      return;
    }
    // If user is a linked employee (and not a business owner), redirect to employee dashboard
    if (!loadingEmployeeCheck && employeeRecords.length > 0 && !isLoading && !isFetching && !business) {
      navigate('/employee');
      return;
    }
    if (!isLoading && !isFetching && !business && isAuthenticated && !loadingEmployeeCheck) {
      navigate('/onboarding');
    }
  }, [business, isLoading, isFetching, isAuthenticated, isLoadingAuth, navigate, employeeRecords, loadingEmployeeCheck]);

  if (isLoading || isLoadingAuth || loadingEmployeeCheck || (isFetching && !business)) {
    return (
      <div className="fixed inset-0 bg-[#08090E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-white/20 text-xs">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!business) return null;
  return (
    <div className="min-h-screen bg-[#08090E]">
      <Sidebar business={business} />
      <MobileSidebar business={business} />
      <main className="min-h-screen pt-14 lg:pt-0 lg:pl-60">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet context={{ business }} />
        </div>
      </main>
    </div>
  );
}