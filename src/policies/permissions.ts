/** Permission strings — must match `role_permission_grants` in Postgres */
export const Permission = {
  BusinessRead: 'business:read',
  BusinessWrite: 'business:write',
  BusinessDelete: 'business:delete',
  BillingRead: 'billing:read',
  BillingWrite: 'billing:write',
  MembersRead: 'members:read',
  MembersWrite: 'members:write',
  EmployeesRead: 'employees:read',
  EmployeesWrite: 'employees:write',
  EmployeesDelete: 'employees:delete',
  ClientsRead: 'clients:read',
  ClientsWrite: 'clients:write',
  AppointmentsRead: 'appointments:read',
  AppointmentsWrite: 'appointments:write',
  AppointmentsWriteOwn: 'appointments:write:own',
  ServicesRead: 'services:read',
  ServicesWrite: 'services:write',
  FinancialRead: 'financial:read',
  FinancialWrite: 'financial:write',
  AnalyticsRead: 'analytics:read',
  SettingsWrite: 'settings:write',
  AuditRead: 'audit:read',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

/** Client-side guard hints — authoritative check is RLS + RPC */
export const RoleCapabilities: Record<string, Permission[]> = {
  owner: Object.values(Permission),
  admin: [
    Permission.BusinessRead,
    Permission.BusinessWrite,
    Permission.BillingRead,
    Permission.MembersRead,
    Permission.MembersWrite,
    Permission.EmployeesRead,
    Permission.EmployeesWrite,
    Permission.ClientsRead,
    Permission.ClientsWrite,
    Permission.AppointmentsRead,
    Permission.AppointmentsWrite,
    Permission.ServicesRead,
    Permission.ServicesWrite,
    Permission.FinancialRead,
    Permission.AnalyticsRead,
    Permission.SettingsWrite,
    Permission.AuditRead,
  ],
  manager: [
    Permission.BusinessRead,
    Permission.EmployeesRead,
    Permission.EmployeesWrite,
    Permission.ClientsRead,
    Permission.ClientsWrite,
    Permission.AppointmentsRead,
    Permission.AppointmentsWrite,
    Permission.ServicesRead,
    Permission.ServicesWrite,
    Permission.AnalyticsRead,
  ],
  employee: [
    Permission.BusinessRead,
    Permission.ClientsRead,
    Permission.ClientsWrite,
    Permission.AppointmentsRead,
    Permission.AppointmentsWriteOwn,
    Permission.ServicesRead,
  ],
  receptionist: [
    Permission.BusinessRead,
    Permission.ClientsRead,
    Permission.ClientsWrite,
    Permission.AppointmentsRead,
    Permission.AppointmentsWrite,
    Permission.ServicesRead,
  ],
};

export function roleCan(role: string | undefined, permission: Permission): boolean {
  if (!role) return false;
  const caps = RoleCapabilities[role];
  return caps?.includes(permission) ?? false;
}
