import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminBusinessPage({ params }: PageProps) {
  // App Router params are async
  const { id } = await params;

  // ✅ FIX: cookies() is async in your Next version
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: business, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !business) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Business not found</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>{business.company_name}</h1>

      <p>
        <strong>Email:</strong> {business.email}
      </p>

      <p>
        <strong>Role:</strong> {business.role}
      </p>

      <p>
        <strong>Status:</strong> {business.active ? "Active" : "Inactive"}
      </p>
    </div>
  );
}
