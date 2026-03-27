import { Link, NavLink, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useOnline } from "@/hooks/useOnline";
import { OfflineBar } from "./OfflineBar";
import { RWHealthLogo } from "@/components/brand/RWHealthLogo";

const nav = [
  { to: "/", label: "Home" },
  { to: "/#mission", label: "Mission" },
];

const btnPrimary =
  "inline-flex min-h-[52px] items-center justify-center rounded-sm bg-brand-600 px-8 text-base font-semibold text-white transition hover:bg-brand-700";

export function Layout() {
  const { user, logout } = useAuth();
  const online = useOnline();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <OfflineBar online={online} />
      <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/98 backdrop-blur-md">
        <div className="mx-auto flex min-h-[72px] max-w-6xl items-center justify-between gap-4 px-4 py-4 md:min-h-[80px] md:px-6 md:py-5">
          <Link to="/" className="group flex items-center gap-2">
            <RWHealthLogo size="md" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) =>
              n.to.startsWith("/#") ? (
                <a
                  key={n.to}
                  href={n.to}
                  className="rounded-sm px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {n.label}
                </a>
              ) : (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `rounded-sm px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-brand-50 text-brand-900"
                        : "text-slate-700 hover:bg-slate-100"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              )
            )}
            {user && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `rounded-sm px-4 py-3 text-sm font-semibold transition ${
                    isActive ? "bg-brand-50 text-brand-900" : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                Workspace
              </NavLink>
            )}
            {user ? (
              <button
                type="button"
                onClick={() => void logout()}
                className="ml-2 rounded-sm border border-slate-300/90 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Sign out
              </button>
            ) : (
              <Link to="/login" className={`ml-3 ${btnPrimary} !px-8`}>
                Sign in
              </Link>
            )}
          </nav>
          <button
            type="button"
            className="rounded-sm p-3 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-slate-100 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="rounded-sm px-4 py-3 text-sm font-semibold text-slate-800"
              >
                Home
              </Link>
              <a
                href="/#mission"
                onClick={() => setOpen(false)}
                className="rounded-sm px-4 py-3 text-sm font-semibold text-slate-800"
              >
                Mission
              </a>
              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-sm px-4 py-3 text-sm font-semibold text-slate-800"
                >
                  Workspace
                </Link>
              )}
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                  className="rounded-sm px-4 py-3 text-left text-sm font-semibold text-slate-800"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={`${btnPrimary} mt-2 w-full`}
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/90 bg-slate-950 text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row md:items-center md:justify-between md:gap-8 md:px-6 md:py-5">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <RWHealthLogo size="sm" variant="dark" />
            <p className="max-w-xs text-xs leading-relaxed text-slate-500">
              Academic demo · not an official Government of Rwanda product.
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium">
            <a href="/#platform" className="text-slate-400 transition hover:text-white">
              Platform
            </a>
            <a href="/#flow" className="text-slate-400 transition hover:text-white">
              Flow
            </a>
            <a href="/#mission" className="text-slate-400 transition hover:text-white">
              Mission
            </a>
            <Link to="/login" className="text-slate-400 transition hover:text-white">
              Sign in
            </Link>
          </nav>
          <p className="text-xs text-slate-600 md:text-right">Kigali · ALU</p>
        </div>
        <div className="border-t border-white/10 px-4 py-3 text-center text-[11px] text-slate-600 md:px-6">
          © {new Date().getFullYear()} RW-Health Passport
        </div>
      </footer>
    </div>
  );
}
