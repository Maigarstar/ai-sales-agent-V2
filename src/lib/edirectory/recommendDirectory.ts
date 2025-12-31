// src/lib/edirectory/recommendDirectory.ts

type RecommendationIntent = {
  destination?: string;
  style?: string[];
  season?: string;
  tier?: "entry" | "premium" | "ultra";
  limit?: number;
};

export type DirectoryRecommendation = {
  id: string;
  title: string;
  location: string;
  image: string | null;
  reason: string;
};

export async function recommendDirectory(
  intent: RecommendationIntent
): Promise<DirectoryRecommendation[]> {

  const limit = intent.limit ?? 3;

  /**
   * IMPORTANT
   * This is NOT search.
   * These are curated, editorial rules.
   * You will later replace this with DB logic.
   */

  const curatedPool: DirectoryRecommendation[] = [
    {
      id: "villa-como-001",
      title: "Private Lakefront Villa",
      location: "Lake Como, Italy",
      image: "/images/venues/lake-como-villa.jpg",
      reason:
        "A rare private estate with direct lake access, ideal for refined spring celebrations with understated elegance."
    },
    {
      id: "masseria-puglia-002",
      title: "Restored Puglian Masseria",
      location: "Puglia, Italy",
      image: "/images/venues/puglia-masseria.jpg",
      reason:
        "Authentic architecture and warm Mediterranean atmosphere, perfect for couples seeking character without excess."
    },
    {
      id: "chateau-provence-003",
      title: "Historic Provençal Château",
      location: "Provence, France",
      image: "/images/venues/provence-chateau.jpg",
      reason:
        "Timeless symmetry and gardens that frame celebrations beautifully in late spring and early summer."
    }
  ];

  // Simple editorial filtering example
  let results = curatedPool;

  if (intent.destination) {
    results = results.filter(r =>
      r.location.toLowerCase().includes(intent.destination!.toLowerCase())
    );
  }

  return results.slice(0, limit);
}
