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
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-xs">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!business) return null;
  return (
    <div className="dashboard-shell">
      <Sidebar business={business} />
      <MobileSidebar business={business} />
      <main className="dashboard-main">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full min-w-0">
          <Outlet context={{ business }} />
        </div>
      </main>
    </div>
  );
}
