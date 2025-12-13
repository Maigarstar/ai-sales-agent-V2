'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/admin/leads', label: 'Vendor leads' },
  { href: '/admin/conversations', label: 'Concierge conversations' },
  { href: '/admin/chat', label: 'Live chat' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        marginBottom: 24,
        padding: '12px 20px',
        borderRadius: 8,
        border: '1px solid #e2e2e2',
        background: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div
        style={{
          fontFamily: 'Gilda Display, serif',
          fontSize: 18,
          color: '#183F34',
        }}
      >
        Admin workspace
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 13,
                textDecoration: 'none',
                border: isActive
                  ? '1px solid #183F34'
                  : '1px solid transparent',
                background: isActive ? '#183F34' : '#ffffff',
                color: isActive ? '#ffffff' : '#183F34',
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
