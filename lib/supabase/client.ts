import { createClient } from "@supabase/supabase-js";

// Cliente do Supabase para uso no browser (componentes client)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);