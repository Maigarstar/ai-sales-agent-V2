'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AdminNav } from '../AdminNav';

type VendorLeadRow = {
  [key: string]: any;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })
    : null;

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getVendorName(lead: VendorLeadRow): string {
  return (
    lead.vendor_name ||
    lead.business_name ||
    lead.company_name ||
    lead.venue_name ||
    lead.contact_name ||
    'Unnamed vendor'
  );
}

function getLocation(lead: VendorLeadRow): string {
  return lead.location || lead.city || lead.region || lead.country || '';
}

function getSummary(lead: VendorLeadRow): string {
  return (
    lead.last_message ||
    lead.first_message ||
    lead.notes ||
    lead.summary ||
    lead.message ||
    ''
  );
}

function getStatusLabel(rawStatus: any): string {
  if (!rawStatus) return 'New';
  const value = String(rawStatus).toLowerCase();

  if (value === 'new') return 'New';
  if (value === 'in_progress' || value === 'in progress') return 'In progress';
  if (value === 'contacted') return 'Contacted';
  if (value === 'proposal' || value === 'proposed') return 'Proposal';
  if (value === 'won') return 'Won';
  if (value === 'lost') return 'Lost';

  return String(rawStatus);
}

function getStatusPillStyle(
  rawStatus: any
): { background: string; color: string; border: string } {
  const value = String(rawStatus ?? 'new').toLowerCase();

  if (value === 'new') {
    return {
      background: 'rgba(24,63,52,0.08)',
      color: '#183F34',
      border: '1px solid rgba(24,63,52,0.18)',
    };
  }
  if (value === 'in_progress' || value === 'in progress' || value === 'contacted') {
    return {
      background: 'rgba(200,161,101,0.08)',
      color: '#7b5a2e',
      border: '1px solid rgba(200,161,101,0.26)',
    };
  }
  if (value === 'proposal' || value === 'proposed') {
    return {
      background: 'rgba(81,99,149,0.08)',
      color: '#3d4a73',
      border: '1px solid rgba(81,99,149,0.26)',
    };
  }
  if (value === 'won') {
    return {
      background: 'rgba(38,121,67,0.09)',
      color: '#24663a',
      border: '1px solid rgba(38,121,67,0.26)',
    };
  }
  if (value === 'lost') {
    return {
      background: 'rgba(160,49,49,0.06)',
      color: '#a03131',
      border: '1px solid rgba(160,49,49,0.22)',
    };
  }

  return {
    background: '#f0f0f0',
    color: '#444',
    border: '1px solid #e0e0e0',
  };
}

function getScore(lead: VendorLeadRow): string {
  const scoreValue =
    typeof lead.score === 'number'
      ? lead.score
      : typeof lead.lead_score === 'number'
      ? lead.lead_score
      : null;

  if (scoreValue == null) return 'Unscored';
  return `${scoreValue.toFixed(0)}/10`;
}

function getBudget(lead: VendorLeadRow): string {
  if (lead.budget_band) return String(lead.budget_band);
  if (lead.budget_text) return String(lead.budget_text);
  if (lead.budget) return String(lead.budget);
  if (lead.price_level) return String(lead.price_level);
  return 'Not specified';
}

function getUserTypeLabel(rawType: any): string {
  const value = String(rawType ?? '').toLowerCase();
  if (value === 'vendor') return 'Vendor';
  if (value === 'planning') return 'Planner or couple';
  return 'Unknown';
}

