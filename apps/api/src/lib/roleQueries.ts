import type { Prisma } from "@prisma/client";
import { UserRole } from "@prisma/client";
export const whereUserHasPatientCapability: Prisma.UserWhereInput = {
    OR: [{ role: UserRole.PATIENT }, { secondaryRole: UserRole.PATIENT }],
};
export const whereUserHasClinicianCapability: Prisma.UserWhereInput = {
    OR: [{ role: UserRole.CLINICIAN }, { secondaryRole: UserRole.CLINICIAN }],
};
export function whereUserIsPatientWithId(id: string): Prisma.UserWhereInput {
    return { AND: [{ id }, whereUserHasPatientCapability] };
}
export function whereUserIsClinicianWithId(id: string): Prisma.UserWhereInput {
    return { AND: [{ id }, whereUserHasClinicianCapability] };
}
