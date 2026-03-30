import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, FlaskConical, Calendar, Users, Stethoscope, Microscope, BarChart3, Menu, X, LogOut, PanelLeftClose, PanelLeft, ChevronDown, } from "lucide-react";
import { useAuth, type Role, type User } from "@/auth/AuthContext";
import { RWHealthLogo } from "@/components/brand/RWHealthLogo";
import { useOnline } from "@/hooks/useOnline";
import { OfflineBar } from "@/components/OfflineBar";
type NavItem = {
    to: string;
    label: string;
    icon: typeof LayoutDashboard;
    end?: boolean;
};
const ROLE_LABEL: Record<Role, string> = {
    PATIENT: "Patient",
    CLINICIAN: "Clinician",
    LAB: "Laboratory",
    ADMIN: "Admin",
};
function counterpartRole(u: User): Role | null {
    if (!u.secondaryRole)
        return null;
    if (u.primaryRole != null) {
        return u.role === u.primaryRole ? u.secondaryRole : u.primaryRole;
    }
    if (u.role === "PATIENT")
        return u.secondaryRole;
    if (u.secondaryRole === "PATIENT")
        return u.role;
    return null;
}
function navForRole(role: Role): NavItem[] {
    switch (role) {
        case "PATIENT":
            return [
                { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
                { to: "/dashboard/records", label: "Medical records", icon: FileText },
                { to: "/dashboard/labs", label: "Lab results", icon: FlaskConical },
                { to: "/dashboard/appointments", label: "Appointments", icon: Calendar },
                { to: "/dashboard/care-team", label: "Care team", icon: Users },
            ];
        case "CLINICIAN":
            return [
                { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
                { to: "/dashboard/patients", label: "Patient chart", icon: Stethoscope },
                { to: "/dashboard/appointments", label: "Appointments", icon: Calendar },
            ];
        case "LAB":
            return [
                { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
                { to: "/dashboard/upload", label: "Upload results", icon: Microscope },
            ];
        case "ADMIN":
            return [
                { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
                { to: "/dashboard/patients", label: "Patient chart", icon: Stethoscope },
                { to: "/dashboard/admin", label: "Operations", icon: BarChart3 },
            ];
        default:
            return [];
    }
}
export function DashboardLayout() {
    const { user, logout, switchRole } = useAuth();
    const navigate = useNavigate();
    const online = useOnline();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [roleMenuOpen, setRoleMenuOpen] = useState(false);
    const roleMenuRef = useRef<HTMLDivElement>(null);
    const items = user ? navForRole(user.role) : [];
    const switchTo = user ? counterpartRole(user) : null;
    useEffect(() => {
        function closeOnOutside(e: MouseEvent) {
            if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
                setRoleMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", closeOnOutside);
        return () => document.removeEventListener("mousedown", closeOnOutside);
    }, []);
    return (<div className="flex min-h-screen flex-col bg-[#f0f5fb]">
      <OfflineBar online={online}/>
      <div className="flex min-h-0 flex-1">
        <aside className={`fixed inset-y-0 left-0 z-50 flex h-screen max-h-screen flex-col overflow-hidden border-r border-[#003d7a]/60 bg-gradient-to-b from-[#004a99] via-[#0059B3] to-[#003d7a] shadow-2xl shadow-[#003d7a]/40 transition-[width] duration-300 ease-out lg:sticky lg:top-0 lg:max-h-screen lg:self-start lg:z-0 ${collapsed ? "w-[80px]" : "w-[288px]"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div className="flex h-16 items-center justify-between gap-2 border-b border-white/15 px-4">
            <Link to="/" title="RW-Health marketing site" className={`flex min-w-0 items-center ${collapsed ? "justify-center" : ""}`} onClick={() => setMobileOpen(false)}>
              {collapsed ? (<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white shadow-lg ring-1 ring-white/25">
                  R
                </span>) : (<RWHealthLogo size="sm" variant="dark"/>)}
            </Link>
            <button type="button" className="hidden rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white lg:inline-flex" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {collapsed ? <PanelLeft className="h-5 w-5"/> : <PanelLeftClose className="h-5 w-5"/>}
            </button>
            <button type="button" className="rounded-lg p-2 text-white/80 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5"/>
            </button>
          </div>
          <nav className="min-h-0 flex-1 space-y-1 overflow-hidden p-3">
            {items.map((item) => (<NavLink key={item.to} to={item.to} end={item.end === true} onClick={() => setMobileOpen(false)} title={collapsed ? item.label : undefined} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3.5 text-sm font-semibold transition ${isActive
                ? "bg-white/15 text-white shadow-inner ring-1 ring-white/25"
                : "text-white/75 hover:bg-white/10 hover:text-white"} ${collapsed ? "justify-center px-2" : ""}`}>
                <item.icon className="h-5 w-5 shrink-0"/>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>))}
          </nav>
          <div className="border-t border-white/15 p-3">
            <button type="button" onClick={() => void logout()} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 ${collapsed ? "justify-center" : ""}`} title="Sign out">
              <LogOut className="h-5 w-5 shrink-0"/>
              {!collapsed && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        {mobileOpen && (<button type="button" className="fixed inset-0 z-40 bg-[#003d7a]/55 backdrop-blur-sm lg:hidden" aria-label="Close overlay" onClick={() => setMobileOpen(false)}/>)}

        <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
          <header className="sticky top-0 z-30 flex min-h-[4.25rem] items-center justify-between gap-4 border-b border-[#0059B3]/15 bg-white/95 px-5 py-3 shadow-sm shadow-[#0059B3]/5 backdrop-blur-xl md:min-h-[4.5rem] md:px-10">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <button type="button" className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                <Menu className="h-6 w-6"/>
              </button>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600/80">
                  Workspace
                </p>
                <p className="truncate text-lg font-semibold text-slate-900">{user?.fullName}</p>
              </div>
              {user &&
            (switchTo ? (<div className="relative shrink-0" ref={roleMenuRef}>
                    <button type="button" onClick={() => setRoleMenuOpen((o) => !o)} className="inline-flex items-center gap-1 rounded-full border border-[#0059B3]/25 bg-bk-light/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0059B3] transition hover:bg-bk-light" aria-expanded={roleMenuOpen} aria-haspopup="menu">
                      {ROLE_LABEL[user.role]}
                      <ChevronDown className={`h-3.5 w-3.5 transition ${roleMenuOpen ? "rotate-180" : ""}`}/>
                    </button>
                    {roleMenuOpen && (<div className="absolute right-0 z-50 mt-1 w-64 rounded-xl border border-slate-200/90 bg-white py-2 shadow-lg shadow-slate-900/10" role="menu">
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Active workspace
                        </p>
                        <p className="px-3 pb-2 text-sm font-semibold text-slate-900">{ROLE_LABEL[user.role]}</p>
                        <p className="border-t border-slate-100 px-3 pb-2 pt-2 text-xs leading-snug text-slate-500">
                          Optional second role on this account. Prefer separate logins if you don&apos;t need
                          both views.
                        </p>
                        <button type="button" role="menuitem" className="w-full px-3 py-2.5 text-left text-sm font-semibold text-[#0059B3] transition hover:bg-[#e6f0fb]" onClick={() => {
                        void switchRole(switchTo).then((r) => {
                            if (r.ok) {
                                setRoleMenuOpen(false);
                                navigate("/dashboard", { replace: true });
                            }
                        });
                    }}>
                          Open {ROLE_LABEL[switchTo]} workspace
                        </button>
                      </div>)}
                  </div>) : (<span className="inline-flex shrink-0 rounded-full border border-[#0059B3]/20 bg-bk-light/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0059B3]">
                    {ROLE_LABEL[user.role]}
                  </span>))}
            </div>
          </header>
          <main className="relative flex-1 overflow-auto bg-gradient-to-br from-[#f0f5fb] via-white to-bk-light/30 px-5 py-10 md:px-12 md:py-14">
            <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[length:48px_48px] opacity-30"/>
            <div className="relative mx-auto max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>);
}
