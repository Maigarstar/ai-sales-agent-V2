"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User, Store, Check } from "lucide-react";

export default function OnboardingPage() {
  const [role, setRole] = useState<"couple" | "vendor">("couple");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: name,
      phone_number: phone,
      user_type: role,
      onboarding_complete: true,
      updated_at: new Date()
    });

    if (!error) router.push("/wedding-concierge");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
        <h2 className="text-2xl font-serif text-[#1F4D3E] text-center mb-6">Tell us about yourself</h2>
        
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setRole("couple")}
            className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'couple' ? 'border-[#1F4D3E] bg-green-50' : 'border-gray-100'}`}
          >
            <User size={24} className={role === 'couple' ? 'text-[#1F4D3E]' : 'text-gray-400'} />
            <span className="font-bold text-sm">I'm a Couple</span>
          </button>
          <button 
            onClick={() => setRole("vendor")}
            className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'vendor' ? 'border-[#1F4D3E] bg-green-50' : 'border-gray-100'}`}
          >
            <Store size={24} className={role === 'vendor' ? 'text-[#1F4D3E]' : 'text-gray-400'} />
            <span className="font-bold text-sm">I'm a Vendor</span>
          </button>
        </div>

        <div className="space-y-4">
          <input 
            placeholder="Full Name" 
            className="w-full p-3 bg-gray-50 border rounded-xl outline-none"
            value={name} onChange={(e) => setName(e.target.value)}
          />
          <input 
            placeholder="Phone Number" 
            className="w-full p-3 bg-gray-50 border rounded-xl outline-none"
            value={phone} onChange={(e) => setPhone(e.target.value)}
          />
          <button 
            onClick={saveProfile}
            className="w-full py-4 bg-[#1F4D3E] text-white rounded-xl font-bold hover:bg-[#163C30]"
          >
            Finish Setup
          </button>
        </div>
      </div>
    </div>
  );
}