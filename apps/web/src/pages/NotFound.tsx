import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-brand-950">Page not found</h1>
      <p className="mt-3 text-slate-600">The page you requested does not exist.</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white"
      >
        Home
      </Link>
    </div>
  );
}
