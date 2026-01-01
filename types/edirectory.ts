/**
 * =========================================================
 * Global eDirectory Types
 * =========================================================
 * Single source of truth for all directory listings
 * Used by chat, search, vendors, and API bridges
 * =========================================================
 */

export type DirectoryItem = {
  /** Primary identifier */
  id: string;

  /** Display title (venue name, business name, etc.) */
  title: string;

  /** High level category */
  category?: string;

  /** Location label */
  location?: string;

  /** Full description or excerpt */
  description?: string;

  /** Main cover image */
  image?: string;

  /** Gallery images */
  gallery?: string[];

  /** Public website or listing URL */
  url?: string;

  /** Price indicator or range */
  priceRange?: string;

  /** Average rating */
  rating?: number;

  /** Search and AI tags */
  tags?: string[];

  /** Vendor classification */
  vendorType?:
    | "venue"
    | "planner"
    | "photographer"
    | "videographer"
    | "florist"
    | "supplier"
    | string;

  /** Geography */
  country?: string;
  region?: string;
  city?: string;

  /** Visibility flags */
  featured?: boolean;
  verified?: boolean;
};
