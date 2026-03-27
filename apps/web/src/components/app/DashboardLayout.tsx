import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  FlaskConical,
  Calendar,
  Users,
  Settings,
  Stethoscope,
  Microscope,
  BarChart3,
  Menu,
  X,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useAuth, type Role } from "@/auth/AuthContext";
import { RWHealthLogo } from "@/components/brand/RWHealthLogo";
import { useOnline } from "@/hooks/useOnline";
import { OfflineBar } from "@/components/OfflineBar";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean };

function navForRole(role: Role): NavItem[] {
  switch (role) {
    case "PATIENT":
      return [
        { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
        { to: "/dashboard/records", label: "Medical records", icon: FileText },
        { to: "/dashboard/labs", label: "Lab results", icon: FlaskConical },
        { to: "/dashboard/appointments", label: "Appointments", icon: Calendar },
        { to: "/dashboard/care-team", label: "Care team", icon: Users },
        { to: "/dashboard/settings", label: "Settings", icon: Settings },
      ];
    case "CLINICIAN":
      return [
        { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
        { to: "/dashboard/patients", label: "Patients & visits", icon: Stethoscope },
        { to: "/dashboard/appointments", label: "Appointments", icon: Calendar },
        { to: "/dashboard/settings", label: "Settings", icon: Settings },
      ];
    case "LAB":
      return [
        { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
        { to: "/dashboard/upload", label: "Upload results", icon: Microscope },
        { to: "/dashboard/settings", label: "Settings", icon: Settings },
      ];
    case "ADMIN":
      return [
        { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
        { to: "/dashboard/admin", label: "Operations", icon: BarChart3 },
        { to: "/dashboard/settings", label: "Settings", icon: Settings },
      ];
    default:
      return [];
  }
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const online = useOnline();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const items = user ? navForRole(user.role) : [];

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/90">
      <OfflineBar online={online} />
      <div className="flex min-h-0 flex-1">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/90 bg-white transition-[width] duration-200 ease-out lg:static lg:z-0 ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } ${mobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-slate-100 px-3 lg:h-16">
          <Link
            to="/dashboard"
            className={`flex min-w-0 items-center ${collapsed ? "justify-center" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            {collapsed ? (
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand-600 text-sm font-bold text-white">
                R
              </span>
            ) : (
              <RWHealthLogo size="sm" />
            )}
          </Link>
          <button
            type="button"
            className="hidden rounded-sm p-2 text-slate-500 hover:bg-slate-100 lg:inline-flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          <button
            type="button"
            className="rounded-sm p-2 text-slate-600 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end === true}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-brand-50 text-brand-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                } ${collapsed ? "justify-center px-2" : ""}`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-2">
          <Link
            to="/"
            className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 ${collapsed ? "justify-center" : ""}`}
          >
            <span className="text-xs">←</span>
            {!collapsed && "Back to site"}
          </Link>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-label="Close overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-sm lg:h-16 lg:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-sm p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
                Signed in
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">{user?.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                `rounded-sm p-2.5 text-slate-600 transition hover:bg-slate-100 ${isActive ? "bg-brand-50 text-brand-800" : ""}`
              }
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </NavLink>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex items-center gap-2 rounded-sm border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}
