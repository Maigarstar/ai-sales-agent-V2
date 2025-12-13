import React from "react";

export default function AdminSettingsPage() {
  return (
    <div className="h-full w-full">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage organisation details, AI preferences and integration keys.
        </p>
      </div>

      {/* Content shell */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Brand profile
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Company name, website, main contact and logo settings will live here.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            AI configuration
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Model choice, tone of voice and safety settings will live here.
          </p>
        </div>
      </div>
    </div>
  );
}
