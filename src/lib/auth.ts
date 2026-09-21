import { cookies, headers } from "next/headers";
import { prisma } from "./prisma";

export interface CurrentUserSession {
  id: string;
  memberId: string;
  email: string;
  fullName: string;
  memberType: string;
  status: string;
  roles: string[];
  permissions: string[];
  department?: { id: string; name: string; code: string } | null;
}

/**
 * Returns current authenticated user session based on cookie or header.
 * Defaults to Library Director ("DIR-001") if not explicitly set, enabling immediate testing.
 */
export async function getCurrentUser(): Promise<CurrentUserSession | null> {
  const cookieStore = cookies();
  const activeMemberId = cookieStore.get("ulms_active_user")?.value || "DIR-001";

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { memberId: activeMemberId },
        { id: activeMemberId },
      ],
    },
    include: {
      department: true,
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const roles = user.roles.map((ur) => ur.role.name);
  const permissionsSet = new Set<string>();

  for (const ur of user.roles) {
    for (const rp of ur.role.permissions) {
      permissionsSet.add(rp.permission.code);
    }
  }

  return {
    id: user.id,
    memberId: user.memberId,
    email: user.email,
    fullName: user.fullName,
    memberType: user.memberType,
    status: user.status,
    roles,
    permissions: Array.from(permissionsSet),
    department: user.department ? {
      id: user.department.id,
      name: user.department.name,
      code: user.department.code,
    } : null,
  };
}

/**
 * Validates whether user has a specific permission code.
 */
export function hasPermission(user: CurrentUserSession | null, permissionCode: string): boolean {
  if (!user) return false;
  if (user.roles.includes("SUPER_ADMIN")) return true;
  return user.permissions.includes(permissionCode);
}
