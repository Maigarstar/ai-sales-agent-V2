'use client';

import { useEffect, useState, FormEvent } from 'react';

type UserType = 'vendor' | 'planning';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Step = 'role' | 'details' | 'chat';

type ContactDetails = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  website: string;
  venueOrLocation: string;
  weddingDate: string;
  consentGiven: boolean;
};

const OUTER_WRAPPER_STYLE: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#f7f4ef',
  padding: '32px 16px 40px 16px',
  boxSizing: 'border-box',
};

const INNER_WRAPPER_STYLE: React.CSSProperties = {
  maxWidth: 900,
  margin: '0 auto',
};

export default function ChatPage() {
  const [step, setStep] = useState<Step>('role');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [contact, setContact] = useState<ContactDetails>({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    website: '',
    venueOrLocation: '',
    weddingDate: '',
    consentGiven: false,
  });

  const [conversationId, setConversationId] = useState<string | null>(null);

  function handleSelectUserType(nextType: UserType) {
    setUserType(nextType);
    setStep('details');
  }

  function handleBackToRole() {
    setUserType(null);
    setStep('role');
  }

  function handleStartConcierge() {
    if (!userType) return;
    if (!contact.name.trim() || !contact.email.trim() || !contact.consentGiven) {
      return;
    }
    setStep('chat');
  }

  return (
    <div style={OUTER_WRAPPER_STYLE}>
      <div style={INNER_WRAPPER_STYLE}>
        {step === 'role' && (
          <RoleChoiceStep onSelectUserType={handleSelectUserType} />
        )}

        {step === 'details' && userType && (
          <DetailsStep
            userType={userType}
            contact={contact}
            onChangeContact={setContact}
            onStart={handleStartConcierge}
            onBack={handleBackToRole}
          />
        )}

        {step === 'chat' && userType && (
          <ChatStep
            userType={userType}
            contact={contact}
            conversationId={conversationId}
            onConversationId={setConversationId}
            onBackToDetails={() => setStep('details')}
          />
        )}
      </div>
    </div>
  );
}

/**
 * STEP 1, choose vendor or planning
 */
