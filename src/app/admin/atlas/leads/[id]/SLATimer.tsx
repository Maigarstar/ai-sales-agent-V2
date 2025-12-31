export default function SLATimer({
  stageEnteredAt,
}: {
  stageEnteredAt: string | null;
}) {
  if (!stageEnteredAt) return null;

  const diff =
    Date.now() - new Date(stageEnteredAt).getTime();

  const hours = Math.floor(diff / 1000 / 60 / 60);

  return (
    <div className="text-[11px] uppercase tracking-widest opacity-40">
      Time in stage: {hours}h
    </div>
  );
}
