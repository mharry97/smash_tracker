import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xqzgnvoolksvgkdkoqeg.supabase.co"; // Replace with your Supabase URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxemdudm9vbGtzdmdrZGtvcWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjY5MTksImV4cCI6MjA1NjAwMjkxOX0.0HKGLMDVRhwVmGsFeOWmBDMfn4FkI0uR7NGsFEaYZ1M"; // Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
