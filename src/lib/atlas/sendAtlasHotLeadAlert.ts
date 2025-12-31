/**
 * ATLAS SALES ALERT SYSTEM
 * Quiet escalation for priority partners (Score ≥ 80)
 */

export async function sendAtlasHotLeadAlert(lead: {
  businessName: string;
  category: string;
  location: string;
  contactName: string;
  contactEmail: string;
  website?: string;
  atlasNotes?: string;
}, score: number) {
  const payload = {
    text: [
      "🔥 *Atlas Priority Partner Identified*",
      "",
      `*Business:* ${lead.businessName}`,
      `*Category:* ${lead.category}`,
      `*Location:* ${lead.location}`,
      `*Score:* ${score}/100`,
      "",
      `*Contact:* ${lead.contactName} (${lead.contactEmail})`,
      `*Website:* ${lead.website || "Not provided"}`,
      lead.atlasNotes ? `*Atlas note:* ${lead.atlasNotes}` : "",
      "",
      "_Atlas has identified this partner as aligned with premium inclusion criteria._",
      "",
      "<https://5starweddingdirectory.com/admin/leads|View full lead profile>",
    ]
      .filter(Boolean)
      .join("\n"),
  };

  try {
    await fetch(process.env.SLACK_SALES_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Atlas Slack alert failed", error);
  }
}
