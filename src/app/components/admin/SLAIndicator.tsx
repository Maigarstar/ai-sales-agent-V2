export default function SLAIndicator({ enteredAt }: { enteredAt: string }) {
  const hours =
    (Date.now() - new Date(enteredAt).getTime()) / 36e5;

  let status = "green";
  if (hours > 72) status = "red";
  else if (hours > 24) status = "amber";

  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          status === "green"
            ? "bg-emerald-500"
            : status === "amber"
            ? "bg-amber-400"
            : "bg-red-500"
        }`}
      />
      <span className="text-[10px] uppercase tracking-widest opacity-60">
        SLA {Math.floor(hours)}h
      </span>
    </div>
  );
}
