type ScoreBadgeProps = {
  score: number;
};

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  let label = "DISCOVERY";
  let background = "rgba(148,163,159,0.14)";
  let color = "#6B7280";

  if (score >= 85) {
    label = "PRIORITY";
    background = "rgba(197,160,89,0.18)";
    color = "#C5A059";
  } else if (score >= 70) {
    label = "QUALIFIED";
    background = "rgba(197,160,89,0.10)";
    color = "#9C7A2F";
  }

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "11px",
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: "999px",
        background,
        color,
        letterSpacing: "0.6px",
        whiteSpace: "nowrap"
      }}
    >
      {label}
    </span>
  );
}