function RoleChoiceStep(props: { onSelectUserType: (type: UserType) => void }) {
  const { onSelectUserType } = props;

  return (
    <div
      style={{
        borderRadius: 32,
        backgroundColor: '#ffffff',
        padding: '32px 32px 40px 32px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.06)',
        border: '1px solid rgba(24,63,52,0.06)',
      }}
    >
      {/* Centered hero block */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 28,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: 8,
            fontFamily: '"Playfair Display","Gilda Display",serif',
            fontSize: 32,
            fontWeight: 400,
            letterSpacing: -0.8,
            color: '#111',
          }}
        >
          5 Star Wedding AI Concierge
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: '"Nunito Sans",system-ui,sans-serif',
            fontSize: 16,
            color: '#555',
            maxWidth: 720,
            lineHeight: 1.6,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          A calm and discreet assistant for luxury venues, vendors and couples, here
          to offer clear, considered guidance in a conversational way.
        </p>
        <div
          style={{
            fontSize: 32,
            lineHeight: 1,
            color: '#444',
            marginTop: 18,
          }}
        >
          
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 18,
        }}
      >
        <button
          type="button"
          onClick={() => onSelectUserType('vendor')}
          style={{
            padding: '20px 22px',
            borderRadius: 28,
            border: '1px solid #183F34',
            backgroundColor: '#183F34',
            color: '#ffffff',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              fontFamily: '"Nunito Sans",system-ui,sans-serif',
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            I am a Wedding Vendor
          </div>
          <div
            style={{
              fontFamily: '"Nunito Sans",system-ui,sans-serif',
              fontSize: 14,
              opacity: 0.92,
            }}
          >
            Venues, planners, photographers and specialist vendors
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectUserType('planning')}
          style={{
            padding: '20px 22px',
            borderRadius: 28,
            border: '1px solid #C8A165',
            backgroundColor: '#ffffff',
            color: '#111',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              fontFamily: '"Nunito Sans",system-ui,sans-serif',
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            I am Planning a Wedding
          </div>
          <div
            style={{
              fontFamily: '"Nunito Sans",system-ui,sans-serif',
              fontSize: 14,
              color: '#555',
            }}
          >
            Couples, parents and friends, from first ideas to final details
          </div>
        </button>
      </div>

      <div
        style={{
          marginTop: 18,
          fontSize: 11,
          fontFamily: '"Nunito Sans",system-ui,sans-serif',
          color: '#999',
          textAlign: 'right',
        }}
      >
        Powered by Taigenic AI
      </div>
    </div>
  );
}

/**
 * STEP 2, contact details
 */
function DetailsStep(props: {
  userType: UserType;
  contact: ContactDetails;
  onChangeContact: (next: ContactDetails) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  const { userType, contact, onChangeContact, onStart, onBack } = props;

  const canStart =
    contact.name.trim() &&
    contact.email.trim() &&
    contact.consentGiven;

  function update(field: keyof ContactDetails, value: string | boolean) {
    onChangeContact({
      ...contact,
      [field]: value,
    } as ContactDetails);
  }

  return (
    <div
      style={{
        borderRadius: 32,
        backgroundColor: '#ffffff',
        padding: '28px 32px 34px 32px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.06)',
        border: '1px solid rgba(24,63,52,0.06)',
      }}
    >
      <button
        type="button"
        onClick={onBack}
        style={{
          borderRadius: 999,
          border: '1px solid #ddd',
          backgroundColor: '#fafafa',
          padding: '6px 12px',
          fontSize: 12,
          fontFamily: '"Nunito Sans",system-ui,sans-serif',
          cursor: 'pointer',
          marginBottom: 18,
        }}
      >
        Change who I am
      </button>

      <h2
        style={{
          margin: 0,
          marginBottom: 8,
          fontFamily: '"Playfair Display","Gilda Display",serif',
          fontSize: 30,
          fontWeight: 400,
          letterSpacing: -0.6,
          color: '#111',
        }}
      >
        A few details before we start
      </h2>

      <p
        style={{
          margin: 0,
          marginBottom: 22,
          fontFamily: '"Nunito Sans",system-ui,sans-serif',
          fontSize: 15,
          color: '#555',
          maxWidth: 720,
        }}
      >
        This keeps your concierge session personal, and lets us follow up in a
        professional way.
      </p>

      {/* Name */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: 'block',
            fontFamily: '"Nunito Sans",system-ui,sans-serif',
            fontSize: 13,
            marginBottom: 4,
            color: '#333',
          }}
        >
          Name
        </label>
        <input
          type="text"
          value={contact.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Your name or lead contact"
          style={inputStyle}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: 'block',
            fontFamily: '"Nunito Sans",system-ui,sans-serif',
            fontSize: 13,
            marginBottom: 4,
            color: '#333',
          }}
        >
          Email
        </label>
        <input
          type="email"
          value={contact.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="We will keep this private"
          style={inputStyle}
        />
      </div>

      {/* Phone plus second field varies by user type */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: 16,
          marginBottom: 14,
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: '"Nunito Sans",system-ui,sans-serif',
              fontSize: 13,
              marginBottom: 4,
              color: '#333',
            }}
          >
            Phone number
          </label>
          <input
            type="tel"
            value={contact.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="Best number for a quick follow up"
            style={inputStyle}
          />
        </div>

        {userType === 'vendor' ? (
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: '"Nunito Sans",system-ui,sans-serif',
                fontSize: 13,
                marginBottom: 4,
                color: '#333',
              }}
            >
              Company name
            </label>
            <input
              type="text"
              value={contact.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              placeholder="Your venue or brand"
              style={inputStyle}
            />
          </div>
        ) : (
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: '"Nunito Sans",system-ui,sans-serif',
                fontSize: 13,
                marginBottom: 4,
                color: '#333',
              }}
            >
              Venue or location
            </label>
            <input
              type="text"
              value={contact.venueOrLocation}
              onChange={(e) => update('venueOrLocation', e.target.value)}
              placeholder="For example Tuscany, Lake Como, London"
              style={inputStyle}
            />
          </div>
        )}
      </div>

      {/* Website for vendors */}
      {userType === 'vendor' && (
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: 'block',
              fontFamily: '"Nunito Sans",system-ui,sans-serif',
              fontSize: 13,
              marginBottom: 4,
              color: '#333',
            }}
          >
            Website address (optional)
          </label>
          <input
            type="text"
            value={contact.website}
            onChange={(e) => update('website', e.target.value)}
            placeholder="For example kayonresort.com"
            style={inputStyle}
          />
        </div>
      )}

      {/* Wedding date for couples */}
      {userType === 'planning' && (
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: 'block',
              fontFamily: '"Nunito Sans",system-ui,sans-serif',
              fontSize: 13,
              marginBottom: 4,
              color: '#333',
            }}
          >
            Wedding date (optional)
          </label>
          <input
            type="text"
            value={contact.weddingDate}
            onChange={(e) => update('weddingDate', e.target.value)}
            placeholder="For example 21 June 2027"
            style={inputStyle}
          />
        </div>
      )}

      {/* Consent */}
      <div
        style={{
          marginTop: 8,
          marginBottom: 18,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          fontFamily: '"Nunito Sans",system-ui,sans-serif',
          fontSize: 12,
          color: '#555',
          maxWidth: 760,
        }}
      >
        <input
          id="concierge-consent"
          type="checkbox"
          checked={contact.consentGiven}
          onChange={(e) => update('consentGiven', e.target.checked)}
          style={{ marginTop: 3 }}
        />
        <label htmlFor="concierge-consent">
          I understand that all information I enter here will be stored on the
          website, but will not be publicly visible nor searchable, except for
          by the Administrators of the website. I understand that I may be
          contacted by the Administrator of the website.
        </label>
      </div>

      {/* Info text plus button */}
      <div
        style={{
          marginTop: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: '"Nunito Sans",system-ui,sans-serif',
            fontSize: 12,
            color: '#777',
            flex: 1,
          }}
        >
          Your details are used only for concierge support and follow up, never
          shared publicly.
        </div>

        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          style={{
            borderRadius: 999,
            padding: '10px 26px',
            border: 'none',
            fontFamily: '"Nunito Sans",system-ui,sans-serif',
            fontSize: 14,
            backgroundColor: canStart ? '#183F34' : '#cfcfcf',
            color: '#ffffff',
            cursor: canStart ? 'pointer' : 'default',
            whiteSpace: 'nowrap',
          }}
        >
          Start my concierge session
        </button>
      </div>

      <div
        style={{
          marginTop: 8,
          fontFamily: '"Nunito Sans",system-ui,sans-serif',
          fontSize: 11,
          color: '#999',
          textAlign: 'right',
        }}
      >
        Powered by Taigenic AI
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 999,
  border: '1px solid #ddd',
  padding: '10px 16px',
  fontFamily: '"Nunito Sans",system-ui,sans-serif',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

