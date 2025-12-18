"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Trash2,
  X,
  Sparkles,
  UserPlus,
  CheckCircle,
  Lock,
  Mail,
  ArrowLeft,
  User,
  Store,
  Menu,
  Plus,
  Search,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
  CalendarDays,
  Users,
  Heart,
} from "lucide-react";
import AuraVoice from "@/components/AuraVoice";
import VoiceToTextButton from "@/components/VoiceToTextButton";

/* =========================================================
   IDS and LOADERS
   ========================================================= */
const GA4_MEASUREMENT_ID = "G-NXSBQEWCZT";
const GTM_CONTAINER_ID = "GTM-5QXXSB";

const PS_SYNC_SRC =
  "https://image.providesupport.com/js/00w8xxhihpcie1ionxhh6o20ab/safe-monitor-sync.js?ps_h=WVqI&ps_t=";
const PS_STATIC_SRC = "https://image.providesupport.com/sjs/static.js";

const STORAGE_KEY_CHAT = "fsw_chat_session_v1";
const STORAGE_KEY_COOKIE = "fsw_cookie_consent";
const STORAGE_KEY_SESSIONS = "fsw_chat_sessions_v1";
const STORAGE_KEY_USER = "fsw_user_v1";
const STORAGE_KEY_CONV_PREFIX = "fsw_chat_conv_";

let __gaLoaded = false;
let __gtmLoaded = false;
let __psLoaded = false;

function injectScript(src: string, place: "head" | "body" = "head") {
  if (typeof document === "undefined") return;
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  (place === "head" ? document.head : document.body).appendChild(s);
}

function ensureGtagShim() {
  if (typeof window === "undefined") return;
  if (!(window as any).dataLayer) (window as any).dataLayer = [];
  if (!(window as any).gtag)
    (window as any).gtag = function gtag() {
      (window as any).dataLayer.push(arguments);
    };
}

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

function useConsentApply() {
  useEffect(() => {
    function applyStored() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_COOKIE);
        if (!raw) return;
        const prefs = JSON.parse(raw) as { analytics?: boolean; marketing?: boolean };
        updateConsent({ analytics: !!prefs.analytics, marketing: !!prefs.marketing });
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
   STARTER CHIPS
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
  "12 month planning timeline",
  "Suggest a jazz band in London",
  "Spring floral styling ideas",
];

/* =========================================================
   STORAGE SAFETY HELPERS
   ========================================================= */
function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function clampMessages<T extends { role: string; content: string }>(msgs: T[], max = 80) {
  if (!Array.isArray(msgs)) return [];
  if (msgs.length <= max) return msgs;
  return msgs.slice(msgs.length - max);
}

function nowTs() {
  return Date.now();
}

/* =========================================================
   CUSTOM TEXT FORMATTER
   ========================================================= */
function FormattedMessage({ content }: { content: string }) {
  const cleanContent = content.replace(/\\n/g, "\n");
  const lines = cleanContent.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        const isH3 = trimmed.startsWith("### ");
        const isH4 = trimmed.startsWith("#### ");

        if (isH3)
          return (
            <h3 key={i} className="text-lg font-bold text-[#1F4D3E] mt-3 mb-1">
              {trimmed.substring(4)}
            </h3>
          );
        if (isH4)
          return (
            <h4 key={i} className="text-md font-bold text-gray-900 mt-2 mb-1">
              {trimmed.substring(5)}
            </h4>
          );

        const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ");
        const isNumber = /^\d+\.\s/.test(trimmed);

        let displayText = trimmed;
        if (isBullet) displayText = trimmed.substring(2);
        if (isNumber) displayText = trimmed.replace(/^\d+\.\s/, "");

        const parts = displayText.split(/(\*\*.*?\*\*)/g).map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={j} className="font-semibold text-gray-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet || isNumber) {
          return (
            <div key={i} className="flex items-start">
              <span
                className={`mr-2 mt-1 flex-shrink-0 ${
                  isBullet ? "w-1.5 h-1.5 bg-gray-400 rounded-full mt-2" : "font-bold text-[#1F4D3E] text-xs min-w-[16px]"
                }`}
              >
                {isNumber ? trimmed.match(/^\d+/)?.[0] + "." : ""}
              </span>
              <span className="leading-relaxed text-gray-800">{parts}</span>
            </div>
          );
        }

        return (
          <p key={i} className="leading-relaxed text-gray-800">
            {parts}
          </p>
        );
      })}
    </div>
  );
}

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
   MODALS
   ========================================================= */
function CookiePreferenceCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const saved = localStorage.getItem(STORAGE_KEY_COOKIE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnalytics(!!parsed.analytics);
        setMarketing(!!parsed.marketing);
      } catch {}
    }
  }, [isOpen]);

  const handleSave = () => {
    const preferences = { analytics, marketing, timestamp: nowTs() };
    localStorage.setItem(STORAGE_KEY_COOKIE, JSON.stringify(preferences));
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
            We use cookies for essential operations, analytics and marketing measurement. You can change your choices any
            time.{" "}
            <a
              href="https://5starweddingdirectory.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-gray-800 hover:text-black"
            >
              Learn more
            </a>
            .
          </p>
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="pr-4">
                <div className="font-medium text-gray-900 text-[15px] mb-1">Strictly Necessary Cookies</div>
                <div className="text-[13px] text-gray-500">Security, authentication, performance</div>
              </div>
              <Toggle checked={true} disabled />
            </div>
            <div className="h-px bg-gray-100 w-full" />
            <div className="flex items-start justify-between">
              <div className="pr-4">
                <div className="font-medium text-gray-900 text-[15px] mb-1">Analytics Cookies</div>
                <div className="text-[13px] text-gray-500">Traffic and improvement</div>
              </div>
              <Toggle checked={analytics} onChange={setAnalytics} />
            </div>
            <div className="h-px bg-gray-100 w-full" />
            <div className="flex items-start justify-between">
              <div className="pr-4">
                <div className="font-medium text-gray-900 text-[15px] mb-1">Marketing Performance Cookies</div>
                <div className="text-[13px] text-gray-500">Campaign effectiveness</div>
              </div>
              <Toggle checked={marketing} onChange={setMarketing} />
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#1F4D3E] text-white rounded-lg text-sm font-medium hover:bg-[#163C30] shadow-sm"
          >
            Confirm My Choices
          </button>
        </div>
      </div>
    </div>
  );
}

type SavedUser = { name: string; email: string };

