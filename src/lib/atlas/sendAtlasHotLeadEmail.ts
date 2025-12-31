/**
 * ATLAS SALES ALERT SYSTEM
 * Quiet email escalation for priority partners (Score ≥ 80)
 * Uses iPower SMTP
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

export async function sendAtlasHotLeadEmail(payload: {
  businessName: string;
  category: string;
  location: string;
  contactName: string;
  contactEmail: string;
  website?: string;
  atlasNotes?: string;
  score: number;
}) {
  const message = `
A priority partner has been identified by Atlas.

Business:
${payload.businessName}

Category:
${payload.category}

Location:
${payload.location}

Score:
${payload.score}/100

Primary Contact:
${payload.contactName}
${payload.contactEmail}

Website:
${payload.website || "Not provided"}

Internal Atlas Note:
${payload.atlasNotes || "Aligned with premium inclusion criteria"}

View full lead profile:
https://5starweddingdirectory.com/admin/leads
`;

  try {
    await transporter.sendMail({
      from: `"Atlas – 5 Star Weddings" <sales@5starweddingdirectory.com>`,
      to: process.env.MARCO_EMAIL!,
      subject: `Atlas Priority Partner: ${payload.businessName}`,
      text: message,
    });
  } catch (error) {
    console.error("Atlas email alert failed", error);
  }
}
