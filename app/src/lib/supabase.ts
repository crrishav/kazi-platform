import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

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
