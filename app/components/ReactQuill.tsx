"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const QuillEditor = dynamic(() => import("react-quill"), {
  ssr: false,
});

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
