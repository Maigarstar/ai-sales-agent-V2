"use client";

import dynamic from "next/dynamic";

const HtmlEditorClient = dynamic(
  () => import("../HtmlEditorClient"),
  { ssr: false }
);

export default function HtmlEditor({
  value,
  onChange
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return <HtmlEditorClient value={value} onChange={onChange} />;
}