function AuthModal({
  isOpen,
  onClose,
  initialMode,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialMode: "vendor" | "couple";
  onSuccess: (name: string, email: string) => void;
}) {
  const [view, setView] = useState<"register" | "login" | "forgot">("register");
  const [role, setRole] = useState<"vendor" | "couple">(initialMode);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setRole(initialMode);
    setView("register");
    setSuccessMsg("");
    setName("");
    setEmail("");
    setPassword("");
  }, [isOpen, initialMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (view === "forgot") {
        setSuccessMsg(`Reset link sent to ${email}`);
        setTimeout(() => {
          setView("login");
          setSuccessMsg("");
        }, 2500);
        return;
      }

      onSuccess(name || "User", email);
      setSuccessMsg("Success!");
      setTimeout(() => onClose(), 900);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] relative overflow-hidden flex flex-col">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10">
          <X size={20} />
        </button>

        <div className="px-8 pt-8 pb-4">
          <h2 className="text-2xl font-serif text-[#1F4D3E] mb-1 text-center">
            {view === "register" && "Create Account"}
            {view === "login" && "Welcome Back"}
            {view === "forgot" && "Reset Password"}
          </h2>
          <p className="text-gray-500 text-sm text-center mb-6">
            {view === "register" && "Save your chat and planning tools."}
            {view === "login" && "Access your saved wedding plans."}
            {view === "forgot" && "We will send you a recovery link."}
          </p>

          {view !== "forgot" && (
            <div className="bg-gray-100 p-1 rounded-lg flex mb-4">
              <button
                type="button"
                onClick={() => setRole("couple")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                  role === "couple" ? "bg-white text-[#1F4D3E] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <User size={16} /> Couple
              </button>
              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                  role === "vendor" ? "bg-white text-[#1F4D3E] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Store size={16} /> Vendor
              </button>
            </div>
          )}
        </div>

        {successMsg && (
          <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center animate-in fade-in">
            <CheckCircle size={48} className="text-green-600 mb-4" />
            <p className="text-lg font-medium text-gray-900">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-8 pb-8 flex-1 flex flex-col gap-4">
          {view === "register" && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E] outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E] outline-none transition-all"
              />
            </div>
          </div>

          {view !== "forgot" && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                {view === "login" && (
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-xs text-[#1F4D3E] hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E] outline-none transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1F4D3E] text-white rounded-lg font-medium hover:bg-[#163C30] transition-all disabled:opacity-70 mt-2 shadow-sm flex items-center justify-center gap-2"
          >
            {loading
              ? "Processing..."
              : view === "register"
                ? "Create Account"
                : view === "login"
                  ? "Log In"
                  : "Send Reset Link"}
            {view !== "forgot" && <ArrowLeft className="rotate-180" size={16} />}
          </button>

          <div className="mt-2 text-center">
            {view === "register" && (
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button type="button" onClick={() => setView("login")} className="text-[#1F4D3E] font-medium hover:underline">
                  Log in
                </button>
              </p>
            )}
            {view === "login" && (
              <p className="text-sm text-gray-600">
                New here?{" "}
                <button type="button" onClick={() => setView("register")} className="text-[#1F4D3E] font-medium hover:underline">
                  Create account
                </button>
              </p>
            )}
            {view === "forgot" && (
              <button
                type="button"
                onClick={() => setView("login")}
                className="text-sm text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft size={14} /> Back to Log In
              </button>
            )}
          </div>
        </form>
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
        <span>5 Star Weddings Ltd. 2006-{year}</span>
        <span className="hidden sm:inline">•</span>
        <span className="inline-flex gap-1">
          See{" "}
          <button
            onClick={onOpenCookies}
            className="underline decoration-gray-400 hover:text-gray-800 hover:decoration-gray-600"
          >
            Cookie Preferences
          </button>
          .
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR TYPES
   ========================================================= */
type ChatMessage = { role: "user" | "assistant"; content: string };

type SidebarSession = {
  conversationId: string;
  title: string;
  mode: "vendor" | "couple";
  updatedAt: number;
  lastMessage?: string;
  userKey?: string;
};

function buildUserKey(u: SavedUser | null) {
  if (!u?.email) return "anon";
  return `u:${u.email.trim().toLowerCase()}`;
}

function formatTime(ts: number) {
  try {
    const d = new Date(ts);
    return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function convStorageKey(conversationId: string) {
  return `${STORAGE_KEY_CONV_PREFIX}${conversationId}`;
}

/* =========================================================
   Main
   ========================================================= */
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
  const [isRestored, setIsRestored] = useState(false);

  const [savedUser, setSavedUser] = useState<SavedUser | null>(null);

  const [sessions, setSessions] = useState<SidebarSession[]>([]);
  const [sessionQuery, setSessionQuery] = useState("");

  const isVendor = mode === "vendor";
  const userKey = useMemo(() => buildUserKey(savedUser), [savedUser]);
  const isSignedIn = !!savedUser?.email;

  // Start closed everywhere by default (ChatGPT feel)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function persistSessions(next: SidebarSession[]) {
    setSessions(next);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(next));
  }

  function upsertSession(partial: Partial<SidebarSession> & { conversationId: string }) {
    const current = safeJsonParse<SidebarSession[]>(localStorage.getItem(STORAGE_KEY_SESSIONS), []);
    const existing = current.find((s) => s.conversationId === partial.conversationId);
    const merged: SidebarSession = {
      conversationId: partial.conversationId,
      title: partial.title || existing?.title || "New chat",
      mode: partial.mode || existing?.mode || mode,
      updatedAt: partial.updatedAt || nowTs(),
      lastMessage: partial.lastMessage ?? existing?.lastMessage ?? "",
      userKey: partial.userKey || existing?.userKey || userKey,
    };
    const next = [merged, ...current.filter((s) => s.conversationId !== partial.conversationId)]
      .filter((s) => (userKey === "anon" ? true : s.userKey === userKey))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    persistSessions(next);
  }

  function removeSession(id: string) {
    const current = safeJsonParse<SidebarSession[]>(localStorage.getItem(STORAGE_KEY_SESSIONS), []);
    const next = current.filter((s) => s.conversationId !== id);
    persistSessions(next.filter((s) => (userKey === "anon" ? true : s.userKey === userKey)));
    localStorage.removeItem(convStorageKey(id));
    if (conversationId === id) {
      localStorage.removeItem(STORAGE_KEY_CHAT);
      setView("form");
      setMessages([]);
      setConversationId(null);
      setInput("");
      setFormData({ name: "", email: "", phone: "", venueOrLocation: "", website: "", weddingDate: "" });
    }
  }

  // New chat must not bounce users back into role selection
  function startFreshChat(nextMode?: "vendor" | "couple") {
    localStorage.removeItem(STORAGE_KEY_CHAT);
    setMessages([]);
    setConversationId(null);
    setInput("");
    setFormError("");

    // Keep current mode when signed in, hide role switch UI, so no revert feeling
    if (!isSignedIn && nextMode) setMode(nextMode);

    // Keep view: if signed in, stay on form but without the role selector, and keep name/email filled
    setView("form");
    setSidebarOpen(false);
  }

  function openSession(id: string) {
    const stored = safeJsonParse<any>(localStorage.getItem(convStorageKey(id)), null);
    if (stored?.conversationId === id && Array.isArray(stored?.messages)) {
      setConversationId(id);
      setMessages(stored.messages);
      setMode(stored.mode === "couple" ? "couple" : "vendor");
      if (stored.formData) setFormData(stored.formData);
      setView("chat");
      setSidebarOpen(false);
      localStorage.setItem(
        STORAGE_KEY_CHAT,
        JSON.stringify({
          conversationId: id,
          messages: stored.messages,
          mode: stored.mode,
          formData: stored.formData,
          timestamp: nowTs(),
        })
      );
    }
  }

  /* Restore user */
  useEffect(() => {
    const u = safeJsonParse<SavedUser | null>(localStorage.getItem(STORAGE_KEY_USER), null);
    if (u?.email) {
      setSavedUser(u);
      setFormData((p) => ({ ...p, name: p.name || u.name || "", email: p.email || u.email || "" }));
    }
  }, []);

  /* Load sessions */
  useEffect(() => {
    const all = safeJsonParse<SidebarSession[]>(localStorage.getItem(STORAGE_KEY_SESSIONS), []);
    const filtered = userKey === "anon" ? all : all.filter((s) => s.userKey === userKey);
    setSessions(filtered.sort((a, b) => b.updatedAt - a.updatedAt));
  }, [userKey]);

  /* Restore last active session */
  useEffect(() => {
    const restoreSession = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_CHAT);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.conversationId && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
            setConversationId(parsed.conversationId);
            setMessages(parsed.messages);
            setView("chat");
            setMode(parsed.mode || initialChatType);
            if (parsed.formData) setFormData(parsed.formData);
          }
        }
      } catch {
      } finally {
        setIsRestored(true);
      }
    };
    restoreSession();
  }, [initialChatType]);

  /* Persist active conversation data safely */
  useEffect(() => {
    if (view === "chat" && conversationId && messages.length > 0) {
      const trimmed = clampMessages(messages, 80);
      const sessionData = { conversationId, messages: trimmed, mode, formData, timestamp: nowTs() };
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(sessionData));
      localStorage.setItem(convStorageKey(conversationId), JSON.stringify(sessionData));

      const lastMsg = trimmed[trimmed.length - 1]?.content || "";
      upsertSession({
        conversationId,
        title: formData.venueOrLocation || formData.name || (mode === "vendor" ? "Vendor chat" : "Couple chat"),
        mode,
        updatedAt: nowTs(),
        lastMessage: lastMsg.slice(0, 140),
        userKey,
      });
    }
  }, [conversationId, messages, view, mode, formData, userKey]);

  useEffect(() => {
    if (isEmbed) return;
    const raw = localStorage.getItem(STORAGE_KEY_COOKIE);
    if (!raw) setIsCookieModalOpen(true);
  }, [isEmbed]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, view]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
  }, [input]);

  const filteredSessions = useMemo(() => {
    const q = sessionQuery.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) => (s.title || "").toLowerCase().includes(q) || (s.lastMessage || "").toLowerCase().includes(q)
    );
  }, [sessions, sessionQuery]);

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

        const firstAssistant: ChatMessage = {
          role: "assistant",
          content: isVendor
            ? "Hello, I am Aura. I can help you attract more destination couples with sharper positioning, elevated content, SEO visibility, and premium placement in our Luxury Wedding Collection. To start, where are you based, and what type of business are you?"
            : "Hello, I am Aura. I can help you shape the perfect wedding plan, recommend venues and trusted vendors, and build a clear shortlist. To begin, what destination are you considering, and roughly how many guests?",
        };

        const initialMsgs = [firstAssistant];
        setMessages(initialMsgs);

        localStorage.setItem(
          convStorageKey(data.conversationId),
          JSON.stringify({ conversationId: data.conversationId, messages: initialMsgs, mode, formData, timestamp: nowTs() })
        );

        upsertSession({
          conversationId: data.conversationId,
          title: formData.venueOrLocation || formData.name || (mode === "vendor" ? "Vendor chat" : "Couple chat"),
          mode,
          updatedAt: nowTs(),
          lastMessage: firstAssistant.content.slice(0, 140),
          userKey,
        });

        setSidebarOpen(false);
      } else {
        setFormError(data.error || "Could not start chat.");
      }
    } catch {
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
    const nextMessages = clampMessages([...messages, userMsg], 80);

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
        const assistantMsg: ChatMessage = { role: "assistant", content: data.reply };
        const finalMessages = clampMessages([...nextMessages, assistantMsg], 80);
        setMessages(finalMessages);

        upsertSession({
          conversationId,
          mode,
          updatedAt: nowTs(),
          lastMessage: data.reply.slice(0, 140),
          userKey,
        });
      }
    } catch {
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

    localStorage.removeItem(STORAGE_KEY_CHAT);
    if (conversationId) {
      await fetch("/api/vendor/delete-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId }),
      }).catch(() => {});
      removeSession(conversationId);
    }

    setView("form");
    setMessages([]);
    setConversationId(null);
    setInput("");
    setFormData({ name: "", email: "", phone: "", venueOrLocation: "", website: "", weddingDate: "" });
  };

  const handleAuthSuccess = (name: string, email: string) => {
    const u: SavedUser = { name, email };
    setSavedUser(u);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
    setFormData((prev) => ({ ...prev, name, email }));
  };

  const handleSignOut = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    setSavedUser(null);
    setSessionQuery("");
    const all = safeJsonParse<SidebarSession[]>(localStorage.getItem(STORAGE_KEY_SESSIONS), []);
    setSessions(all);
  };

  if (!isRestored) return null;

  /* =========================================================
     Sidebar UI
     ========================================================= */
  const WeddingTools = (
    <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <LayoutGrid size={16} className="text-gray-500" />
        Wedding tools
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button type="button" className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm flex items-center gap-2">
          <LayoutGrid size={16} className="text-gray-500" /> Budget
        </button>
        <button type="button" className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm flex items-center gap-2">
          <Users size={16} className="text-gray-500" /> Guest list
        </button>
        <button type="button" className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm flex items-center gap-2">
          <CalendarDays size={16} className="text-gray-500" /> Timeline
        </button>
        <button type="button" className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm flex items-center gap-2">
          <Heart size={16} className="text-gray-500" /> Honeymoon
        </button>
      </div>
      <div className="mt-3 text-[11px] text-gray-500">This stays on the front end, no admin access needed.</div>
    </div>
  );

  const SidebarContent = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="flex items-start justify-between gap-3">
          <div className="leading-tight">
            <div className="text-[13px] text-gray-500">5 Star Weddings</div>
            <div className="text-[15px] font-semibold text-gray-900">Concierge</div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="hidden md:inline-flex p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
            title="Close sidebar"
          >
            <PanelLeftClose size={18} className="text-gray-700" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => startFreshChat(mode)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#1F4D3E] text-white text-sm font-medium hover:bg-[#163C30]"
          >
            <Plus size={16} /> New chat
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              value={sessionQuery}
              onChange={(e) => setSessionQuery(e.target.value)}
              placeholder="Search chats"
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E]"
            />
          </div>
        </div>

        {/* When logged in, hide role switch options on the left sidebar */}
        {!isSignedIn && (
          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-1 flex">
            <button
              type="button"
              onClick={() => setMode("vendor")}
              className={`flex-1 text-xs font-medium px-3 py-2 rounded-md transition ${
                mode === "vendor" ? "bg-white text-[#1F4D3E] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Vendor
            </button>
            <button
              type="button"
              onClick={() => setMode("couple")}
              className={`flex-1 text-xs font-medium px-3 py-2 rounded-md transition ${
                mode === "couple" ? "bg-white text-[#1F4D3E] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Couple
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="p-3">
          {savedUser?.email ? (
            <div className="mb-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="text-xs text-gray-500">Signed in</div>
              <div className="text-sm font-medium text-gray-900 truncate">{savedUser.name || "User"}</div>
              <div className="text-xs text-gray-500 truncate">{savedUser.email}</div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                >
                  Sign out
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                >
                  Switch user
                </button>
              </div>
              <div className="mt-2 text-[11px] text-gray-500">
                Chats save in this browser. Multi device sync comes next.
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full mb-3 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm"
            >
              <UserPlus size={16} /> Sign in to save chat history
            </button>
          )}

          {!isSignedIn && mode === "couple" && WeddingTools}

          <div className="text-xs font-semibold text-gray-500 px-1 mb-2 flex items-center gap-2 mt-3">
            <MessageSquare size={14} />
            Chat history
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-sm text-gray-500 p-3 rounded-xl bg-gray-50 border border-gray-200">
              No chats yet. Start one, then it will appear here.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSessions.map((s) => {
                const active = conversationId === s.conversationId && view === "chat";
                return (
                  <button
                    key={s.conversationId}
                    type="button"
                    onClick={() => openSession(s.conversationId)}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      active ? "border-[#1F4D3E] bg-green-50/40" : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {s.title || (s.mode === "vendor" ? "Vendor chat" : "Couple chat")}
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">{s.lastMessage || "No messages yet"}</div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          {s.mode === "vendor" ? "Vendor" : "Couple"} · {formatTime(s.updatedAt)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this chat from this browser?")) removeSession(s.conversationId);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete chat"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-gray-100 bg-white">
        <div className="text-[11px] text-gray-500 leading-relaxed">
          Safe by default, chats are stored locally, limited to recent messages, and you can delete any time.
        </div>
      </div>
    </div>
  );

  const DesktopSidebar = (
    <div
      className={`hidden md:block h-screen sticky top-0 border-r border-gray-200 bg-white transition-all duration-300 ${
        sidebarOpen ? "w-[320px]" : "w-[64px]"
      }`}
    >
      {sidebarOpen ? (
        SidebarContent
      ) : (
        <div className="h-full flex flex-col items-center py-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm"
            title="Open sidebar"
          >
            <PanelLeftOpen size={18} className="text-gray-700" />
          </button>

          <div className="mt-3 w-full px-2">
            <button
              type="button"
              onClick={() => startFreshChat(mode)}
              className="w-full p-2 rounded-xl bg-[#1F4D3E] text-white hover:bg-[#163C30] flex items-center justify-center"
              title="New chat"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="mt-3 w-full px-2">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
              title="Sign in"
            >
              <UserPlus size={18} className="text-gray-700" />
            </button>
          </div>

          <div className="mt-auto pb-3">
            <button
              type="button"
              onClick={() => setIsCookieModalOpen(true)}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
              title="Cookie preferences"
            >
              <Menu size={18} className="text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const MobileSidebar = (
    <div className="md:hidden">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-50 p-2 rounded-xl bg-white border border-gray-200 shadow-sm"
        title="Open menu"
      >
        <Menu size={18} className="text-gray-700" />
      </button>

      <div className={`fixed inset-0 z-[9998] transition ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
        <div
          className={`absolute left-0 top-0 h-full w-[320px] bg-white shadow-2xl transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="absolute right-3 top-3">
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Close">
              <X size={18} />
            </button>
          </div>
          {SidebarContent}
        </div>
      </div>
    </div>
  );

  /* =========================================================
     FORM VIEW
     ========================================================= */
  if (view === "form") {
    return (
      <div className="min-h-screen flex bg-gray-50/50">
        {!isEmbed && (
          <>
            {DesktopSidebar}
            {MobileSidebar}
          </>
        )}

        <div className={`flex-1 flex flex-col ${isEmbed ? "w-full" : ""}`}>
          <div className={`flex-1 flex flex-col justify-center items-center ${isEmbed ? "py-0" : "py-12 sm:px-6 lg:px-8"}`}>
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4 mb-8">
              <h1 className="text-[#1F4D3E]" style={{ fontFamily: "var(--font-gilda-display), serif", fontSize: 48, lineHeight: "1.1em" }}>
                5 Star Weddings
              </h1>
              <h2 className="text-[#2F4F3F] opacity-90" style={{ fontFamily: "var(--font-gilda-display), serif", fontSize: 32 }}>
                Concierge
              </h2>
              <p className="text-gray-500 mt-4 text-[16px]">Please tell us a bit about yourself to start.</p>
            </div>

            {/* When logged in, do not show the role selector */}
            {!isSignedIn && (
              <div className="flex justify-center mb-8">
                <div className="bg-white p-1.5 rounded-full border border-gray-200 shadow-sm inline-flex">
                  <button
                    onClick={() => setMode("vendor")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      mode === "vendor" ? "bg-[#1F4D3E] text-white shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    I am a Vendor
                  </button>
                  <button
                    onClick={() => setMode("couple")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      mode === "couple" ? "bg-[#1F4D3E] text-white shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    I am a Couple
                  </button>
                </div>
              </div>
            )}

            <div className="sm:mx-auto sm:w-full sm:max-w-[500px]">
              <div className={`bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 ${isEmbed ? "p-6" : "p-8 sm:p-10"}`}>
                <form className="space-y-5" onSubmit={handleStartChat}>
                  {formError && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{formError}</div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-[15px] font-medium text-gray-700 ml-1">Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[15px] font-medium text-gray-700 ml-1">Email</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[15px] font-medium text-gray-700 ml-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[15px] font-medium text-gray-700 ml-1">{isVendor ? "Website" : "Wedding Date"}</label>
                      {isVendor ? (
                        <input
                          type="text"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="For example yoursite"
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E]"
                        />
                      ) : (
                        <input
                          type="date"
                          value={formData.weddingDate}
                          onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E]"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[15px] font-medium text-gray-700 ml-1">
                      {isVendor ? "Company or Venue Name" : "Venue Location or Preferences"}
                    </label>
                    <input
                      type="text"
                      value={formData.venueOrLocation}
                      onChange={(e) => setFormData({ ...formData, venueOrLocation: e.target.value })}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#1F4D3E] focus:border-[#1F4D3E]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isStarting}
                      className="w-full flex justify-center py-3.5 px-4 rounded-lg shadow-md text-[16px] font-medium text-white bg-[#2D4539] hover:bg-[#1F362C] focus:ring-2 focus:ring-offset-2 focus:ring-[#1F4D3E] disabled:opacity-70"
                    >
                      {isStarting ? "Starting Chat..." : "Start Chatting"}
                    </button>
                  </div>
                </form>

                <div className="mt-4 text-xs text-gray-500">
                  Want to browse now?{" "}
                  <a href="https://5starweddingdirectory.com" target="_blank" rel="noopener noreferrer" className="text-[#1F4D3E] hover:underline">
                    Open 5starweddingdirectory.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <BrandFooter onOpenCookies={() => setIsCookieModalOpen(true)} />
          <CookiePreferenceCenter isOpen={isCookieModalOpen} onClose={() => setIsCookieModalOpen(false)} />
        </div>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={mode} onSuccess={handleAuthSuccess} />
      </div>
    );
  }

  /* =========================================================
     CHAT VIEW
     ========================================================= */
  return (
    <div className="min-h-screen flex bg-gray-50">
      {!isEmbed && (
        <>
          {DesktopSidebar}
          {MobileSidebar}
        </>
      )}

      <div className={`flex-1 flex flex-col bg-white sm:bg-gray-50 text-gray-900 font-sans ${isEmbed ? "h-screen" : ""}`}>
        {/* Header, always visually centered on the viewport */}
        <div className="bg-white px-4 sm:px-6 py-4 shadow-sm z-10 border-b border-gray-100 relative">
          <div className="relative h-[44px]">
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center pointer-events-none">
              <h1 className="text-[#1F4D3E]" style={{ fontFamily: "var(--font-gilda-display), serif", fontSize: 28, lineHeight: 1 }}>
                5 Star Weddings
              </h1>
              <h2 className="text-[#1F4D3E] opacity-90" style={{ fontFamily: "var(--font-gilda-display), serif", fontSize: 20 }}>
                Concierge
              </h2>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-gray-400 hover:text-[#1F4D3E] hover:bg-green-50 rounded-full p-2 transition-all"
                title="Sign In or Register"
              >
                <UserPlus size={18} />
              </button>
              <button
                onClick={handleDeleteConversation}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-all"
                title="End Chat"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Chat area, ChatGPT like width */}
        <div className="flex-1 overflow-hidden relative w-full">
          <div ref={scrollRef} className="h-full overflow-y-auto px-4 sm:px-6 py-4 space-y-6 scroll-smooth pb-28">
            <div className="w-full max-w-3xl mx-auto space-y-6">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-[#1F4D3E] flex items-center justify-center text-white text-xs mr-2 flex-shrink-0 mt-2 font-serif">
                      5*
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-6 py-4 text-[15px] sm:text-base leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "bg-[#1F4D3E] text-white rounded-2xl rounded-br-sm"
                        : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    {m.role === "user" ? m.content : <FormattedMessage content={m.content} />}
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
        </div>

        {/* Composer, same width as chat */}
        <div className="bg-white border-t border-gray-100 p-4 w-full z-20">
          <div className="w-full max-w-3xl mx-auto">
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
                <VoiceToTextButton onText={(t) => setInput((prev) => (prev ? `${prev} ${t}` : t))} />
                <AuraVoice />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="h-10 w-10 rounded-full flex items-center justify-center bg-[#1F4D3E] text-white shadow-md hover:bg-[#163C30] disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
              <span>
                Tip, open the directory anytime:{" "}
                <a href="https://5starweddingdirectory.com" target="_blank" rel="noopener noreferrer" className="text-[#1F4D3E] hover:underline">
                  5starweddingdirectory.com
                </a>
              </span>
              {savedUser?.email ? (
                <span className="text-gray-400">Saved as {savedUser.email}</span>
              ) : (
                <button type="button" onClick={() => setIsAuthModalOpen(true)} className="text-[#1F4D3E] hover:underline">
                  Sign in to save history
                </button>
              )}
            </div>
          </div>
        </div>

        <BrandFooter onOpenCookies={() => setIsCookieModalOpen(true)} />
        <CookiePreferenceCenter isOpen={isCookieModalOpen} onClose={() => setIsCookieModalOpen(false)} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={mode} onSuccess={handleAuthSuccess} />
      </div>
    </div>
  );
}
