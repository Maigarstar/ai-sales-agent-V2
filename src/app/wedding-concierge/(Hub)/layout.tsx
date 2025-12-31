// app/wedding-concierge/(hub)/layout.tsx
export const dynamic = "force-dynamic";

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#112620]">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-start justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}