/**
 * STEP 3, chat window
 */
function ChatStep(props: {
  userType: UserType;
  contact: ContactDetails;
  conversationId: string | null;
  onConversationId: (id: string | null) => void;
  onBackToDetails: () => void;
}) {
  const {
    userType,
    contact,
    conversationId,
    onConversationId,
    onBackToDetails,
  } = props;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // intro message
  useEffect(() => {
    const intro =
      userType === 'vendor'
        ? 'Wonderful, you are in the vendor studio for 5 Star Weddings. Are you mainly a venue, a planner, or another kind of wedding business. Share a line about your location and price level, and I will guide you from there.'
        : 'Lovely, you are planning a wedding. Tell me a little about your celebration, who it is for, the rough location and when you are thinking of holding it. I will help you shape ideas for venues, vendors and next steps.';

    setMessages([{ role: 'assistant', content: intro }]);
  }, [userType]);

  async function handleSubmit(event?: FormEvent) {
    if (event) event.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    const companyOrVenue =
      userType === 'vendor'
        ? [contact.companyName, contact.website]
            .filter((value) => value && value.trim())
            .join(' · ')
        : contact.venueOrLocation;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,
          conversationId,
          messages: nextMessages,
          contactName: contact.name,
          contactEmail: contact.email,
          contactPhone: contact.phone,
          contactCompanyOrVenue: companyOrVenue,
          weddingDate: contact.weddingDate,
          consentGiven: contact.consentGiven,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = await response.json();

      if (data.conversationId) {
        onConversationId(data.conversationId as string);
      }

      const replyText =
        (data.reply as string) ||
        'I could not create a helpful reply just now. Please try your question again in a moment.';

      const assistantMessage: Message = {
        role: 'assistant',
        content: replyText,
      };

      setMessages([...nextMessages, assistantMessage]);
    } catch (err) {
      const assistantMessage: Message = {
        role: 'assistant',
        content:
          'There was a problem reaching the concierge. Please try again in a moment.',
      };
      setMessages((current) => [...current, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  const roleLabel =
    userType === 'vendor'
      ? 'Wedding Vendor'
      : 'Wedding Planner or Couple';

  return (
    <div
      style={{
        borderRadius: 32,
        backgroundColor: '#ffffff',
        padding: '24px 24px 26px 24px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.06)',
        border: '1px solid rgba(24,63,52,0.06)',
      }}
    >
      <div
        style={{
          marginBottom: 14,
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
              marginBottom: 4,
              fontFamily: '"Playfair Display","Gilda Display",serif',
              fontSize: 26,
              fontWeight: 400,
              letterSpacing: -0.4,
              color: '#111',
            }}
          >
            5 Star Weddings Concierge
          </h1>
          <div
            style={{
              fontFamily: '"Nunito Sans",system-ui,sans-serif',
              fontSize: 13,
              color: '#666',
            }}
          >
            You are chatting as <strong>{roleLabel}</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToDetails}
          style={{
            borderRadius: 999,
            border: '1px solid #ddd',
            backgroundColor: '#fafafa',
            padding: '6px 12px',
            fontSize: 12,
            fontFamily: '"Nunito Sans",system-ui,sans-serif',
            cursor: 'pointer',
          }}
        >
          Change who I am
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          border: '1px solid #e2e2e2',
          borderRadius: 18,
          minHeight: 320,
          maxHeight: 520,
          padding: 16,
          overflowY: 'auto',
          backgroundColor: '#faf8f3',
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              marginBottom: 12,
              display: 'flex',
              justifyContent:
                message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '8px 12px',
                borderRadius: 14,
                backgroundColor:
                  message.role === 'user' ? '#183F34' : '#ffffff',
                color: message.role === 'user' ? '#ffffff' : '#222222',
                fontFamily: '"Nunito Sans",system-ui,sans-serif',
                fontSize: 14,
                whiteSpace: 'pre-wrap',
              }}
            >
              {message.content}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div
            style={{
              fontFamily: '"Nunito Sans",system-ui,sans-serif',
              fontSize: 14,
              color: '#777',
            }}
          >
            The concierge is ready when you are.
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            position: 'relative',
            flex: 1,
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about venues, vendors or planning help"
            rows={2}
            style={{
              width: '100%',
              padding: '10px 44px 10px 14px',
              borderRadius: 999,
              border: '1px solid #ccc',
              fontFamily: '"Nunito Sans",system-ui,sans-serif',
              fontSize: 14,
              resize: 'none',
              boxSizing: 'border-box',
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit();
              }
            }}
          />
          {/* Green bubble on the right */}
          <div
            style={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              width: 30,
              height: 30,
              borderRadius: '50%',
              backgroundColor: '#183F34',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"Nunito Sans",system-ui,sans-serif',
              fontSize: 16,
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            G
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            width: 90,
            borderRadius: 999,
            border: 'none',
            fontFamily: '"Nunito Sans",system-ui,sans-serif',
            fontSize: 14,
            backgroundColor:
              isLoading || !input.trim() ? '#d1d1d1' : '#183F34',
            color: '#ffffff',
            cursor:
              isLoading || !input.trim() ? 'default' : 'pointer',
            padding: '10px 0',
          }}
        >
          {isLoading ? 'Sending' : 'Send'}
        </button>
      </form>

      <div
        style={{
          marginTop: 6,
          fontFamily: '"Nunito Sans",system-ui,sans-serif',
          fontSize: 11,
          color: '#999',
          textAlign: 'right',
        }}
      >
        Powered by Taigenic AI
      </div>
    </div>
  );
}
