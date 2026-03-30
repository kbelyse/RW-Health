import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BarChart3, Calendar, FileText, FlaskConical, Layers, Microscope, Stethoscope, UserCheck, Users, } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { api } from "@/api/client";
const BK = "#0059B3";
function BarCompare({ title, rows, }: {
    title: string;
    rows: {
        label: string;
        value: number;
        color: string;
    }[];
}) {
    const max = Math.max(1, ...rows.map((r) => r.value));
    return (<div className="rounded-2xl bg-gradient-to-br from-[#0059B3]/35 via-[#0059B3]/12 to-[#0059B3]/20 p-px shadow-sm ring-1 ring-slate-900/[0.04]">
      <div className="rounded-[15px] bg-white p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0059B3]">{title}</p>
      <div className="mt-4 space-y-3">
        {rows.map((r) => (<div key={r.label}>
            <div className="mb-1 flex justify-between text-xs text-slate-600">
              <span>{r.label}</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900">{r.value}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full transition-all" style={{ width: `${(r.value / max) * 100}%`, backgroundColor: r.color }}/>
            </div>
          </div>))}
      </div>
      </div>
    </div>);
}
function MetricCard({ icon: Icon, value, label, title: hint, }: {
    icon: LucideIcon;
    value: string | number;
    label: string;
    title?: string;
}) {
    return (<div className="rounded-2xl bg-gradient-to-br from-[#0059B3]/35 via-[#0059B3]/12 to-[#0059B3]/20 p-px shadow-sm">
      <div className="flex min-h-[7.5rem] flex-col justify-between rounded-[15px] bg-white p-4 md:min-h-[8rem] md:p-5" title={hint}>
        <Icon className="h-6 w-6 shrink-0 text-[#0059B3]" strokeWidth={1.75} aria-hidden/>
        <div>
          <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-slate-900 md:text-3xl">
            {value}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase leading-tight tracking-wide text-slate-500">
            {label}
          </p>
        </div>
      </div>
    </div>);
}
function SkeletonOverview() {
    return (<div className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="h-28 rounded-2xl bg-slate-200/90 md:h-32"/>))}
    </div>);
}
function QuickLink({ to, icon: Icon, label, }: {
    to: string;
    icon: LucideIcon;
    label: string;
}) {
    return (<Link to={to} className="group flex min-h-[3.5rem] items-center gap-3 rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm transition hover:border-[#0059B3]/30 hover:shadow-md">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0059B3]/8 text-[#0059B3]">
        <Icon className="h-5 w-5" strokeWidth={2}/>
      </span>
      <span className="min-w-0 flex-1 text-sm font-semibold text-slate-900">{label}</span>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#0059B3]"/>
    </Link>);
}
type OverviewPatient = {
    healthRecords: number;
    labResults: number;
    appointments: number;
    cliniciansOnPlatform: number;
    appointmentsRequested: number;
    appointmentsScheduled: number;
    upcomingAppointments: number;
};
type OverviewClinician = {
    visitNotesLogged: number;
    appointmentsAsClinician: number;
    upcomingScheduledNext7Days: number;
    pendingPatientRequests: number;
    patientsOnPlatform: number;
    labResultsInSystem: number;
};
type OverviewLab = {
    resultsUploadedByYou: number;
    totalLabResultsInSystem: number;
    uploadsLast7Days: number;
    distinctPatientsServed: number;
    patientsOnPlatform: number;
    appointmentsInSystem: number;
    labAccountsOnPlatform: number;
};
type OverviewAdmin = {
    totalUsers: number;
    totalHealthRecords: number;
    totalLabResults: number;
    totalAppointments: number;
    auditEventsLast7Days: number;
    usersByRole: Array<{
        role: string;
        _count: {
            _all: number;
        };
    }>;
};
const ROLE_BAR_COLORS: Record<string, string> = {
    PATIENT: "#0059B3",
    CLINICIAN: "#0d9488",
    LAB: "#d97706",
    ADMIN: "#7c3aed",
};
export function DashboardOverviewPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState<OverviewPatient | null>(null);
    const [clinician, setClinician] = useState<OverviewClinician | null>(null);
    const [lab, setLab] = useState<OverviewLab | null>(null);
    const [admin, setAdmin] = useState<OverviewAdmin | null>(null);
    useEffect(() => {
        if (!user)
            return;
        setLoading(true);
        void (async () => {
            const r = await api<{
                patient: OverviewPatient;
            } | {
                clinician: OverviewClinician;
            } | {
                lab: OverviewLab;
            } | {
                admin: OverviewAdmin;
            }>("/api/dashboard/overview");
            if (r.ok && "data" in r && r.data) {
                const d = r.data;
                if ("patient" in d)
                    setPatient(d.patient);
                if ("clinician" in d)
                    setClinician(d.clinician);
                if ("lab" in d)
                    setLab(d.lab);
                if ("admin" in d)
                    setAdmin(d.admin);
            }
            setLoading(false);
        })();
    }, [user]);
    if (!user)
        return null;
    const pageTitle = (<div className="mb-6 md:mb-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#0059B3]/80">Dashboard</p>
      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Overview</h1>
    </div>);
    if (user.role === "PATIENT") {
        return (<div>
        {pageTitle}
        {loading && <SkeletonOverview />}
        {!loading && patient && (<>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={FileText} value={patient.healthRecords} label="Health records"/>
              <MetricCard icon={FlaskConical} value={patient.labResults} label="Lab results"/>
              <MetricCard icon={Calendar} value={patient.appointments} label="Appointments"/>
              <MetricCard icon={Layers} value={patient.upcomingAppointments} label="Upcoming"/>
              <MetricCard icon={UserCheck} value={patient.appointmentsRequested} label="Requested"/>
              <MetricCard icon={Calendar} value={patient.appointmentsScheduled} label="Booked"/>
              <MetricCard icon={Stethoscope} value={patient.cliniciansOnPlatform} label="Clinicians"/>
              <MetricCard icon={Layers} value={patient.healthRecords + patient.labResults + patient.appointments} label="Records + labs + visits" title="Sum of your visit records, lab result rows, and appointments"/>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <BarCompare title="Passport mix" rows={[
                    { label: "Records", value: patient.healthRecords, color: BK },
                    { label: "Labs", value: patient.labResults, color: "#0d9488" },
                    { label: "Appointments", value: patient.appointments, color: "#7c3aed" },
                ]}/>
              <BarCompare title="Appointment status" rows={[
                    { label: "Upcoming scheduled", value: patient.upcomingAppointments, color: BK },
                    { label: "Booked", value: patient.appointmentsScheduled, color: "#0d9488" },
                    { label: "Requested", value: patient.appointmentsRequested, color: "#d97706" },
                ]}/>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <QuickLink to="/dashboard/records" icon={FileText} label="Medical records"/>
              <QuickLink to="/dashboard/labs" icon={FlaskConical} label="Lab results"/>
              <QuickLink to="/dashboard/appointments" icon={Calendar} label="Appointments"/>
              <QuickLink to="/dashboard/care-team" icon={Users} label="Care team"/>
            </div>
          </>)}
      </div>);
    }
    if (user.role === "CLINICIAN") {
        return (<div>
        {pageTitle}
        {loading && <SkeletonOverview />}
        {!loading && clinician && (<>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard icon={FileText} value={clinician.visitNotesLogged} label="Visit notes"/>
              <MetricCard icon={Calendar} value={clinician.appointmentsAsClinician} label="Your appointments"/>
              <MetricCard icon={Calendar} value={clinician.upcomingScheduledNext7Days} label="Next 7 days"/>
              <MetricCard icon={UserCheck} value={clinician.pendingPatientRequests} label="Pending requests"/>
              <MetricCard icon={Users} value={clinician.patientsOnPlatform} label="Patients (platform)"/>
              <MetricCard icon={FlaskConical} value={clinician.labResultsInSystem} label="Lab results (system)"/>
            </div>
            <div className="mt-6 max-w-xl">
              <BarCompare title="Schedule focus" rows={[
                    { label: "Next 7 days", value: clinician.upcomingScheduledNext7Days, color: BK },
                    { label: "Pending requests", value: clinician.pendingPatientRequests, color: "#d97706" },
                    { label: "All your appts", value: clinician.appointmentsAsClinician, color: "#0d9488" },
                ]}/>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <QuickLink to="/dashboard/patients" icon={Stethoscope} label="Patient chart"/>
              <QuickLink to="/dashboard/appointments" icon={Calendar} label="Appointments"/>
            </div>
          </>)}
      </div>);
    }
    if (user.role === "LAB") {
        return (<div>
        {pageTitle}
        {loading && <SkeletonOverview />}
        {!loading && lab && (<>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={Microscope} value={lab.resultsUploadedByYou} label="Your uploads"/>
              <MetricCard icon={Users} value={lab.distinctPatientsServed} label="Patients served"/>
              <MetricCard icon={FlaskConical} value={lab.uploadsLast7Days} label="Last 7 days"/>
              <MetricCard icon={FlaskConical} value={lab.totalLabResultsInSystem} label="Labs (system)"/>
              <MetricCard icon={Users} value={lab.patientsOnPlatform} label="Patients (platform)"/>
              <MetricCard icon={Calendar} value={lab.appointmentsInSystem} label="Appointments"/>
              <MetricCard icon={Microscope} value={lab.labAccountsOnPlatform} label="Lab accounts"/>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <BarCompare title="Your volume vs system" rows={[
                    { label: "Your uploads (all time)", value: lab.resultsUploadedByYou, color: BK },
                    { label: "All labs (system)", value: lab.totalLabResultsInSystem, color: "#94a3b8" },
                ]}/>
              <BarCompare title="Recent activity" rows={[
                    { label: "Last 7 days", value: lab.uploadsLast7Days, color: "#0d9488" },
                    { label: "Patients you served", value: lab.distinctPatientsServed, color: "#7c3aed" },
                ]}/>
            </div>
            <div className="mt-8">
              <QuickLink to="/dashboard/upload" icon={Microscope} label="Upload results"/>
            </div>
          </>)}
      </div>);
    }
    if (user.role === "ADMIN") {
        return (<div>
        {pageTitle}
        {loading && <SkeletonOverview />}
        {!loading && admin && (<>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard icon={Users} value={admin.totalUsers} label="Users"/>
              <MetricCard icon={FileText} value={admin.totalHealthRecords} label="Health records"/>
              <MetricCard icon={FlaskConical} value={admin.totalLabResults} label="Lab results"/>
              <MetricCard icon={Calendar} value={admin.totalAppointments} label="Appointments"/>
              <MetricCard icon={BarChart3} value={admin.auditEventsLast7Days} label="Audit (7 d)"/>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <BarCompare title="Data volume" rows={[
                    { label: "Health records", value: admin.totalHealthRecords, color: BK },
                    { label: "Lab results", value: admin.totalLabResults, color: "#0d9488" },
                    { label: "Appointments", value: admin.totalAppointments, color: "#7c3aed" },
                ]}/>
              <BarCompare title="Users by role" rows={admin.usersByRole.map((u) => ({
                    label: u.role,
                    value: u._count._all,
                    color: ROLE_BAR_COLORS[u.role] ?? BK,
                }))}/>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <QuickLink to="/dashboard/patients" icon={Stethoscope} label="Patient chart"/>
              <QuickLink to="/dashboard/admin" icon={BarChart3} label="Operations & audit"/>
            </div>
          </>)}
      </div>);
    }
    return null;
}
