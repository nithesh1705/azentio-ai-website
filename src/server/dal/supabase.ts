import { createClient } from '@supabase/supabase-js';
import { UserRecord, Organisation } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vclkcpzuqkjkuuvttvoq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_-orNzeYnfbI9w3tu474zLg_Odwhnatr';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch all users from Supabase PostgreSQL table 'users'
 * Falls back to null if the table does not exist yet.
 */
export async function fetchUsersFromSupabase(): Promise<UserRecord[] | null> {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error || !data) {
      return null;
    }
    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      orgId: row.org_id,
      role: row.role,
      platformGrants: row.platform_grants || [],
      memberships: row.memberships || [],
      isVerifiedEmployee: row.is_verified_employee,
      avatar: row.avatar,
      createdAt: row.created_at,
    }));
  } catch {
    return null;
  }
}

/**
 * Fetch all organisations from Supabase PostgreSQL table 'organisations'
 * Falls back to null if table does not exist yet.
 */
export async function fetchOrganisationsFromSupabase(): Promise<Organisation[] | null> {
  try {
    const { data, error } = await supabase.from('organisations').select('*');
    if (error || !data) {
      return null;
    }
    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      domain: row.domain,
      tier: row.tier,
      entitledOfferings: row.entitled_offerings || [],
      memberCount: row.member_count || 0,
      synthetic: row.synthetic,
      type: row.type,
    }));
  } catch {
    return null;
  }
}
