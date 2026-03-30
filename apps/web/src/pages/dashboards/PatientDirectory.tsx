import { Link, useNavigate } from "react-router-dom";
import { UserRoundSearch } from "lucide-react";
import { PatientSearch } from "./PatientSearch";
export function PatientDirectory() {
    const navigate = useNavigate();
    return (<div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Clinical</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">Patient chart</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
        Find a patient below. Their chart opens on its own page with full visit notes, labs, and
        appointments — better for large directories (search + deep link).
      </p>

      <div className="mt-10 rounded-2xl border border-[#0059B3]/15 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.04]">
        <div className="mb-4 flex items-center gap-2 text-slate-800">
          <UserRoundSearch className="h-5 w-5 text-[#0059B3]"/>
          <span className="text-sm font-semibold">Find patient</span>
        </div>
        <PatientSearch linkToChart onSelect={(p) => navigate(`/dashboard/patients/${encodeURIComponent(p.id)}`)}/>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Tip: bookmark a patient URL like{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/dashboard/patients/&lt;id&gt;</code> for
        quick return.
      </p>

      <p className="mt-4 text-center">
        <Link to="/dashboard" className="text-sm font-semibold text-[#0059B3] hover:underline">
          ← Back to overview
        </Link>
      </p>
    </div>);
}
