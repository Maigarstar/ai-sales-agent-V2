"use client";

import { X, Plus } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ConciergeSidebar({ open, onClose }: Props) {
  return (
    <aside
      className={`h-full transition-all duration-300 overflow-hidden border-r
        ${open ? "w-[280px]" : "w-0"}
        bg-[#121413] border-white/5`}
    >
      <div className="w-[280px] h-full p-6 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <p className="text-[10px] tracking-widest uppercase opacity-50">
            Private Collection
          </p>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <button className="rounded-full py-3 text-xs uppercase tracking-widest bg-[#183F34] text-white flex items-center justify-center gap-2">
          <Plus size={14} />
          New Session
        </button>
      </div>
    </aside>
  );
}
