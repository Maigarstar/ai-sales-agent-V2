"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// The "as any" at the end fixes the build error
const QuillEditor = dynamic(() => import("react-quill"), {
  ssr: false,
}) as any;

export default function ReactQuillWrapper({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="w-full">
      <QuillEditor
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder="Write your email..."
      />
    </div>
  );
}