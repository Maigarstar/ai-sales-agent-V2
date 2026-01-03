export async function updateLeadStatus(
  leadId: string,
  status: "new" | "contacted" | "archived"
) {
  const res = await fetch(`/api/admin/leads/${leadId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });

  if (!res.ok) {
    throw new Error("Failed to update lead status");
  }

  return true;
}