export default function VendorLeadsPage() {
  const [leads, setLeads] = useState<VendorLeadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'new' | 'in_progress' | 'contacted' | 'proposal' | 'won' | 'lost'
  >('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'vendor' | 'planning'>(
    'all'
  );
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadLeads() {
      if (!supabase) {
        setErrorMessage(
          'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
        );
        return;
      }

      setLoading(true);
      setErrorMessage('');

      const { data, error } = await supabase
        .from('vendor_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading vendor leads', error);
        setErrorMessage(
          `Could not load vendor leads from Supabase: ${
            (error as any)?.message ?? 'Unknown error'
          }`
        );
        setLoading(false);
        return;
      }

      setLeads((data ?? []) as VendorLeadRow[]);
      setLoading(false);
    }

    void loadLeads();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const rawStatus = String(lead.status ?? 'new').toLowerCase();
    const rawType = String(lead.user_type ?? '').toLowerCase();

    if (statusFilter !== 'all') {
      if (statusFilter === 'in_progress') {
        if (rawStatus !== 'in_progress' && rawStatus !== 'in progress') {
          return false;
        }
      } else if (statusFilter === 'proposal') {
        if (rawStatus !== 'proposal' && rawStatus !== 'proposed') {
          return false;
        }
      } else if (rawStatus !== statusFilter) {
        return false;
      }
    }

    if (typeFilter !== 'all') {
      if (rawType !== typeFilter) return false;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const combined = `${getVendorName(lead)} ${getLocation(
        lead
      )} ${getSummary(lead)} ${lead.email || ''} ${
        lead.contact_name || ''
      }`.toLowerCase();

      if (!combined.includes(term)) return false;
    }

    return true;
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f7f4ef',
        padding: '32px 16px',
        boxSizing: 'border-box',
        fontFamily: '"Nunito Sans",system-ui,sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        {/* Admin workspace menu */}
        <AdminNav />

        {/* Header */}
        <div
          style={{
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: '"Playfair Display","Gilda Display",serif',
                fontSize: 26,
                fontWeight: 400,
                letterSpacing: -0.4,
                color: '#111',
              }}
            >
              Vendor leads
            </h1>
            <p
              style={{
                margin: '6px 0 0 0',
                fontSize: 13,
                color: '#666',
              }}
            >
              A light CRM view of the conversations your concierge believes are
              worth your attention.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            {[
              { key: 'all', label: 'All' },
              { key: 'new', label: 'New' },
              { key: 'in_progress', label: 'In progress' },
              { key: 'contacted', label: 'Contacted' },
              { key: 'proposal', label: 'Proposal' },
              { key: 'won', label: 'Won' },
              { key: 'lost', label: 'Lost' },
            ].map((item) => {
              const active = statusFilter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setStatusFilter(item.key as typeof statusFilter)
                  }
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    border: active
                      ? '1px solid #183F34'
                      : '1px solid rgba(0,0,0,0.08)',
                    backgroundColor: active ? '#183F34' : '#ffffff',
                    color: active ? '#ffffff' : '#444',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              marginLeft: 'auto',
            }}
          >
            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as typeof typeFilter)
              }
              style={{
                fontSize: 12,
                padding: '5px 8px',
                borderRadius: 999,
                border: '1px solid rgba(0,0,0,0.16)',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="all">All types</option>
              <option value="vendor">Vendors</option>
              <option value="planning">Planners or couples</option>
            </select>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name, text or email"
              style={{
                fontSize: 12,
                padding: '5px 10px',
                borderRadius: 999,
                border: '1px solid rgba(0,0,0,0.16)',
                minWidth: 180,
              }}
            />
          </div>
        </div>

        {/* Card list */}
        <div
          style={{
            borderRadius: 18,
            backgroundColor: '#ffffff',
            boxShadow: '0 14px 36px rgba(0,0,0,0.06)',
            border: '1px solid rgba(24,63,52,0.06)',
            padding: 14,
          }}
        >
          {loading && (
            <div
              style={{
                fontSize: 13,
                color: '#666',
              }}
            >
              Loading vendor leads.
            </div>
          )}

          {errorMessage && !loading && (
            <div
              style={{
                fontSize: 13,
                color: '#a11',
              }}
            >
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && filteredLeads.length === 0 && (
            <div
              style={{
                fontSize: 13,
                color: '#777',
              }}
            >
              There are no vendor leads that match these filters yet.
            </div>
          )}

          {!loading && !errorMessage && filteredLeads.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {filteredLeads.map((lead) => {
                const statusStyle = getStatusPillStyle(lead.status);
                return (
                  <Link
                    key={lead.id}
                    href={`/admin/leads/${lead.id}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0,2.5fr) minmax(0,1.3fr)',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: '1px solid rgba(0,0,0,0.04)',
                      backgroundColor: '#faf9f6',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    {/* Left side: name and summary */}
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          marginBottom: 2,
                          color: '#222',
                        }}
                      >
                        {getVendorName(lead)}
                        {getLocation(lead) && (
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 400,
                              color: '#777',
                              marginLeft: 6,
                            }}
                          >
                            · {getLocation(lead)}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#666',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                        title={getSummary(lead)}
                      >
                        {getSummary(lead) || (
                          <span
                            style={{
                              color: '#aaa',
                              fontStyle: 'italic',
                            }}
                          >
                            No summary text stored yet.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side: meta */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 4,
                        fontSize: 12,
                        color: '#555',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 999,
                            fontSize: 11,
                            ...statusStyle,
                          }}
                        >
                          {getStatusLabel(lead.status)}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: '#777',
                          }}
                        >
                          {getUserTypeLabel(lead.user_type)}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: '#777',
                          }}
                        >
                          Score: {getScore(lead)}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: '#777',
                          }}
                        >
                          Budget: {getBudget(lead)}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          color: '#999',
                        }}
                      >
                        {formatDateTime(
                          lead.created_at ||
                            lead.inserted_at ||
                            lead.createdAt
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
