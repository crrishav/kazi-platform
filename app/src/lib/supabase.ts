import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Guard: don't throw at module load when env vars are absent (e.g. during static build)
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : ({ from: () => ({ insert: async () => ({ error: null }), select: async () => ({ data: null, error: null }), eq: () => ({ data: null, error: null, single: async () => ({ data: null, error: null }) }) }) } as any);

// Product type definition
export interface Product {
  id: string;
  name: string;
  slug: string;
  price_gbp: number;
  colors: string[] | null;
  is_gender_neutral: boolean;
  image_url: string;
  created_at?: string;
}

// Newsletter subscriber type
export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at?: string;
}
