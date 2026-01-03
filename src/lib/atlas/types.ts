export type LeadPriority = "HOT" | "WARM" | "COOL";

export type AtlasVendorLeadInput = {
  // existing fields...
  stage: string;
  score: number;

  // add this
  priority: LeadPriority;
};
