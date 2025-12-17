"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Trash2, X, Sparkles } from "lucide-react";
import AuraVoice from "@/components/AuraVoice";
import VoiceToTextButton from "@/components/VoiceToTextButton";

/* =========================================================
   IDs and Loaders
   ========================================================= */
const GA4_MEASUREMENT_ID = "G-NXSBQEWCZT";
const GTM_CONTAINER_ID = "GTM-5QXXSB";

// ProvideSupport sources, cleaned, script only
const PS_SYNC_SRC =
  "https://image.providesupport.com/js/00w8xxhihpcie1ionxhh6o20ab/safe-monitor-sync.js?ps_h=WVqI&ps_t=";
const PS_STATIC_SRC = "https://image.providesupport.com/sjs/static.js";

let __gaLoaded = false;
let __gtmLoaded = false;
let __psLoaded = false;

function injectScript(src: string, place: "head" | "body" = "head") {
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  (place === "head" ? document.head : document.body).appendChild(s);
}

function ensureGtagShim() {
  if (!(window as any).dataLayer) (window as any).dataLayer = [];
  if (!(window as any).gtag) (window as any).gtag = function gtag() { (window as any).dataLayer.push(arguments); };
}

/* Consent helpers */
function updateConsent(opts: { analytics?: boolean; marketing?: boolean }) {
  try {
    ensureGtagShim();
    const gtag = (window as any).gtag;
    const consentUpdate: Record<string, "granted" | "denied"> = {
      ad_storage: opts.marketing ? "granted" : "denied",
      analytics_storage: opts.analytics ? "granted" : "denied",
      functionality_storage: "granted",
      security_storage: "granted",
    };
    gtag("consent", "update", consentUpdate);
  } catch {}
}

/* GA4 loader */
function loadGA4() {
  if (__gaLoaded || !GA4_MEASUREMENT_ID) return;
  __gaLoaded = true;

  injectScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`, "head");

  const inline = document.createElement("script");
  inline.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag("js", new Date());
    gtag("config", "${GA4_MEASUREMENT_ID}");
  `;
  document.head.appendChild(inline);
}

/* GTM loader */
function loadGTM() {
  if (__gtmLoaded || !GTM_CONTAINER_ID) return;
  __gtmLoaded = true;

  const inline = document.createElement("script");
  inline.innerHTML = `
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({"gtm.start": new Date().getTime(), event:"gtm.js"});
      var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!="dataLayer"?"&l="+l:"";
      j.async=true; j.src="https://www.googletagmanager.com/gtm.js?id="+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window,document,"script","dataLayer","${GTM_CONTAINER_ID}");
  `;
  document.head.appendChild(inline);
}

/* ProvideSupport loader, script only */
function loadProvideSupport() {
  if (__psLoaded) return;
  __psLoaded = true;

  const boot = () => {
    injectScript(`${PS_SYNC_SRC}${Date.now()}`, "body");
    injectScript(PS_STATIC_SRC, "body");
  };
  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot, { once: true });
}

/* Apply stored preferences on mount and subscribe to updates */
function useConsentApply() {
  useEffect(() => {
    function applyStored() {
      try {
        const raw = localStorage.getItem("fsw_cookie_consent");
        if (!raw) return;
        const prefs = JSON.parse(raw) as { analytics?: boolean; marketing?: boolean };

        // Update Consent Mode first
        updateConsent({ analytics: !!prefs.analytics, marketing: !!prefs.marketing });

        // Load tools per consent
        if (prefs.analytics) {
          loadGA4();
          loadGTM();
        }
        if (prefs.marketing) {
          loadProvideSupport();
        }
      } catch {}
    }

    applyStored();

    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      updateConsent({ analytics: !!detail.analytics, marketing: !!detail.marketing });
      if (detail.analytics) {
        loadGA4();
        loadGTM();
      }
      if (detail.marketing) {
        loadProvideSupport();
      }
    };

    document.addEventListener("fsw-consent-updated", onUpdate);
    return () => document.removeEventListener("fsw-consent-updated", onUpdate);
  }, []);
}

/* =========================================================
   Starter Chips
   ========================================================= */
const VENDOR_PROMPTS = [
  "How can I improve my SEO?",
  "Latest luxury wedding trends?",
  "Help me write an Instagram caption",
  "How do I attract destination couples?",
  "Review my pricing strategy",
];

