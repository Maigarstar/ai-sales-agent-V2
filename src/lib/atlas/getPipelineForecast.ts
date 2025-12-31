import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getPipelineForecast() {
  const { data, error } = await supabase.rpc("atlas_pipeline_forecast");

  if (error) {
    console.error("Forecast error", error);
    return [];
  }

  return data;
}
