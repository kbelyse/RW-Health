import { useEffect, useState } from "react";
import { api } from "@/api/client";

export type PatientLite = { id: string; email: string; fullName: string };

export function PatientSearch({
  onSelect,
}: {
  onSelect: (p: PatientLite) => void;
}) {
  const [q, setQ] = useState("");
  const [list, setList] = useState<PatientLite[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      void (async () => {
        if (q.trim().length < 2) {
          setList([]);
          return;
        }
        const r = await api<{ patients: PatientLite[] }>(
          `/api/patients/search?q=${encodeURIComponent(q.trim())}`
        );
        if (r.ok && "data" in r && r.data) setList(r.data.patients);
        else setList([]);
      })();
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700" htmlFor="pq">
        Find patient
      </label>
      <input
        id="pq"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Name or email"
        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
      />
      {list.length > 0 && (
        <ul className="mt-2 max-h-48 overflow-auto rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
          {list.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p)}
                className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50"
              >
                <span className="font-medium text-slate-900">{p.fullName}</span>
                <span className="block text-xs text-slate-500">{p.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
