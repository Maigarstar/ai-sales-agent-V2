/**
 * ATLAS NOTIFICATIONS
 * iPower email escalation for HOT leads only
 * Never blocks Atlas flow
 */

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.IPOWER_SMTP_HOST!,
  port: Number(process.env.IPOWER_SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.IPOWER_SMTP_USER!,
    pass: process.env.IPOWER_SMTP_PASS!,
  },
});

type HotLeadPayload = {
  businessName: string;
  category: string;
  location: string;
  contactName: string;
  contactEmail: string;
  website?: string;
};

/**
 * Sends a discreet priority alert to Marco
 */
export async function sendHotLeadAlert(
  lead: HotLeadPayload,
  score: number
) {
  const message = `
A priority partner has been identified by Atlas.

Business:
${lead.businessName}

Category:
${lead.category}

Location:
${lead.location}

Score:
${score}/100

Primary Contact:
${lead.contactName}
${lead.contactEmail}

Website:
${lead.website || "Not provided"}

View full lead profile:
https://5starweddingdirectory.com/admin/leads
`;

  try {
    await transporter.sendMail({
      from: `"Atlas – 5 Star Weddings" <sales@5starweddingdirectory.com>`,
      to: process.env.MARCO_EMAIL!,
      subject: `Atlas Priority Partner: ${lead.businessName}`,
      text: message,
    });
  } catch (error) {
    // Atlas must never fail because email failed
    console.error("Atlas email alert failed", error);
  }
}
