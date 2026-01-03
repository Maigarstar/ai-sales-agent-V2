import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type NewLeadEmailInput = {
  to: string;
  businessName: string;
  leadId: string;
  coupleName: string | null;
  weddingDate: string | null;
  location: string | null;
  atlasSummary: string | null;
};

export async function sendNewLeadEmail({
  to,
  businessName,
  leadId,
  coupleName,
  weddingDate,
  location,
  atlasSummary
}: NewLeadEmailInput) {
  const subject = `New verified wedding lead`;

  const body = `
Hello ${businessName},

You have received a new verified wedding enquiry.

Couple: ${coupleName ?? "Not specified"}
Wedding date: ${weddingDate ?? "Not specified"}
Location: ${location ?? "Not specified"}

Atlas summary:
${atlasSummary ?? "No summary available"}

View full lead:
${process.env.APP_URL}/dashboard/leads/${leadId}

This lead was qualified by Taigenic AI.

`;

  await resend.emails.send({
    from: "Taigenic <leads@taigenic.ai>",
    to,
    subject,
    text: body
  });
}
