"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  Globe,
  Mail,
  Building2,
} from "lucide-react";

type VendorApplication = {
  id: string;
  brand_name: string;
  website: string;
  contact_email: string;
  description: string;
  status: string;
  submitted_at: string;
};

export default function AdminVendorsPage() {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ✅ Fetch all applications
  useEffect(() => {
    async function fetchApplications() {
      try {
        const { data, error } = await supabase
          .from("vendor_applications")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (error) throw error;
        setApplications(data || []);
      } catch (err) {
        console.error("Error fetching vendor applications:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  // ✅ Handle Approve / Reject / Delete
  const handleStatusChange = async (id: string, status: string) => {
    try {
      setActionLoading(id);
      const { error } = await supabase
        .from("vendor_applications")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: status } : app
        )
      );
    } catch (err) {
      alert("Action failed, please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      const { error } = await supabase
        .from("vendor_applications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert("Error deleting record.");
    }
  };

  // ✅ Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#1F4D3E]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#1F4D3E]">
            Vendor Applications
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review and manage boutique submissions to the Aura network.
          </p>
        </div>
        <div className="text-sm text-gray-400 italic">
          Last synced: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Brand
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Website
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Contact
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Description
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                Status / Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {applications.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-400 py-10 italic"
                >
                  No vendor applications yet.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-gray-50/40 transition-all"
                >
                  <td className="px-6 py-5 font-medium text-gray-900 flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400" />
                    {app.brand_name}
                  </td>
                  <td className="px-6 py-5 text-sm text-blue-600">
                    {app.website ? (
                      <a
                        href={app.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline"
                      >
                        <Globe size={14} />
                        {app.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {app.contact_email ? (
                      <a
                        href={`mailto:${app.contact_email}`}
                        className="flex items-center gap-1 text-gray-700 hover:underline"
                      >
                        <Mail size={14} /> {app.contact_email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {app.description || "—"}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {actionLoading === app.id ? (
                      <Loader2
                        className="animate-spin text-[#1F4D3E]"
                        size={18}
                      />
                    ) : (
                      <div className="flex justify-end gap-2">
                        {app.status === "approved" ? (
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            Approved
                          </span>
                        ) : app.status === "rejected" ? (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                            Rejected
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(app.id, "approved")
                              }
                              className="p-2 text-green-600 hover:bg-green-50 rounded-xl"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(app.id, "rejected")
                              }
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
