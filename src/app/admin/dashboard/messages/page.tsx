import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase";

export default async function MessagesPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch only messages belonging to this specific user
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading conversations:", error);
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1000px" }}>
      <header style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "Gilda Display, serif",
            color: "#183F34",
            fontSize: "32px",
          }}
        >
          Your Conversations
        </h1>
        <p style={{ color: "#666" }}>
          Review your chats with the Aura AI Concierge.
        </p>
      </header>

      {conversations?.length === 0 ? (
        <div style={emptyStateStyle}>
          <p>
            No messages yet. Start a conversation with our concierge to get
            started.
          </p>
          <Link href="/wedding-concierge" style={actionButtonStyle}>
            Start Chatting
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {conversations?.map((chat) => (
            <Link
              key={chat.id}
              href={`/dashboard/messages/${chat.id}`}
              style={chatRowStyle}
            >
              <div>
                <div style={{ fontWeight: "600", color: "#183F34" }}>
                  {chat.subject || "Wedding Inquiry"}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#888",
                    marginTop: "4px",
                  }}
                >
                  {new Date(chat.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ color: "#999", fontSize: "20px" }}>→</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* === Styles === */

const chatRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
  backgroundColor: "#fff",
  borderRadius: "12px",
  border: "1px solid #eee",
  textDecoration: "none",
  transition: "transform 0.1s ease",
};

const emptyStateStyle = {
  padding: "60px",
  textAlign: "center" as const,
  backgroundColor: "#fff",
  borderRadius: "12px",
  border: "1px dashed #ccc",
  color: "#777",
};

const actionButtonStyle = {
  display: "inline-block",
  marginTop: "20px",
  padding: "10px 24px",
  backgroundColor: "#183F34",
  color: "#fff",
  borderRadius: "8px",
  textDecoration: "none",
};
