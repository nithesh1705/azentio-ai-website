/**
 * Employee Allowlist & Two-Gate Verification
 * Conformant to SOURCE_OF_TRUTH.md §6.3:
 * Gate 1: Verified @azentio.com email address.
 * Gate 2: Explicit entry in employee_allowlist.
 * Domain alone is NEVER sufficient.
 */

export const EMPLOYEE_ALLOWLIST: string[] = [
  'nithesh_m@azentio.com',
  'elena_vance@azentio.com',
  'marcus_vance@azentio.com',
  'sarah_jenkins@azentio.com',
  'ayman_haddad@azentio.com',
  'rahul_arora@azentio.com',
  'hari_v@azentio.com',
  'smitha_rao@azentio.com',
  'david_hamilton@azentio.com',
  'admin@azentio.com',
];

export function isVerifiedEmployeeEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  
  // Gate 1: Domain check
  if (!normalized.endsWith('@azentio.com')) {
    return false;
  }

  // Gate 2: Explicit Allowlist presence
  return EMPLOYEE_ALLOWLIST.includes(normalized);
}
