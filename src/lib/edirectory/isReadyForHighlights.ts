export function isReadyForHighlights(reply: string): boolean {
  const readinessSignals = [
    "show me",
    "recommend",
    "venues",
    "options",
    "suggest",
    "where should",
    "what venues",
  ];

  const text = reply.toLowerCase();
  return readinessSignals.some(signal => text.includes(signal));
}
