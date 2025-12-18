import { redirect } from "next/navigation";

export default function DashboardRedirect() {
  // Instantly redirect users to your Wedding Concierge
  redirect("/wedding-concierge");
}
