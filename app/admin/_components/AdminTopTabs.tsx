'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Vendor leads', href: '/admin/leads' },
  { label: 'Concierge conversations', href: '/admin/conversations' },
  { label: 'Live chat', href: '/admin/chat' },
]

export default function AdminTopTabs() {
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white px-6 py-4">
      <div className="text-[#21312b]">Admin workspace</div>

      <div className="flex items-center gap-2">
        {tabs.map((t) => {
          const active = pathname === t.href
          return (
            <Link
              key={t.href}
              href={t.href}
              className={[
                'rounded-full px-4 py-2 text-sm transition',
                active ? 'bg-[#183F34] text-white' : 'bg-[#f3f1ec] text-[#21312b]',
              ].join(' ')}
            >
              {t.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
