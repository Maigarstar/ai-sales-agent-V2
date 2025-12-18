// app/signup/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Sign up",
  description: "Create your account.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
        <p className="text-sm text-gray-600 mt-2">
          You will confirm your email, then complete onboarding.
        </p>

        <div className="mt-6">
          {/* Replace this block with your real sign up form component */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700">
            Add your Supabase sign up form here.
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-[#1F4D3E] font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
