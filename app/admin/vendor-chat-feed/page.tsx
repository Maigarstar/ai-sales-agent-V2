'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type ConversationRow = {
  id: string;
  user_type: string | null;
  status: string | null;
  first_message: string | null;
  last_message: string | null;
  created_at: string;
  updated_at: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })
    : null;

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateLabel(value: string | null | undefined): string {
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

function getTypeLabel(row: ConversationRow): string {
  if (row.user_type === 'vendor') return 'Vendor';
  if (row.user_type === 'planning') return 'Planner or couple';
  return 'Unknown';
}

function getStatusLabel(status: string | null | undefined): string {
  const raw = (status || '').toLowerCase();
  if (raw === 'new' || raw === '') return 'New';
  if (raw === 'in_progress') return 'In progress';
  if (raw === 'done') return 'Done';
  return status || 'New';
}

function getMessageSnippet(row: ConversationRow): string {
  const source = row.first_message || row.last_message || '';
  if (!source) return 'No user message found';
  if (source.length <= 120) return source;
  return `${source.slice(0, 117)}...`;
}

function getContactSnippet(row: ConversationRow): string {
  const bits: string[] = [];
  if (row.contact_name) bits.push(row.contact_name);
  if (row.contact_email) bits.push(row.contact_email);
  if (row.contact_phone) bits.push(row.contact_phone);
  return bits.join(' · ');
}

/**
 * Small top menu that appears on all AI workspace pages.
 */
function WorkspaceTabs(props: { active: 'leads' | 'conversations' | 'live' }) {
  const baseStyle: React.CSSProperties = {
    fontSize: 12,
    borderRadius: 999,
    padding: '6px 14px',
    textDecoration: 'none',
    border: '1px solid transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const activeStyle: React.CSSProperties = {
    ...baseStyle,
    backgroundColor: '#183F34',
    color: '#ffffff',
    borderColor: '#183F34',
  };

  const inactiveStyle: React.CSSProperties = {
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

export default function LiveChatFeedPage() {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setErrorMessage(
        'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
      return;
    }

    let cancelled = false;

    async function loadInitial() {
      setLoading(true);
      setErrorMessage('');

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (cancelled) return;

      if (error) {
        console.error('Error loading live chat feed', error);
        setErrorMessage(
          `Could not load conversations for live chat: ${
            (error as any)?.message ?? 'Unknown error'
          }`
        );
      } else if (data) {
        setConversations(data as ConversationRow[]);
      }

      setLoading(false);
    }

    void loadInitial();

    const channel = supabase
      .channel('conversations-live-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        (payload) => {
          setConversations((current) => {
            const newRow = payload.new as ConversationRow | null;
            const oldRow = payload.old as ConversationRow | null;

            if (payload.eventType === 'INSERT' && newRow) {
              const exists = current.some((c) => c.id === newRow.id);
              if (exists) {
                return current.map((c) => (c.id === newRow.id ? newRow : c));
              }
              return [newRow, ...current];
            }

            if (payload.eventType === 'UPDATE' && newRow) {
              return current
                .map((c) => (c.id === newRow.id ? newRow : c))
                .sort((a, b) =>
                  a.updated_at < b.updated_at ? 1 : a.updated_at > b.updated_at ? -1 : 0
                );
            }

            if (payload.eventType === 'DELETE' && oldRow) {
              return current.filter((c) => c.id !== oldRow.id);
            }

            return current;
          });
        }
      )
      .subscribe();

  return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleStatusChange(id: string, newStatus: string) {
    if (!supabase) return;
    setPendingStatusId(id);

    const { error } = await supabase
      .from('conversations')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating conversation status', error);
      setErrorMessage(
        `Could not update conversation status: ${
          (error as any)?.message ?? 'Unknown error'
        }`
      );
    } else {
      setConversations((current) =>
        current.map((row) =>
          row.id === id ? { ...row, status: newStatus } : row
        )
      );
    }

    setPendingStatusId(null);
  }

  async function handleDeleteConversation(id: string) {
    setErrorMessage('');
    setDeletingId(id);

    try {
      const response = await fetch('/api/admin/delete-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: id }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || 'Unknown error');
      }

      setConversations((current) => current.filter((row) => row.id !== id));
    } catch (error: any) {
      console.error('Error deleting conversation from live chat', error);
      setErrorMessage(
        `Could not delete this conversation: ${
          error?.message ?? 'Unknown error'
        }`
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredConversations = conversations.filter((row) => {
    if (statusFilter === 'all') return true;
    const raw = (row.status || '').toLowerCase();
    if (statusFilter === 'new') return raw === '' || raw === 'new';
    if (statusFilter === 'in_progress') return raw === 'in_progress';
    if (statusFilter === 'done') return raw === 'done';
    return true;
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f7f4ef',
        padding: '32px 16px',
        boxSizing: 'border-box',
        fontFamily:
          '"Nunito Sans", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        {/* Admin workspace menu */}
        <WorkspaceTabs active="live" />

        {/* Header row */}
        <div
          style={{
            marginBottom: 18,
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
                fontSize: 28,
                fontWeight: 400,
                letterSpacing: -0.4,
                color: '#111',
              }}
            >
              Live chat
            </h1>
            <p
              style={{
                margin: '6px 0 0 0',
                fontSize: 13,
                color: '#666',
              }}
            >
              A live view of concierge conversations so you can step in as a
              human when needed and update the status as you go.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 6,
              fontSize: 12,
              color: '#555',
            }}
          >
            <label htmlFor="status-filter" style={{ marginBottom: 2 }}>
              Filter by status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                minWidth: 150,
                fontSize: 12,
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid #ddd',
                backgroundColor: '#fff',
              }}
            >
              {STATUS_FILTERS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMessage && (
          <div
            style={{
              marginBottom: 12,
              fontSize: 13,
              color: '#aa1111',
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Main card */}
        <div
          style={{
            borderRadius: 22,
            backgroundColor: '#ffffff',
            boxShadow: '0 14px 36px rgba(0,0,0,0.06)',
            border: '1px solid rgba(24,63,52,0.06)',
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 140px minmax(0, 1fr) 220px 90px',
              gap: 0,
              padding: '10px 18px',
              borderBottom: '1px solid #f0ebe1',
              fontSize: 11,
              color: '#8a8172',
            }}
          >
            <div>Created</div>
            <div>Type</div>
            <div>Message and contact</div>
            <div>Status and actions</div>
            <div style={{ textAlign: 'right' }}>Updated</div>
          </div>

          {loading && filteredConversations.length === 0 && (
            <div
              style={{
                padding: 18,
                fontSize: 13,
                color: '#666',
              }}
            >
              Loading live conversations.
            </div>
          )}

          {!loading && filteredConversations.length === 0 && (
            <div
              style={{
                padding: 18,
                fontSize: 13,
                color: '#666',
              }}
            >
              There are no conversations for this filter yet.
            </div>
          )}

          {filteredConversations.map((row) => (
            <div
              key={row.id}
              style={{
                borderTop: '1px solid #f4efe5',
                padding: '10px 18px',
                display: 'grid',
                gridTemplateColumns:
                  '160px 140px minmax(0, 1fr) 220px 90px',
                gap: 0,
                alignItems: 'center',
                fontSize: 13,
              }}
            >
              <div style={{ color: '#777' }}>
                {formatDateLabel(row.created_at)}
              </div>

              <div style={{ color: '#333' }}>{getTypeLabel(row)}</div>

              <div>
                <div style={{ color: '#333' }}>{getMessageSnippet(row)}</div>
                {getContactSnippet(row) && (
                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 11,
                      color: '#777',
                    }}
                  >
                    Contact: {getContactSnippet(row)}
                  </div>
                )}
              </div>

              <div>
                <div
                  style={{
                    marginBottom: 4,
                    fontSize: 12,
                    color: '#555',
                  }}
                >
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      backgroundColor:
                        (row.status || '').toLowerCase() === 'done'
                          ? '#e4f4ea'
                          : '#ffece3',
                      color:
                        (row.status || '').toLowerCase() === 'done'
                          ? '#1d6b3b'
                          : '#cc692b',
                      fontSize: 11,
                    }}
                  >
                    {getStatusLabel(row.status)}
                  </span>
                </div>
                <select
                  value={(row.status || 'new').toLowerCase()}
                  onChange={(e) =>
                    void handleStatusChange(row.id, e.target.value)
                  }
                  disabled={pendingStatusId === row.id}
                  style={{
                    width: '100%',
                    fontSize: 12,
                    padding: '5px 9px',
                    borderRadius: 999,
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>

                <div
                  style={{
                    marginTop: 6,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <Link
                    href={`/admin/conversations/${row.id}`}
                    style={{
                      fontSize: 12,
                      color: '#183F34',
                      textDecoration: 'none',
                    }}
                  >
                    View conversation
                  </Link>

                  <button
                    type="button"
                    onClick={() => void handleDeleteConversation(row.id)}
                    disabled={deletingId === row.id}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      fontSize: 12,
                      color: '#b42f2f',
                      cursor: deletingId === row.id ? 'default' : 'pointer',
                    }}
                  >
                    {deletingId === row.id ? 'Deleting' : 'Delete'}
                  </button>
                </div>
              </div>

              <div
                style={{
                  textAlign: 'right',
                  color: '#777',
                  fontSize: 12,
                }}
              >
                {formatDateTime(row.updated_at)}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            fontSize: 11,
            color: '#999',
            textAlign: 'right',
          }}
        >
          Powered by Taigenic AI
        </div>
      </div>
    </div>
  );
}
