"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle } from "lucide-react";
import OnboardingStep from "@/components/vendor/OnboardingStep";
import OnboardingProgress from "@/components/vendor/OnboardingProgress";

export default function VendorOnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    brand_name: "",
    website: "",
    contact_email: "",
    description: "",
  });

  const totalSteps = 3;

  const handleNext = async () => {
    if (step < totalSteps) return setStep(step + 1);

    // ✅ Final submission
    try {
      setLoading(true);
      const { error } = await supabase.from("vendor_applications").insert({
        ...form,
        status: "pending",
        submitted_at: new Date().toISOString(),
      });

      if (error) throw error;
      setStep(step + 1);
    } catch (err: any) {
      alert(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-6 font-sans">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-serif text-[#1F4D3E] mb-2">
          Partner Boutique Onboarding
        </h1>
        <p className="text-gray-500 text-sm">
          Begin your journey with Aura’s exclusive network of luxury wedding boutiques.
        </p>
      </div>

    {/* PROGRESS BAR */}
<OnboardingProgress currentStep={step} totalSteps={totalSteps} />

      {/* STEP CARD */}
      <div className="mt-10 bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-md p-8 transition-all">
        {step === 1 && (
          <OnboardingStep
            title="Your Brand Identity"
            description="Tell us about your boutique and what makes it special."
          >
            <input
              className="w-full p-3 mb-4 border rounded-xl text-sm focus:border-[#1F4D3E]"
              placeholder="Brand Name"
              value={form.brand_name}
              onChange={(e) =>
                setForm({ ...form, brand_name: e.target.value })
              }
            />
            <input
              className="w-full p-3 mb-4 border rounded-xl text-sm focus:border-[#1F4D3E]"
              placeholder="Website URL"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </OnboardingStep>
        )}

        {step === 2 && (
          <OnboardingStep
            title="Your Contact Information"
            description="Let’s stay connected. How can couples and our team reach you?"
          >
            <input
              className="w-full p-3 mb-4 border rounded-xl text-sm focus:border-[#1F4D3E]"
              placeholder="Contact Email"
              value={form.contact_email}
              onChange={(e) =>
                setForm({ ...form, contact_email: e.target.value })
              }
            />
            <textarea
              className="w-full p-3 border rounded-xl text-sm focus:border-[#1F4D3E]"
              placeholder="Describe your boutique in a few sentences"
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </OnboardingStep>
        )}

        {step === 3 && (
          <OnboardingStep
            title="Final Review"
            description="Review your information before submitting for approval."
          >
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Brand:</strong> {form.brand_name || "—"}
              </p>
              <p>
                <strong>Website:</strong> {form.website || "—"}
              </p>
              <p>
                <strong>Email:</strong> {form.contact_email || "—"}
              </p>
              <p>
                <strong>About:</strong> {form.description || "—"}
              </p>
            </div>
          </OnboardingStep>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle className="text-[#1F4D3E] mb-4" size={64} />
            <h2 className="text-2xl font-serif text-[#1F4D3E] mb-2">
              Application Submitted
            </h2>
            <p className="text-gray-500 text-sm">
              Thank you for joining the Aura network. Our team will review your
              application shortly.
            </p>
          </div>
        )}

        {step < 4 && (
          <button
            onClick={handleNext}
            disabled={loading}
            className="mt-8 w-full py-4 bg-[#1F4D3E] text-white font-bold rounded-2xl flex justify-center items-center gap-2 hover:bg-[#163C30] transition-all shadow-lg shadow-[#1F4D3E]/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Continue"}
          </button>
        )}
      </div>
    </div>
  );
}
