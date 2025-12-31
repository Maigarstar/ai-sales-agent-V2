"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

export default function HtmlEditorClient({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!mounted || !editor) return null;

  return (
    <div className="border rounded-lg p-3 bg-white">

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <ToolbarButton editor={editor} command="toggleBold" label="Bold" />
        <ToolbarButton editor={editor} command="toggleItalic" label="Italic" />
        <ToolbarButton editor={editor} command="toggleUnderline" label="Underline" />
        <ToolbarButton
          editor={editor}
          command="toggleHeading"
          args={{ level: 2 }}
          label="H2"
        />
        <ToolbarButton editor={editor} command="toggleBulletList" label="Bullet" />

        <button
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
          onClick={() => {
            const url = prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Link
        </button>

        <button
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          Clear Link
        </button>
      </div>

      {/* Editor Content Box */}
      <div
        className="min-h-[220px] border rounded-md p-3 cursor-text"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent
          editor={editor}
          className="tiptap-editor outline-none"
        />
      </div>

      <style>{`
        .tiptap-editor {
          min-height: 180px; 
          line-height: 1.6;
        }
        .tiptap-editor:focus {
          outline: none;
        }
      `}</style>

    </div>
  );
}

function ToolbarButton({ editor, command, args, label }: any) {
  return (
    <button
      className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
      onClick={() =>
        args
          ? editor.chain().focus()[command](args).run()
          : editor.chain().focus()[command]().run()
      }
    >
      {label}
    </button>
  );
}
