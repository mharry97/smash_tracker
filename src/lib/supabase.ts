import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xqzgnvoolksvgkdkoqeg.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
