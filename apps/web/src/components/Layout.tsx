import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { RWHealthLogo } from "@/components/brand/RWHealthLogo";

const homeAnchors = [
  { href: "/#hero", label: "Home" },
  { href: "/#why-us", label: "Why us" },
  { href: "/#activities", label: "Activities" },
  { href: "/#cta", label: "Demo" },
] as const;

export function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [navSolid, setNavSolid] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setNavSolid(false);
      return;
    }
    const onScroll = () => setNavSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparentHero = isHome && !navSolid;

  const navLinkClass = transparentHero
    ? "rounded-md px-3 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
    : "rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900";

  const headerClass = isHome
    ? navSolid
      ? "fixed inset-x-0 top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl"
      : "fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-transparent"
    : "sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl";

  const menuBtnClass = transparentHero
    ? "rounded-md p-3 text-white hover:bg-white/10"
    : "rounded-md p-3 text-slate-700 hover:bg-slate-100";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className={headerClass}>
        <div className="mx-auto flex min-h-[5.25rem] max-w-6xl items-center justify-between gap-4 px-5 py-3 md:min-h-[5.5rem] md:px-8">
          <Link to="/" className="group flex items-center gap-2 transition hover:opacity-90">
            <RWHealthLogo size="md" variant={transparentHero ? "dark" : "light"} />
          </Link>
          <nav className="hidden items-center gap-0.5 md:flex md:gap-1">
            {homeAnchors.map((n) => (
              <a key={n.href} href={n.href} className={navLinkClass}>
                {n.label}
              </a>
            ))}
            {user && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `ml-1 rounded-md px-3 py-2 text-sm font-semibold transition lg:ml-2 lg:px-4 ${
                    isActive
                      ? transparentHero
                        ? "bg-white text-[#0059B3]"
                        : "bg-[#0059B3] text-white"
                      : navLinkClass
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
                className={
                  transparentHero
                    ? "ml-1 rounded-md border border-white/30 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 lg:ml-2 lg:px-4"
                    : "ml-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 lg:ml-2 lg:px-4"
                }
              >
                Sign out
              </button>
            ) : (
              <div
                className={
                  transparentHero
                    ? "ml-2 flex items-center border-l border-white/20 pl-3 lg:ml-4 lg:pl-4"
                    : "ml-2 flex items-center border-l border-slate-200 pl-3 lg:ml-4 lg:pl-4"
                }
              >
                <Link
                  to="/login"
                  className={
                    transparentHero
                      ? "inline-flex min-h-[44px] min-w-[5.5rem] items-center justify-center rounded-md border border-white/40 px-4 text-sm font-bold text-white transition hover:bg-white/10"
                      : "inline-flex min-h-[44px] min-w-[5.5rem] items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-[#0059B3] transition hover:bg-slate-50"
                  }
                >
                  Login
                </Link>
              </div>
            )}
          </nav>
          <button
            type="button"
            className={`${menuBtnClass} md:hidden`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-slate-100 bg-white px-5 py-5 md:hidden">
            <div className="flex flex-col gap-0.5">
              {homeAnchors.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {n.label}
                </a>
              ))}
              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
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
                  className="rounded-md px-3 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Sign out
                </button>
              ) : (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex min-h-[48px] items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-bold text-[#0059B3] hover:bg-slate-50"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/90 bg-slate-100/90 text-slate-600">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 md:flex-row md:items-center md:justify-between md:gap-8 md:px-8 md:py-7">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium">
            <a href="/#why-us" className="text-slate-600 transition hover:text-[#0059B3]">
              Why us
            </a>
            <a href="/#activities" className="text-slate-600 transition hover:text-[#0059B3]">
              Activities
            </a>
            <Link to="/login" className="text-slate-600 transition hover:text-[#0059B3]">
              Sign in
            </Link>
          </nav>
          <p className="text-xs text-slate-500 md:text-right">Kigali · ALU</p>
        </div>
        <div className="border-t border-slate-200/80 px-5 py-3 text-center text-[11px] text-slate-500 md:px-8">
          © {new Date().getFullYear()} RW-Health Passport
        </div>
      </footer>
    </div>
  );
}
