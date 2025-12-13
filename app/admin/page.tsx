"use client";

import React from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="h-full w-full p-6 lg:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your AI sales pipeline, vendor activity and performance insights.
        </p>
      </div>

      {/* Concierge workspace, now directly under the header and boxed */}
      <section className="mb-10">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 lg:p-7 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Concierge workspace
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
              Shortcuts to manage vendor leads, review full concierge
              conversations and step into live chat when a human reply is
              needed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vendor leads card */}
            <WorkspaceCard
              title="Vendor leads"
              body="Review qualified vendors from the concierge, update their status and add notes as they move toward a partnership."
              href="/admin/leads"
              cta="Open vendor leads"
            />

            {/* Concierge conversations card */}
            <WorkspaceCard
              title="Concierge conversations"
              body="Read full conversations with couples and venues, then create or update lead cards from a single place."
              href="/admin/conversations"
              cta="View conversations"
            />

            {/* Live chat card */}
            <WorkspaceCard
              title="Live chat takeover"
              body="Watch conversations as they happen and step in personally when a couple or venue needs tailored guidance."
              href="/admin/live-chat"
              cta="Open live chat"
            />
          </div>
        </div>
      </section>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <DashboardCard
          title="New Leads Today"
          value="12"
          change="+18 percent"
          positive
        />

        <DashboardCard
          title="Hot Leads"
          value="4"
          change="+33 percent"
          positive
        />

        <DashboardCard title="Vendors Joined" value="3" change="Stable" />

        <DashboardCard
          title="AI Agent Accuracy"
          value="92 percent"
          change="+3 percent"
          positive
        />
      </div>

      {/* Two Column Main */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead Quality */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Lead Quality Overview
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Snapshot of AI graded leads over the past seven days.
          </p>

          <div className="grid grid-cols-3 gap-4">
            <QualityBox label="Hot" value="9" color="bg-emerald-500" />
            <QualityBox label="Warm" value="17" color="bg-amber-500" />
            <QualityBox label="Cold" value="5" color="bg-gray-400" />
          </div>
        </div>

        {/* Vendor Activity */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Vendor Activity
          </h2>

          <ul className="space-y-4">
            <VendorItem
              name="Bella Weddings Italy"
              action="Submitted application"
              time="2h ago"
            />
            <VendorItem
              name="Cygnus Events"
              action="Updated profile"
              time="6h ago"
            />
            <VendorItem
              name="MR Music Italy"
              action="New inquiry"
              time="1d ago"
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- */
/*  COMPONENTS  */
/* --------------------------------- */

function DashboardCard({
  title,
  value,
  change,
  positive,
}: {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm transition hover:shadow-md">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      <p
        className={`mt-1 text-xs font-medium ${
          positive
            ? "text-emerald-600"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {change}
      </p>
    </div>
  );
}

function QualityBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl p-5 bg-gray-50 dark:bg-gray-800 shadow-sm flex flex-col items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition">
      <div className={`w-4 h-4 rounded-full ${color} mb-3`} />
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
  );
}

function VendorItem({
  name,
  action,
  time,
}: {
  name: string;
  action: string;
  time: string;
}) {
  return (
    <li className="flex items-start">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {action}
        </p>
      </div>
      <span className="text-xs text-gray-400 dark:text-gray-500">
        {time}
      </span>
    </li>
  );
}

function WorkspaceCard({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {body}
        </p>
      </div>
      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-emerald-800 text-white hover:bg-emerald-900 transition"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}
