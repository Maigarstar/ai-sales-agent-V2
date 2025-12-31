export default function isVendorIntent(message: string): boolean {
  if (!message) return false;

  const vendorSignals = [
    "vendor",
    "venue",
    "pricing",
    "price",
    "cost",
    "availability",
    "listing",
    "feature",
    "promotion",
    "advertising",
    "join",
    "membership"
  ];

  const text = message.toLowerCase();

  return vendorSignals.some(signal => text.includes(signal));
}
