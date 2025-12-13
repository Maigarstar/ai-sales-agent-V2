'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

function getStatus(lead: VendorLeadRow): string {
  if (!lead.status) return 'New';
  const raw = String(lead.status).toLowerCase();

  if (raw === 'new') return 'New';
  if (raw === 'in_progress' || raw === 'in progress') return 'In progress';
  if (raw === 'contacted') return 'Contacted';
  if (raw === 'proposal' || raw === 'proposed') return 'Proposal';
  if (raw === 'won') return 'Won';
  if (raw === 'lost') return 'Lost';

  return lead.status;
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
  if (lead.budget_text) return String(lead.budget_text);
  if (lead.budget) return String(lead.budget);
  if (lead.price_level) return String(lead.price_level);
  return 'Not specified';
}

/**
 * Shared top menu for AI workspace.
 */
function WorkspaceTabs(props: { active: 'leads' | 'conversations' | 'live' }) {
  const baseStyle: CSSProperties = {
    fontSize: 12,
    borderRadius: 999,
    padding: '6px 14px',
    textDecoration: 'none',
    border: '1px solid transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const activeStyle: CSSProperties = {
    ...baseStyle,
    backgroundColor: '#183F34',
    color: '#ffffff',
    borderColor: '#183F34',
  };

  const inactiveStyle: CSSProperties = {
    ...baseStyle,
    backgroundColor: '#ffffff',
    color: '#183F34',
    borderColor: 'rgba(24,63,52,0.2)',
  };

  return (
    <div
      style={{
        marginBottom: 18,
      }}
    >
      <div
        style={{
          borderRadius: 18,
          backgroundColor: '#ffffff',
          border: '1px solid rgba(24,63,52,0.06)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.04)',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: '#777',
          }}
        >
          Admin workspace
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/admin/leads"
            style={props.active === 'leads' ? activeStyle : inactiveStyle}
          >
            Vendor leads
          </Link>
          <Link
            href="/admin/conversations"
            style={
              props.active === 'conversations' ? activeStyle : inactiveStyle
            }
          >
            Concierge conversations
          </Link>
          <Link
            href="/admin/vendor-chat-feed"
            style={props.active === 'live' ? activeStyle : inactiveStyle}
          >
            Live chat
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VendorLeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const id =
    Array.isArray(rawId) ? (rawId[0] as string) : (rawId as string | undefined);

  const [lead, setLead] = useState<VendorLeadRow | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteMessage, setDeleteMessage] = useState<string>('');

  useEffect(() => {
    async function loadLead(leadId: string) {
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
        .eq('id', leadId)
        .single();

      if (error) {
        console.error(
          'Error loading vendor lead detail',
          error,
          (error as any)?.message
        );
        setErrorMessage(
          `Could not load this vendor lead: ${
            (error as any)?.message ?? 'Unknown error'
          }`
        );
        setLoading(false);
        return;
      }

      if (data) {
        setLead(data as VendorLeadRow);
        setInternalNotes((data as any).internal_notes ?? '');
      }

      setLoading(false);
    }

    if (id) {
      void loadLead(id);
    } else {
      setErrorMessage('No lead id found in the route.');
    }
  }, [id]);

  async function handleSaveChanges() {
    if (!lead || !id || !supabase) return;
    setSaving(true);
    setSaveMessage('');
    setDeleteMessage('');

    const { error } = await supabase
      .from('vendor_leads')
      .update({ internal_notes: internalNotes })
      .eq('id', id);

    if (error) {
      console.error('Error saving vendor lead changes', error);
      setSaveMessage(
        `Could not save changes: ${
          (error as any)?.message ?? 'Unknown error'
        }`
      );
    } else {
      setSaveMessage('Changes saved for this lead.');
    }

    setSaving(false);
  }

  async function handleDeleteLead() {
    if (!id || deleting) return;

    try {
      setDeleting(true);
      setDeleteMessage('');
      setSaveMessage('');

      const res = await fetch('/api/admin/delete-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: id }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Failed to delete this lead');
      }

      setDeleteMessage('Lead deleted');

      setTimeout(() => {
        router.push('/admin/leads');
      }, 600);
    } catch (err: any) {
      console.error('Error deleting vendor lead', err);
      setDeleteMessage(
        `Could not delete this lead: ${err?.message ?? 'Unknown error'}`
      );
    } finally {
      setDeleting(false);
    }
  }

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
        <WorkspaceTabs active="leads" />

        {/* Header */}
        <div
          style={{
            marginBottom: 16,
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
              Vendor lead
            </h1>
            <p
              style={{
                margin: '6px 0 0 0',
                fontSize: 13,
                color: '#666',
              }}
            >
              Review this opportunity, then decide whether to follow up, nurture,
              or archive.
            </p>
          </div>

          <Link
            href="/admin/leads"
            style={{
              fontSize: 12,
              color: '#183F34',
              textDecoration: 'none',
              borderRadius: 999,
              border: '1px solid #183F34',
              padding: '6px 12px',
            }}
          >
            Back to vendor leads
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            borderRadius: 18,
            backgroundColor: '#ffffff',
            boxShadow: '0 14px 36px rgba(0,0,0,0.06)',
            border: '1px solid rgba(24,63,52,0.06)',
            padding: 20,
          }}
        >
          {loading && (
            <div
              style={{
                fontSize: 13,
                color: '#666',
              }}
            >
              Loading this vendor lead.
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

          {!loading && !errorMessage && !lead && (
            <div
              style={{
                fontSize: 13,
                color: '#666',
              }}
            >
              This vendor lead could not be found.
            </div>
          )}

          {!loading && !errorMessage && lead && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.4fr)',
                gap: 20,
              }}
            >
              {/* Left side: narrative */}
              <div>
                <div
                  style={{
                    marginBottom: 12,
                    fontSize: 13,
                    color: '#444',
                  }}
                >
                  <strong>Lead summary</strong>
                  <div
                    style={{
                      marginTop: 4,
                      padding: 10,
                      borderRadius: 12,
                      backgroundColor: '#f7f4ef',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {getSummary(lead) || (
                      <span
                        style={{
                          color: '#aaa',
                          fontStyle: 'italic',
                        }}
                      >
                        No summary or message stored.
                      </span>
                    )}
                  </div>
                </div>

                {lead.raw_conversation && (
                  <div
                    style={{
                      marginBottom: 12,
                      fontSize: 13,
                      color: '#444',
                    }}
                  >
                    <strong>Conversation notes</strong>
                    <div
                      style={{
                        marginTop: 4,
                        padding: 10,
                        borderRadius: 12,
                        backgroundColor: '#f7f4ef',
                        whiteSpace: 'pre-wrap',
                        maxHeight: 260,
                        overflowY: 'auto',
                      }}
                    >
                      {lead.raw_conversation}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: '#999',
                  }}
                >
                  Lead id: {lead.id}
                </div>
              </div>

              {/* Right side: meta and notes */}
              <div
                style={{
                  fontSize: 13,
                  color: '#444',
                }}
              >
                <div
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: '#777',
                      marginBottom: 2,
                    }}
                  >
                    Vendor
                  </div>
                  <div>{getVendorName(lead)}</div>
                  {getLocation(lead) && (
                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 12,
                        color: '#777',
                      }}
                    >
                      {getLocation(lead)}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: '#777',
                      marginBottom: 2,
                    }}
                  >
                    Contact
                  </div>
                  <div>
                    {lead.contact_name ||
                      lead.contact_person ||
                      lead.person ||
                      'Not set'}
                  </div>
                  {(lead.email || lead.contact_email) && (
                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 12,
                        color: '#777',
                      }}
                    >
                      {lead.email || lead.contact_email}
                    </div>
                  )}
                  {lead.phone && (
                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 12,
                        color: '#777',
                      }}
                    >
                      {lead.phone}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: '#777',
                      marginBottom: 2,
                    }}
                  >
                    Status
                  </div>
                  <div>{getStatus(lead)}</div>
                </div>

                <div
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: '#777',
                      marginBottom: 2,
                    }}
                  >
                    Score
                  </div>
                  <div>{getScore(lead)}</div>
                </div>

                <div
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: '#777',
                      marginBottom: 2,
                    }}
                  >
                    Budget level
                  </div>
                  <div>{getBudget(lead)}</div>
                </div>

                <div
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: '#777',
                      marginBottom: 2,
                    }}
                  >
                    Created
                  </div>
                  <div>
                    {formatDateTime(
                      lead.created_at ||
                        lead.inserted_at ||
                        lead.createdAt
                    )}
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: '#777',
                      marginBottom: 2,
                    }}
                  >
                    Last updated
                  </div>
                  <div>
                    {formatDateTime(
                      lead.updated_at ||
                        lead.modified_at ||
                        lead.updatedAt
                    )}
                  </div>
                </div>

                {/* Internal notes and actions */}
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: '1px solid #f0ebe1',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: '#777',
                      marginBottom: 4,
                    }}
                  >
                    Internal notes
                  </div>
                  <textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    rows={5}
                    style={{
                      width: '100%',
                      resize: 'vertical',
                      borderRadius: 12,
                      border: '1px solid #ddd',
                      padding: 10,
                      fontSize: 13,
                      fontFamily: '"Nunito Sans",system-ui,sans-serif',
                    }}
                  />

                  <div
                    style={{
                      marginTop: 8,
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleSaveChanges}
                      disabled={saving}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 999,
                        border: 'none',
                        backgroundColor: '#183F34',
                        color: '#ffffff',
                        fontSize: 13,
                        cursor: saving ? 'default' : 'pointer',
                      }}
                    >
                      {saving ? 'Saving' : 'Save changes'}
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteLead}
                      disabled={deleting}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 999,
                        border: '1px solid #cc4444',
                        backgroundColor: '#ffffff',
                        color: '#cc4444',
                        fontSize: 13,
                        cursor: deleting ? 'default' : 'pointer',
                      }}
                    >
                      {deleting ? 'Deleting' : 'Delete lead'}
                    </button>

                    {(saveMessage || deleteMessage) && (
                      <div
                        style={{
                          fontSize: 12,
                          color: deleteMessage
                            ? deleteMessage.startsWith('Could not')
                              ? '#aa1111'
                              : '#1c7a36'
                            : saveMessage.startsWith('Could not')
                            ? '#aa1111'
                            : '#1c7a36',
                        }}
                      >
                        {deleteMessage || saveMessage}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    fontSize: 12,
                    color: '#777',
                  }}
                >
                  This page now doubles as a light CRM for venues and vendors,
                  with status and notes you can adjust as conversations
                  progress.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
