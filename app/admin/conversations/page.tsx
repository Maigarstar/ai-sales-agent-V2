'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AdminNav } from '../AdminNav';

type ConversationRow = {
  id: string;
  user_type: string;
  status: string;
  first_message: string | null;
  last_message: string | null;
  created_at: string;
  updated_at: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_company?: string | null;
  wedding_date?: string | null;
};

type TypeFilter = 'all' | 'vendor' | 'planning';
type StatusFilter = 'all' | 'new' | 'in_progress' | 'done';

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

function getMessageSnippet(conversation: ConversationRow): string {
  const raw =
    conversation.last_message ||
    conversation.first_message ||
    'No text yet';
  if (!raw) return '';
  if (raw.length <= 100) return raw;
  return raw.slice(0, 100) + '…';
}

function getStatusLabel(raw: string | null | undefined): string {
  if (!raw) return 'New';
  const value = String(raw).toLowerCase();
  if (value === 'new') return 'New';
  if (value === 'in_progress' || value === 'in progress') return 'In progress';
  if (value === 'done' || value === 'closed') return 'Done';
  return raw;
}

function buildContactSummary(conversation: ConversationRow): string {
  const parts: string[] = [];
  if (conversation.contact_name) parts.push(conversation.contact_name);
  if (conversation.contact_company) parts.push(conversation.contact_company);
  if (conversation.contact_email) parts.push(conversation.contact_email);
  if (conversation.contact_phone) parts.push(conversation.contact_phone);
  return parts.join(' · ');
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    async function loadConversations() {
      if (!supabase) {
        setErrorMessage(
          'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
        );
        return;
      }

      setLoading(true);
      setErrorMessage('');

      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(200);

        if (error) {
          console.error('Error loading conversations', error);
          setErrorMessage(
            `Could not load conversations from Supabase: ${
              (error as any)?.message ?? 'Unknown error'
            }`
          );
          setConversations([]);
        } else if (data) {
          setConversations(data as ConversationRow[]);
        }
      } catch (err: any) {
        console.error('Unexpected error loading conversations', err);
        setErrorMessage(
          `Could not load conversations from Supabase: ${
            err?.message ?? 'Unknown error'
          }`
        );
        setConversations([]);
      } finally {
        setLoading(false);
      }
    }

    void loadConversations();
  }, []);

  const filtered = conversations.filter((conversation) => {
    if (typeFilter === 'vendor' && conversation.user_type !== 'vendor') {
      return false;
    }
    if (typeFilter === 'planning' && conversation.user_type !== 'planning') {
      return false;
    }

    const rawStatus = String(conversation.status || '').toLowerCase();
    if (
      statusFilter === 'new' &&
      rawStatus !== 'new'
    ) {
      return false;
    }
    if (
      statusFilter === 'in_progress' &&
      rawStatus !== 'in_progress' &&
      rawStatus !== 'in progress'
    ) {
      return false;
    }
    if (
      statusFilter === 'done' &&
      rawStatus !== 'done' &&
      rawStatus !== 'closed'
    ) {
      return false;
    }

    if (searchTerm.trim()) {
      const haystack = [
        conversation.first_message || '',
        conversation.last_message || '',
        conversation.contact_name || '',
        conversation.contact_email || '',
        conversation.contact_company || '',
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(searchTerm.trim().toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const totalCount = conversations.length;
  const visibleCount = filtered.length;

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchTerm(event.target.value);
  }

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
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <AdminNav />

        <div
          style={{
            marginBottom: 18,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
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
              Concierge Conversations
            </h1>
            <p
              style={{
                margin: '6px 0 0 0',
                fontSize: 13,
                color: '#666',
              }}
            >
              Recent vendor and planning chats from the 5 Star Weddings
              concierge.
            </p>
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#777',
            }}
          >
            Showing {visibleCount} of {totalCount} conversations
          </div>
        </div>

        {/* Filters and search */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            {/* type filter */}
            {(['all', 'vendor', 'planning'] as TypeFilter[]).map((value) => {
              const isActive = typeFilter === value;
              const labelMap: Record<TypeFilter, string> = {
                all: 'All types',
                vendor: 'Vendor',
                planning: 'Planning',
              };
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTypeFilter(value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: isActive
                      ? '1px solid #183F34'
                      : '1px solid #e0d9cd',
                    backgroundColor: isActive ? '#183F34' : '#f7f4ef',
                    color: isActive ? '#ffffff' : '#555',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {labelMap[value]}
                </button>
              );
            })}

            {/* status filter */}
            {(
              ['all', 'new', 'in_progress', 'done'] as StatusFilter[]
            ).map((value) => {
              const isActive = statusFilter === value;
              const labelMap: Record<StatusFilter, string> = {
                all: 'All status',
                new: 'New',
                in_progress: 'In progress',
                done: 'Done',
              };
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: isActive
                      ? '1px solid #C8A165'
                      : '1px solid #e0d9cd',
                    backgroundColor: isActive ? '#C8A165' : '#f7f4ef',
                    color: isActive ? '#ffffff' : '#555',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {labelMap[value]}
                </button>
              );
            })}
          </div>

          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search message or contact"
              style={{
                minWidth: 260,
                padding: '8px 12px',
                borderRadius: 999,
                border: '1px solid #d5cdc0',
                fontSize: 13,
              }}
            />
          </div>
        </div>

        {/* Table card */}
        <div
          style={{
            borderRadius: 22,
            backgroundColor: '#ffffff',
            boxShadow: '0 14px 36px rgba(0,0,0,0.06)',
            border: '1px solid rgba(24,63,52,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 120px 100px minmax(0, 1fr) 140px',
              padding: '10px 18px',
              fontSize: 12,
              color: '#777',
              backgroundColor: '#f9f4ec',
            }}
          >
            <div>Created</div>
            <div>Type</div>
            <div>Status</div>
            <div>Message and contact</div>
            <div style={{ textAlign: 'right' }}>Updated</div>
          </div>

          {/* content */}
          {loading && (
            <div
              style={{
                padding: 16,
                fontSize: 13,
                color: '#666',
              }}
            >
              Loading conversations from Supabase.
            </div>
          )}

          {errorMessage && !loading && (
            <div
              style={{
                padding: 16,
                fontSize: 13,
                color: '#aa1111',
              }}
            >
              {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && filtered.length === 0 && (
            <div
              style={{
                padding: 16,
                fontSize: 13,
                color: '#666',
              }}
            >
              There are no conversations that match these filters yet.
            </div>
          )}

          {!loading &&
            !errorMessage &&
            filtered.map((conversation) => {
              const contactSummary = buildContactSummary(conversation);
              return (
                <Link
                  key={conversation.id}
                  href={`/admin/conversations/${conversation.id}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '140px 120px 100px minmax(0, 1fr) 140px',
                    padding: '12px 18px',
                    borderTop: '1px solid #f0ebe1',
                    fontSize: 13,
                    color: '#222',
                    textDecoration: 'none',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div>{formatDateTime(conversation.created_at)}</div>

                  <div>
                    {conversation.user_type === 'vendor'
                      ? 'Planning'
                      : conversation.user_type === 'planning'
                      ? 'Planning'
                      : conversation.user_type || 'Unknown'}
                  </div>

                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: 11,
                        backgroundColor: '#fff5ef',
                        color: '#b65b18',
                      }}
                    >
                      {getStatusLabel(conversation.status)}
                    </span>
                  </div>

                  <div>
                    <div>{getMessageSnippet(conversation)}</div>
                    {contactSummary && (
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          color: '#777',
                        }}
                      >
                        Contact: {contactSummary}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                    }}
                  >
                    {formatDateTime(conversation.updated_at)}
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
