type CoupleProfile = {
  wedding_date?: string;
  wedding_date_range?: string;
  location?: string;
  aesthetic?: string[];
  budget_range?: string;
};

type QualificationAnswers = {
  timeline?: string;
  aesthetic?: string;
  budget?: string;
};

type AvailabilityInfo = {
  status?: "available" | "limited" | "peak";
  priority_dates?: string[];
};

type BusinessContext = {
  business_name: string;
  categories?: string[];
  price_positioning?: string;
};

export function buildLeadContext({
  couple,
  answers,
  availability,
  business
}: {
  couple: CoupleProfile;
  answers: QualificationAnswers;
  availability?: AvailabilityInfo;
  business: BusinessContext;
}) {
  const lines: string[] = [];

  // Lead overview
  lines.push("Lead Overview:");

  if (couple.wedding_date || couple.wedding_date_range) {
    lines.push(
      `Couple is planning a wedding in ${
        couple.wedding_date_range || couple.wedding_date
      }.`
    );
  }

  if (couple.location) {
    lines.push(`Preferred location is ${couple.location}.`);
  }

  if (answers.aesthetic) {
    lines.push(`Aesthetic direction is ${answers.aesthetic}.`);
  }

  if (answers.budget) {
    lines.push(`Investment range is ${answers.budget}.`);
  }

  // Engagement
  lines.push("");
  lines.push("Engagement details:");
  lines.push("Couple completed Aura qualification and registered.");
  lines.push("They unlocked vendor recommendations.");

  // Business relevance
  lines.push("");
  lines.push("Business relevance:");
  lines.push(
    `This business (${business.business_name}) aligns with the couple’s stated preferences.`
  );

  // Availability
  if (availability?.status) {
    lines.push("");
    lines.push("Availability context:");
    lines.push(`Availability status: ${availability.status}.`);

    if (availability.priority_dates?.length) {
      lines.push(
        `Priority dates identified: ${availability.priority_dates.join(", ")}.`
      );
    }
  }

  return lines.join("\n");
}
