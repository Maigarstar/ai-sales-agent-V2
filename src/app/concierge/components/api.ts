export async function fetchConciergeListings(query: string) {
  const res = await fetch(
    `/api/concierge/listings?q=${encodeURIComponent(query)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch concierge listings");
  }

  return res.json();
}
