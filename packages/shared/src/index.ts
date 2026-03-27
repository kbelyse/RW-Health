export type UserRole = "PATIENT" | "CLINICIAN" | "LAB" | "ADMIN";

export interface ApiErrorBody {
  error: string;
  code?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface HealthRecordDto {
  id: string;
  title: string;
  summary: string;
  facilityName: string;
  visitDate: string;
  createdAt: string;
}

export interface LabResultDto {
  id: string;
  testName: string;
  testCode: string;
  value: string;
  unit: string;
  referenceRange: string | null;
  status: string;
  collectedAt: string;
  reportedAt: string;
  createdAt: string;
}
