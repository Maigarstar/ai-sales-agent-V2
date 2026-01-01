import Link from "next/link";
import { getSupabaseAdmin } from "src/lib/supabase/admin";

type VendorApplication = {
  id: string;
  created_at: string | null;
  name: string | null;
  email: string | null;
  business_name: string | null;
  status: string | null;
};

export const dynamic = "force-dynamic";

export default async function AdminVendorApplicationsPage() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("vendor_applications")
    .select("id, created_at, name, email, business_name, status")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div style={{ padding: 32 }}>
        <h1>Vendor Applications</h1>
        <p style={{ color: "red" }}>Error loading applications.</p>
        <pre style={{ marginTop: 16, fontSize: 12 }}>{error.message}</pre>
      </div>
    );
  }

  const applications = (data || []) as VendorApplication[];

  return (
    <div style={{ padding: 32, maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Vendor Applications</h1>
      <p style={{ marginBottom: 24, color: "#555", fontSize: 14 }}>
        Total applications: {applications.length}
      </p>

      {applications.length === 0 ? (
        <p style={{ color: "#777" }}>No applications yet.</p>
      ) : (
        <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 2fr 1fr 1fr",
              padding: "10px 16px",
              background: "#fafafa",
              fontSize: 13,
              fontWeight: 600,
              borderBottom: "1px solid #eee",
            }}
          >
            <div>Business</div>
            <div>Contact</div>
            <div>Date</div>
            <div>Status</div>
            <div>View</div>
          </div>

          {applications.map((app) => (
            <div
              key={app.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 2fr 1fr 1fr",
                padding: "12px 16px",
                fontSize: 13,
                borderBottom: "1px solid #f2f2f2",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  {app.business_name || "Untitled"}
                </div>
                <div style={{ color: "#777" }}>ID: {app.id}</div>
              </div>

              <div>
                <div>{app.name || "No name"}</div>
                <div style={{ color: "#777" }}>{app.email || "No email"}</div>
              </div>

              <div style={{ color: "#555" }}>
                {app.created_at
                  ? new Date(app.created_at).toLocaleString("en-GB")
                  : "Unknown"}
              </div>

              <div style={{ textTransform: "capitalize" }}>
                {app.status || "new"}
              </div>

              <div>
                <Link
                  href={`/admin/vendor-applications/${app.id}`}
                  style={{
                    fontSize: 13,
                    color: "#183F34",
                    textDecoration: "underline",
                  }}
                >
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
