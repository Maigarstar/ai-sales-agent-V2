// app/admin/vendor-applications/[id]/page.tsx

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type VendorApplication = {
  id: string;
  created_at: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  business_name: string | null;
  website: string | null;
  instagram: string | null;
  years_in_business: string | null;
  location: string | null;
  category: string | null;
  description: string | null;
  message_to_editorial_team: string | null;
  status: string | null;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function VendorApplicationPage({ params }: PageProps) {
  // 👈 params is a Promise in newer Next, so we await it
  const { id } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

  const rootStyle = {
    padding: "32px",
    maxWidth: "960px",
    margin: "0 auto",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  } as const;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase env vars in vendor-applications/[id]");
    return (
      <div style={rootStyle}>
        <Link href="/admin/vendor-applications" style={{ fontSize: 14 }}>
          ← Back to applications
        </Link>
        <h1 style={{ marginTop: 16, fontSize: 24 }}>Configuration error</h1>
        <p style={{ marginTop: 8, color: "#555" }}>
          Supabase environment variables are not configured.
        </p>
      </div>
    );
  }

  // Guard against weird urls like /admin/vendor-applications/undefined or "13."
  if (!id || id === "undefined") {
    return (
      <div style={rootStyle}>
        <Link href="/admin/vendor-applications" style={{ fontSize: 14 }}>
          ← Back to applications
        </Link>
        <h1 style={{ marginTop: 16, fontSize: 24 }}>Invalid application</h1>
        <p style={{ marginTop: 8, color: "#555" }}>
          The application id in the URL is not valid.
        </p>
      </div>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from("vendor_applications")
    .select("*")
    .eq("id", id)
    .single();

  const application = data as VendorApplication | null;

  if (error || !application) {
    console.error("SUPABASE DETAIL ERROR vendor_applications:", error);
    return (
      <div style={rootStyle}>
        <Link href="/admin/vendor-applications" style={{ fontSize: 14 }}>
          ← Back to applications
        </Link>
        <h1 style={{ marginTop: 16, fontSize: 24 }}>Application error</h1>
        <p style={{ marginTop: 8, color: "#555" }}>
          {error?.message || "Application not found."}
        </p>
      </div>
    );
  }

  return (
    <div style={rootStyle}>
      <Link href="/admin/vendor-applications" style={{ fontSize: 14 }}>
        ← Back to applications
      </Link>

      <h1 style={{ marginTop: 16, fontSize: 28, marginBottom: 4 }}>
        Vendor Application
      </h1>

      <p style={{ marginBottom: 24, color: "#555", fontSize: 14 }}>
        Submitted on{" "}
        {application.created_at
          ? new Date(application.created_at).toLocaleString("en-GB")
          : "Unknown date"}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <section>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Business details</h2>
          <div style={{ fontSize: 14, lineHeight: 1.7 }}>
            <p>
              <strong>Business name:</strong>{" "}
              {application.business_name || "Untitled"}
            </p>
            <p>
              <strong>Category:</strong> {application.category || "Not set"}
            </p>
            <p>
              <strong>Location:</strong> {application.location || "Not set"}
            </p>
            <p>
              <strong>Years in business:</strong>{" "}
              {application.years_in_business || "Not set"}
            </p>
            <p>
              <strong>Status:</strong> {application.status || "new"}
            </p>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Contact</h2>
          <div style={{ fontSize: 14, lineHeight: 1.7 }}>
            <p>
              <strong>Name:</strong> {application.name || "Not provided"}
            </p>
            <p>
              <strong>Email:</strong> {application.email || "Not provided"}
            </p>
            <p>
              <strong>Phone:</strong> {application.phone || "Not provided"}
            </p>
            <p>
              <strong>Website:</strong> {application.website || "Not provided"}
            </p>
            <p>
              <strong>Instagram:</strong>{" "}
              {application.instagram || "Not provided"}
            </p>
          </div>
        </section>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Business overview</h2>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {application.description || "No description provided."}
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>
          Message to editorial team
        </h2>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {application.message_to_editorial_team ||
            "No additional message was included."}
        </p>
      </section>
    </div>
  );
}
