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
      // Map the DB column 'password_hash' to the TypeScript field 'passwordHash'
      // NEVER expose this hash to the client — server-side only
      passwordHash: row.password_hash,
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

/**
 * Insert a contact enquiry into Supabase 'contact_enquiries' table
 */
export async function insertContactEnquiryToSupabase(enquiry: {
  fullName: string;
  workEmail: string;
  companyName: string;
  country: string;
  interestDomain: string;
  message: string;
  phone?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const row: Record<string, any> = {
      full_name: enquiry.fullName,
      work_email: enquiry.workEmail,
      company_name: enquiry.companyName,
      country: enquiry.country || 'Global',
      interest_domain: enquiry.interestDomain || 'General',
      message: enquiry.message,
    };

    if (enquiry.phone) {
      row.phone = enquiry.phone;
    }

    // Try inserting with phone first
    const res = await supabase.from('contact_enquiries').insert([row]);
    if (res.error) {
      // If phone column doesn't exist (PGRST204), fallback by appending phone to message
      if (res.error.code === 'PGRST204' && row.phone) {
        delete row.phone;
        row.message = `[Phone: ${enquiry.phone}]\n\n${enquiry.message}`;
        const fallbackRes = await supabase.from('contact_enquiries').insert([row]);
        if (fallbackRes.error) {
          return { success: false, error: fallbackRes.error.message };
        }
        return { success: true };
      }
      return { success: false, error: res.error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Database error' };
  }
}

