import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { api } from "@/api/client";
export type PatientLite = {
    id: string;
    email: string;
    fullName: string;
};
export function PatientSearch({ onSelect, linkToChart = false, browseOnly = false, sortPatients = false, }: {
    onSelect: (p: PatientLite) => void;
    linkToChart?: boolean;
    browseOnly?: boolean;
    sortPatients?: boolean;
}) {
    const [q, setQ] = useState("");
    const [nameSort, setNameSort] = useState<"asc" | "desc">("asc");
    const [browse, setBrowse] = useState<PatientLite[]>([]);
    const [searchHits, setSearchHits] = useState<PatientLite[] | null>(null);
    const [loadingBrowse, setLoadingBrowse] = useState(true);
    const [browseErr, setBrowseErr] = useState<string | null>(null);
    useEffect(() => {
        void (async () => {
            setBrowseErr(null);
            const r = await api<{
                patients: PatientLite[];
            }>("/api/patients");
            if (r.ok && "data" in r && r.data) {
                setBrowse(r.data.patients);
            }
            else {
                setBrowse([]);
                setBrowseErr(r.ok ? "Could not load patients." : (r.error ?? "API unavailable. Is the server running on port 4000?"));
            }
            setLoadingBrowse(false);
        })();
    }, []);
    useEffect(() => {
        if (browseOnly)
            return;
        const t = setTimeout(() => {
            void (async () => {
                if (q.trim().length < 2) {
                    setSearchHits(null);
                    return;
                }
                const r = await api<{
                    patients: PatientLite[];
                }>(`/api/patients/search?q=${encodeURIComponent(q.trim())}`);
                if (r.ok && "data" in r && r.data)
                    setSearchHits(r.data.patients);
                else
                    setSearchHits([]);
            })();
        }, 280);
        return () => clearTimeout(t);
    }, [q, browseOnly]);
    const displayList = useMemo(() => {
        if (browseOnly) {
            const arr = [...browse];
            arr.sort((a, b) => nameSort === "asc" ? a.fullName.localeCompare(b.fullName) : b.fullName.localeCompare(a.fullName));
            return arr;
        }
        const t = q.trim();
        if (t.length >= 2 && searchHits !== null)
            return searchHits;
        if (t.length === 0)
            return browse;
        const low = t.toLowerCase();
        return browse.filter((p) => p.fullName.toLowerCase().includes(low) || p.email.toLowerCase().includes(low));
    }, [browse, browseOnly, nameSort, q, searchHits]);
    return (<div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor={browseOnly ? undefined : "pq"}>
          Patient
        </label>
        {browseOnly && sortPatients && (<label className="text-xs text-slate-600">
            Sort{" "}
            <select value={nameSort} onChange={(e) => setNameSort(e.target.value as "asc" | "desc")} className="ml-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800">
              <option value="asc">A–Z</option>
              <option value="desc">Z–A</option>
            </select>
          </label>)}
      </div>
      {!browseOnly && (<>
          <input id="pq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name or email…" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-[#0059B3] focus:ring-2 focus:ring-[#0059B3]/20" autoComplete="off"/>
          <p className="mt-2 text-xs text-slate-500">
            Pick from the list or type to filter (2+ letters searches the server).
          </p>
        </>)}

      {browseErr && (<p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {browseErr}
        </p>)}

      {loadingBrowse && !browseErr && (<div className="mt-3 h-40 animate-pulse rounded-xl bg-slate-100" aria-hidden/>)}

      {!loadingBrowse && !browseErr && browse.length === 0 && (<div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          <Users className="mx-auto mb-2 h-8 w-8 text-slate-400" aria-hidden/>
          No patient accounts yet. Register at least one patient (or run{" "}
          <code className="rounded bg-white px-1 text-xs">npm run db:seed</code> in the repo) to see them
          here.
        </div>)}

      {!loadingBrowse && browse.length > 0 && (<div className="mt-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Patients ({displayList.length}
            {!browseOnly && q.trim() ? " matching" : ""})
          </p>
          <ul className="max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm" role="listbox">
            {displayList.map((p) => (<li key={p.id}>
                {linkToChart ? (<Link to={`/dashboard/patients/${encodeURIComponent(p.id)}`} onClick={() => onSelect(p)} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-[#e6f0fb]">
                    <span className="font-medium text-slate-900">{p.fullName}</span>
                    <span className="block text-xs text-slate-500">{p.email}</span>
                    {linkToChart && (<span className="mt-0.5 block text-[10px] font-semibold text-[#0059B3]">Open chart →</span>)}
                  </Link>) : (<button type="button" onClick={() => onSelect(p)} className="w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-[#e6f0fb]">
                    <span className="font-medium text-slate-900">{p.fullName}</span>
                    <span className="block text-xs text-slate-500">{p.email}</span>
                  </button>)}
              </li>))}
          </ul>
          {!browseOnly && displayList.length === 0 && q.trim() !== "" && (<p className="mt-2 text-sm text-slate-500">No matches. Try a different search.</p>)}
        </div>)}
    </div>);
}
