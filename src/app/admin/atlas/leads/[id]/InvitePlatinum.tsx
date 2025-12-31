export default function InvitePlatinum({ isHot }: { isHot: boolean }) {
  if (!isHot) return null;

  return (
    <button className="mt-12 px-6 py-3 border border-[#C5A059] rounded-full text-xs uppercase tracking-widest font-black text-[#C5A059] hover:bg-[#C5A059]/10">
      Invite to Platinum
    </button>
  );
}