const COUPLE_PROMPTS = [
  "Find venues in Lake Como",
  "Budget breakdown for 100 guests",
  "12-month planning timeline",
  "Suggest a jazz band in London",
  "Spring floral styling ideas",
];

/* =========================================================
   UI Helpers
   ========================================================= */
type ToggleProps = { checked: boolean; onChange?: (c: boolean) => void; disabled?: boolean };
function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? "bg-[#3B82F6]" : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* =========================================================
   Cookie Preference Center Modal
   ========================================================= */
type CookieModalProps = { isOpen: boolean; onClose: () => void };

function CookiePreferenceCenter({ isOpen, onClose }: CookieModalProps) {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const saved = localStorage.getItem("fsw_cookie_consent");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnalytics(!!parsed.analytics);
        setMarketing(!!parsed.marketing);
      } catch {}
    }
  }, [isOpen]);

  const handleSave = () => {
    const preferences = { analytics, marketing, timestamp: Date.now() };
    localStorage.setItem("fsw_cookie_consent", JSON.stringify(preferences));

    // Notify listeners, load happens in the hook subscriber
    const evt = new CustomEvent("fsw-consent-updated", { detail: preferences });
    document.dispatchEvent(evt);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Cookie Preference Center</h2>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
            We use cookies for essential operations, analytics and marketing measurement. You can change your choices any time.
            {" "}
            <a href="https://5starweddingdirectory.com/privacy" target="_blank" rel="noopener noreferrer" className="underline text-gray-800 hover:text-black">
              Learn more
            </a>
            .
          </p>

          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="pr-4">
                <div className="font-medium text-gray-900 text-[15px] mb-1">Strictly Necessary Cookies, always active</div>
                <div className="text-[13px] text-gray-500">Security, authentication, performance</div>
              </div>
              <Toggle checked={true} disabled />
            </div>

            <div className="h-px bg-gray-100 w-full" />

            <div className="flex items-start justify-between">
              <div className="pr-4">
                <div className="font-medium text-gray-900 text-[15px] mb-1">Analytics Cookies</div>
                <div className="text-[13px] text-gray-500">Helps us understand traffic and improve the experience</div>
              </div>
              <Toggle checked={analytics} onChange={setAnalytics} />
            </div>

            <div className="h-px bg-gray-100 w-full" />

            <div className="flex items-start justify-between">
              <div className="pr-4">
                <div className="font-medium text-gray-900 text-[15px] mb-1">Marketing Performance Cookies</div>
                <div className="text-[13px] text-gray-500">Measures effectiveness of campaigns and live support</div>
              </div>
              <Toggle checked={marketing} onChange={setMarketing} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-[#1F4D3E] text-white rounded-lg text-sm font-medium hover:bg-[#163C30] shadow-sm">
            Confirm My Choices
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Footer
   ========================================================= */
function BrandFooter({ onOpenCookies }: { onOpenCookies: () => void }) {
  const year = new Date().getFullYear();
  return (
    <div className="w-full text-center text-[11px] sm:text-[12px] text-gray-500 py-6 mt-auto">
      <div className="flex flex-wrap justify-center items-center gap-1 opacity-80">
        <span>Powered by Taigenic.ai</span>
        <span className="hidden sm:inline">•</span>
        <span>5 Star Weddings Ltd. 2006,{year}</span>
        <span className="hidden sm:inline">•</span>
        <span className="inline-flex gap-1">
          See{" "}
          <button
            onClick={onOpenCookies}
            className="underline decoration-gray-400 hover:text-gray-800 hover:decoration-gray-600"
          >
            Cookie Preferences
          </button>.
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   Main Chat
   ========================================================= */
type ChatMessage = { role: "user" | "assistant"; content: string };

export default function VendorsChatInner() {
  useConsentApply();

  const searchParams = useSearchParams();

  const isEmbed = searchParams.get("embed") === "1";
  const initialChatType = searchParams.get("chatType") === "couple" ? "couple" : "vendor";
  const organisationId = searchParams.get("organisationId") || "9ecd45ab-6ed2-46fa-914b-82be313e06e4";
  const agentId = searchParams.get("agentId") || "70660422-489c-4b7d-81ae-b786e43050db";

  const [view, setView] = useState<"form" | "chat">("form");
  const [mode, setMode] = useState<"vendor" | "couple">(initialChatType);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    venueOrLocation: "",
    website: "",
    weddingDate: "",
  });
  const [formError, setFormError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const isVendor = mode === "vendor";

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, view]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, 180);
    el.style.height = \`\${next}px\`;
  }, [input]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsStarting(true);

    try {
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_type: isVendor ? "vendor" : "planning",
          contact_name: formData.name,
          contact_email: formData.email,
          contact_phone: formData.phone,
          venue_or_location: formData.venueOrLocation,
          website: isVendor ? formData.website : null,
          wedding_date: !isVendor ? formData.weddingDate : null,
          organisationId,
          agentId,
        }),
      });

      const data = await res.json();

      if (data.ok && data.conversationId) {
        setConversationId(data.conversationId);
        setView("chat");
        setMessages([
          {
            role: "assistant",
            content: isVendor
              ? "Hello, I am Aura. I can help you attract more destination couples with sharper positioning, elevated content, SEO visibility, and premium placement in our Luxury Wedding Collection. To start, where are you based, and what type of business are you?"
              : "Hello, I am Aura. I can help you shape the perfect wedding plan, recommend venues and trusted vendors, and build a clear shortlist. To begin, what destination are you considering, and roughly how many guests?",
          },
        ]);
      } else {
        setFormError(data.error || "Could not start chat.");
      }
    } catch (err) {
      setFormError("Network error. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleSend = async (e?: React.FormEvent, manualInput?: string) => {
    e?.preventDefault();
    const textToSend = manualInput || input;
    if (!textToSend.trim() || !conversationId) return;

    const userMsg: ChatMessage = { role: "user", content: textToSend };
    const nextMessages = [...messages, userMsg];

    setMessages(nextMessages);
    if (!manualInput) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/vendors-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          chatType: mode,
          conversationId,
          organisationId,
          agentId,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteConversation = async () => {
    if (!confirm("Are you sure you want to end this chat?")) return;
    if (conversationId) {
      await fetch("/api/vendor/delete-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId }),
      }).catch(() => {});
    }
    setView("form");
    setMessages([]);
    setConversationId(null);
    setInput("");
    setFormData({ name: "", email: "", phone: "", venueOrLocation: "", website: "", weddingDate: "" });
  };

  /* ---------------- Render ---------------- */

  if (view === "form") {
    return (
      <div className={\`min-h-screen flex flex-col bg-gray-50/50 \${isEmbed ? "py-0" : "py-12 sm:px-6 lg:px-8"}\`}>
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4 mb-8">
            <h1 className="text-[#1F4D3E]" style={{ fontFamily: "var(--font-gilda-display), serif", fontSize: 48, lineHeight: "1.1em" }}>
              5 Star Weddings
            </h1>
            <h2 className="text-[#2F4F3F] opacity-90" style={{ fontFamily: "var(--font-gilda-display), serif", fontSize: 32 }}>
              Concierge
            </h2>
            <p className="text-gray-500 mt-4 text-[16px]">Please tell us a bit about yourself to start.</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-white p-1.5 rounded-full border border-gray-200 shadow-sm inline-flex">
              <button
                onClick={() => setMode("vendor")}
                className={\`px-6 py-2 rounded-full text-sm font-medium transition-all \${mode === "vendor" ? "bg-[#1F4D3E] text-white shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}\`}
              >
                I am a Vendor
              </button>
              <button
                onClick={() => setMode("couple")}
                className={\`px-6 py-2 rounded-full text-sm font-medium transition-all \${mode === "couple" ? "bg-[#1F4D3E] text-white shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}\`}
              >
                I am a Couple
              </button>
            </div>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-[500px]">
            <div className={\`bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 \${isEmbed ? "p-6" : "p-8 sm:p-10"}\`}>
              <form className="space-y-5" onSubmit={handleStartChat}>
                {formError && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{formError}</div>}

                <div className="space-y-1">
                  <label className="block text-[15px] font-medium text-gray-700 ml-1">Name</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E]" />
                </div>

                <div className="space-y-1">
                  <label className="block text-[15px] font-medium text-gray-700 ml-1">Email</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[15px] font-medium text-gray-700 ml-1">Phone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E]" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[15px] font-medium text-gray-700 ml-1">{isVendor ? "Website" : "Wedding Date"}</label>
                    {isVendor ? (
                      <input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="For example yoursite" className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E]" />
                    ) : (
                      <input type="date" value={formData.weddingDate} onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })} className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E]" />
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[15px] font-medium text-gray-700 ml-1">{isVendor ? "Company or Venue Name" : "Venue Location or Preferences"}</label>
                  <input type="text" value={formData.venueOrLocation} onChange={(e) => setFormData({ ...formData, venueOrLocation: e.target.value })} className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E]" />
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={isStarting} className="w-full flex justify-center py-3.5 px-4 rounded-lg shadow-md text-[16px] font-medium text-white bg-[#2D4539] hover:bg-[#1F362C] focus:ring-2 focus:ring-offset-2 focus:ring-[#1F4D3E] disabled:opacity-70">
                    {isStarting ? "Starting Chat..." : "Start Chatting"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <BrandFooter onOpenCookies={() => setIsCookieModalOpen(true)} />
        <CookiePreferenceCenter isOpen={isCookieModalOpen} onClose={() => setIsCookieModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-white sm:bg-gray-50 text-gray-900 font-sans ${isEmbed ? "h-screen" : "h-[calc(100vh-64px)]"}`}>
      <div className="bg-white px-6 py-4 shadow-sm z-10 border-b border-gray-100">
        <div className="max-w-3xl mx-auto relative flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-[#1F4D3E]" style={{ fontFamily: "var(--font-gilda-display), serif", fontSize: 28, lineHeight: 1 }}>5 Star Weddings</h1>
            <h2 className="text-[#1F4D3E] opacity-90" style={{ fontFamily: "var(--font-gilda-display), serif", fontSize: 20 }}>Concierge</h2>
          </div>
          <button onClick={handleDeleteConversation} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2" title="End Chat">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative w-full max-w-3xl mx-auto sm:px-4 sm:pb-4">
        <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-6 scroll-smooth pb-24 sm:pb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-[#1F4D3E] flex items-center justify-center text-white text-xs mr-2 flex-shrink-0 mt-2 font-serif">5*</div>
              )}
              <div className={`max-w-[85%] sm:max-w-[75%] px-6 py-4 text-[15px] sm:text-base leading-relaxed shadow-sm ${m.role === "user" ? "bg-[#1F4D3E] text-white rounded-2xl rounded-br-sm" : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"}`}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start w-full">
              <div className="w-8 h-8 mr-2" />
              <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-bl-sm flex space-x-1 items-center shadow-sm">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 p-4 w-full z-20">
        <div className="max-w-3xl mx-auto">
          {!loading && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-2">
              {(isVendor ? VENDOR_PROMPTS : COUPLE_PROMPTS).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(undefined, prompt)}
                  className="flex-shrink-0 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-xs sm:text-sm text-gray-600 hover:text-[#1F4D3E] transition-all whitespace-nowrap flex items-center gap-1.5"
                >
                  <Sparkles size={12} className="opacity-50" />
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="relative bg-white border border-gray-300 rounded-[26px] shadow-sm focus-within:ring-2 focus-within:ring-[#1F4D3E] focus-within:border-transparent transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isVendor ? "Message Aura about your venue..." : "Message Aura about your wedding..."}
              className="w-full bg-transparent outline-none resize-none text-[16px] leading-relaxed pl-5 pr-44 py-3 rounded-[26px]"
              rows={1}
              style={{ minHeight: "50px", maxHeight: "180px" }}
            />
            <div className="absolute right-2 bottom-1.5 flex items-center gap-2">
              <VoiceToTextButton onText={(t) => setInput((prev) => (prev ? \`\${prev} \${t}\` : t))} />
              <AuraVoice />
              <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="h-10 w-10 rounded-full flex items-center justify-center bg-[#1F4D3E] text-white shadow-md hover:bg-[#163C30] disabled:opacity-40">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <BrandFooter onOpenCookies={() => setIsCookieModalOpen(true)} />
      <CookiePreferenceCenter isOpen={isCookieModalOpen} onClose={() => setIsCookieModalOpen(false)} />
    </div>
  );
}
