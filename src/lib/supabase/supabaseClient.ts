import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,      // must end with !
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // must end with !
  {
    db: {
      schema: "public",
    },
  }
);
