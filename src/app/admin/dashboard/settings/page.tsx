import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";

export default async function SettingsPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ padding: "40px", maxWidth: "800px" }}>
      <header style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "Gilda Display, serif",
            color: "#183F34",
            fontSize: "32px",
          }}
        >
          Settings
        </h1>
        <p style={{ color: "#666" }}>
          Manage your account preferences and security.
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Notifications</h2>

          <div style={settingRowStyle}>
            <div>
              <div style={settingLabelStyle}>Email Alerts</div>
              <div style={settingDescStyle}>
                Receive updates about new leads and messages.
              </div>
            </div>

            <input type="checkbox" defaultChecked />
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Security</h2>

          <div style={settingRowStyle}>
            <div>
              <div style={settingLabelStyle}>Password</div>
              <div style={settingDescStyle}>
                Update your login credentials.
              </div>
            </div>

            <button style={outlineButtonStyle}>Change Password</button>
          </div>
        </section>
      </div>
    </div>
  );
}

/* === Styles === */

const sectionStyle = {
  padding: "24px",
  backgroundColor: "#fff",
  borderRadius: "12px",
  border: "1px solid #eee",
};

const sectionTitleStyle = {
  fontSize: "18px",
  marginBottom: "20px",
  color: "#183F34",
  fontWeight: "600",
};

const settingRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const settingLabelStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#333",
};

const settingDescStyle = {
  fontSize: "13px",
  color: "#777",
};

const outlineButtonStyle = {
  padding: "8px 16px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  backgroundColor: "transparent",
  fontSize: "13px",
  cursor: "pointer",
};
