"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Coins, 
  Download, 
  Loader2, 
  Search 
} from "lucide-react";
import { utils, writeFile } from "xlsx"; // npm install xlsx

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVolume, setTotalVolume] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchTransactions() {
      const { data, error } = await supabase
        .from("coin_transactions")
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && data) {
        setTransactions(data);
        setFiltered(data);
        const total = data.reduce((acc, curr) => acc + curr.amount, 0);
        setTotalVolume(Math.abs(total));
      }
      setLoading(false);
    }
    fetchTransactions();
  }, []);

  // Excel Export
  const handleExport = () => {
    const cleanData = filtered.map(tx => ({
      Date: new Date(tx.created_at).toLocaleDateString(),
      Time: new Date(tx.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      User: tx.profiles?.full_name || "Unknown",
      Email: tx.profiles?.email || "N/A",
      Description: tx.description || "",
      Amount: tx.amount
    }));

    const sheet = utils.json_to_sheet(cleanData);
    const book = utils.book_new();
    utils.book_append_sheet(book, sheet, "Transactions");
    writeFile(book, "coin_transactions.xlsx");
  };

  // Search logic
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) return setFiltered(transactions);
    const search = value.toLowerCase();
    const results = transactions.filter(
      (tx) =>
        tx.profiles?.full_name?.toLowerCase().includes(search) ||
        tx.profiles?.email?.toLowerCase().includes(search) ||
        tx.description?.toLowerCase().includes(search)
    );
    setFiltered(results);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#1F4D3E]" size={32} />
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#1F4D3E]">Coin Ledger</h1>
          <p className="text-gray-500 text-sm mt-1">
            Audit trail for all digital currency movement.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Download size={16} /> Export XLSX
          </button>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-[#1F4D3E] to-[#163C30] p-6 rounded-3xl text-white shadow-xl shadow-[#1F4D3E]/20">
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <Coins size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Total Volume (Last 100)
            </span>
          </div>
          <p className="text-4xl font-serif">{totalVolume.toLocaleString()}</p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center gap-2 mt-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-3 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by user, email, or description..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1F4D3E] transition-all"
          />
        </div>
        <p className="text-[11px] text-gray-400 italic">
          Last synced:{" "}
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  User
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Description
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-gray-400 italic"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50/30 transition-colors"
                  >
                    {/* Date */}
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(tx.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* User Column (Clickable) */}
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        {tx.profiles?.full_name ? (
                          <a
                            href={`/dashboard/admin/users/${tx.user_id}`}
                            className="text-sm font-semibold text-[#1F4D3E] hover:underline transition-colors"
                          >
                            {tx.profiles.full_name}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500 italic">
                            Unknown User
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">
                          {tx.profiles?.email}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-8 py-5">
                      <span className="text-xs text-gray-500 font-medium">
                        {tx.description}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-8 py-5 text-right">
                      <span
                        className={`text-sm font-bold ${
                          tx.amount < 0
                            ? tx.amount < -100
                              ? "text-red-700"
                              : "text-red-500"
                            : tx.amount > 100
                            ? "text-green-700"
                            : "text-green-600"
                        }`}
                      >
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
