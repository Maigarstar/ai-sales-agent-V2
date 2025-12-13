import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE ??
  '';

function getSupabase() {
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'Supabase server credentials are not configured for the admin lead creator.'
    );
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

export async function POST(req: Request) {
  try {
    const { conversationId } = (await req.json().catch(() => ({}))) as {
      conversationId?: string;
    };

    if (!conversationId) {
      return NextResponse.json(
        { ok: false, error: 'conversationId is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Load the source conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        {
          ok: false,
          error:
            convError?.message ??
            'Conversation not found for this conversationId',
        },
        { status: 404 }
      );
    }

    // Decide what to show as the vendor name
    const vendorName =
      conversation.user_type === 'vendor'
        ? conversation.contact_company ||
          conversation.contact_name ||
          'Vendor lead'
        : conversation.contact_name || 'Planner or couple';

    // Build a simple raw text copy of the chat
    const rawConversationParts: string[] = [];
    if (conversation.first_message) {
      rawConversationParts.push(
        `First message:\n${conversation.first_message}`
      );
    }
    if (conversation.last_message) {
      rawConversationParts.push(`Latest message:\n${conversation.last_message}`);
    }

    const { data: lead, error: leadError } = await supabase
      .from('vendor_leads')
      .insert({
        conversation_id: conversation.id,
        user_type: conversation.user_type ?? 'unknown',
        status: 'new',
        first_message: conversation.first_message,
        last_message: conversation.last_message,
        vendor_name: vendorName,
        contact_name: conversation.contact_name,
        contact_email: conversation.contact_email,
        contact_phone: conversation.contact_phone,
        budget_text: null,
        raw_conversation:
          rawConversationParts.length > 0
            ? rawConversationParts.join('\n\n')
            : null,
      })
      .select('id')
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        {
          ok: false,
          error:
            leadError?.message ??
            'Could not insert vendor lead from this conversation',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      leadId: lead.id,
    });
  } catch (error: any) {
    console.error('Error in create-vendor-lead-from-conversation', error);
    return NextResponse.json(
      {
        ok: false,
        error: error?.message ?? 'Server error while creating vendor lead',
      },
      { status: 500 }
    );
  }
}
