import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { api } from "@/api/client";
import { DashCard } from "@/components/dashboard/DashboardShell";

type RecordRow = {
  id: string;
  title: string;
  summary: string;
  facilityName: string;
  visitDate: string;
  author?: { fullName: string } | null;
};

export function DashboardRecordsPage() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await api<{ records: RecordRow[] }>("/api/records");
      if (!r.ok) {
        setErr(r.error ?? "Failed to load records");
        return;
      }
      if (!("data" in r) || !r.data) {
        setErr("You are offline — connect to load records.");
        return;
      }
      setRecords(r.data.records);
    })();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Medical records</h1>
      <p className="mt-1 text-sm text-slate-600">
        Visit summaries added by clinicians appear here with facility and date.
      </p>
      {err && (
        <p className="mt-4 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {err}
        </p>
      )}
      <DashCard title="Encounters" icon={<FileText className="h-4 w-4 text-brand-600" />} className="mt-6">
        <ul className="space-y-3">
          {records.map((rec) => (
            <motion.li
              key={rec.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3"
            >
              <p className="font-medium text-slate-900">{rec.title}</p>
              <p className="mt-1 text-sm text-slate-600">{rec.summary}</p>
              <p className="mt-2 text-xs text-slate-500">
                {rec.facilityName} · {new Date(rec.visitDate).toLocaleDateString()}
                {rec.author?.fullName && ` · ${rec.author.fullName}`}
              </p>
            </motion.li>
          ))}
          {records.length === 0 && (
            <li className="text-sm text-slate-500">
              No records yet. When clinicians document visits, they appear here.
            </li>
          )}
        </ul>
      </DashCard>
    </div>
  );
}
