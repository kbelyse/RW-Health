function esc(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
export function formatApptWhen(d: Date): string {
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
export function patientSelfBookedHtml(p: {
    name: string;
    title: string;
    facilityName: string;
    when: string;
    clinicianName: string;
    notes?: string | null;
}): string {
    const n = p.notes?.trim();
    return `<p>Hi ${esc(p.name)},</p><p>Your visit is confirmed.</p><ul><li><strong>${esc(p.title)}</strong></li><li>${esc(p.facilityName)}</li><li>${esc(p.when)}</li><li>With ${esc(p.clinicianName)}</li></ul>${n ? `<p>Your note: ${esc(n)}</p>` : ""}<p>— RW-Health Passport</p>`;
}
export function patientSelfBookedText(p: {
    name: string;
    title: string;
    facilityName: string;
    when: string;
    clinicianName: string;
    notes?: string | null;
}): string {
    const n = p.notes?.trim();
    return `Hi ${p.name},\n\nYour visit is confirmed.\n${p.title}\n${p.facilityName}\n${p.when}\nWith ${p.clinicianName}${n ? `\nYour note: ${n}` : ""}\n\n— RW-Health Passport`;
}
export function clinicianPatientBookedHtml(p: {
    patientName: string;
    title: string;
    facilityName: string;
    when: string;
    notes?: string | null;
}): string {
    const n = p.notes?.trim();
    return `<p>${esc(p.patientName)} booked an open slot.</p><ul><li><strong>${esc(p.title)}</strong></li><li>${esc(p.facilityName)}</li><li>${esc(p.when)}</li></ul>${n ? `<p>Patient note: ${esc(n)}</p>` : ""}<p>— RW-Health Passport</p>`;
}
export function clinicianPatientBookedText(p: {
    patientName: string;
    title: string;
    facilityName: string;
    when: string;
    notes?: string | null;
}): string {
    const n = p.notes?.trim();
    return `${p.patientName} booked an open slot.\n${p.title}\n${p.facilityName}\n${p.when}${n ? `\nPatient note: ${n}` : ""}\n\n— RW-Health Passport`;
}
export function patientStaffScheduledHtml(p: {
    name: string;
    title: string;
    facilityName: string;
    when: string;
    clinicianName: string;
    notes?: string | null;
}): string {
    const n = p.notes?.trim();
    return `<p>Hi ${esc(p.name)},</p><p>A visit was scheduled for you.</p><ul><li><strong>${esc(p.title)}</strong></li><li>${esc(p.facilityName)}</li><li>${esc(p.when)}</li><li>With ${esc(p.clinicianName)}</li></ul>${n ? `<p>Note: ${esc(n)}</p>` : ""}<p>— RW-Health Passport</p>`;
}
export function patientStaffScheduledText(p: {
    name: string;
    title: string;
    facilityName: string;
    when: string;
    clinicianName: string;
    notes?: string | null;
}): string {
    const n = p.notes?.trim();
    return `Hi ${p.name},\n\nA visit was scheduled for you.\n${p.title}\n${p.facilityName}\n${p.when}\nWith ${p.clinicianName}${n ? `\nNote: ${n}` : ""}\n\n— RW-Health Passport`;
}
export function clinicianStaffScheduledHtml(p: {
    patientName: string;
    title: string;
    facilityName: string;
    when: string;
    notes?: string | null;
}): string {
    const n = p.notes?.trim();
    return `<p>Visit scheduled for ${esc(p.patientName)}.</p><ul><li><strong>${esc(p.title)}</strong></li><li>${esc(p.facilityName)}</li><li>${esc(p.when)}</li></ul>${n ? `<p>Note: ${esc(n)}</p>` : ""}<p>— RW-Health Passport</p>`;
}
export function clinicianStaffScheduledText(p: {
    patientName: string;
    title: string;
    facilityName: string;
    when: string;
    notes?: string | null;
}): string {
    const n = p.notes?.trim();
    return `Visit scheduled for ${p.patientName}.\n${p.title}\n${p.facilityName}\n${p.when}${n ? `\nNote: ${n}` : ""}\n\n— RW-Health Passport`;
}
export function labResultAddedHtml(p: {
    name: string;
    testName: string;
    testCode: string;
}): string {
    return `<p>Hi ${esc(p.name)},</p><p>New lab result: <strong>${esc(p.testName)}</strong> (${esc(p.testCode)}).</p><p>Sign in to RW-Health Passport to view it.</p>`;
}
export function labResultAddedText(p: {
    name: string;
    testName: string;
    testCode: string;
}): string {
    return `Hi ${p.name},\n\nNew lab result: ${p.testName} (${p.testCode}).\nSign in to RW-Health Passport to view it.`;
}
export function healthRecordAddedHtml(p: {
    name: string;
    title: string;
    facilityName: string;
}): string {
    return `<p>Hi ${esc(p.name)},</p><p>A new visit record was added: <strong>${esc(p.title)}</strong> at ${esc(p.facilityName)}.</p><p>Sign in to RW-Health Passport to read it.</p>`;
}
export function healthRecordAddedText(p: {
    name: string;
    title: string;
    facilityName: string;
}): string {
    return `Hi ${p.name},\n\nA new visit record was added: ${p.title} at ${p.facilityName}.\nSign in to RW-Health Passport to read it.`;
}
