import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vclkcpzuqkjkuuvttvoq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_-orNzeYnfbI9w3tu474zLg_Odwhnatr';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
