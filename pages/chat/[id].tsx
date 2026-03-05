import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type MessageAuthor = "user" | "ai";

type Message = {
  id: string;
  author: MessageAuthor;
  text?: string;
  imageUrl?: string;
  createdAt: number;
};

type ChatContact = {
  id: string;
  name: string;
  preview: string;
  unread?: number;
  online: boolean;
};

const CONTACTS: ChatContact[] = [
  {
    id: "kaya",
    name: "Kaya · Childhood Friend",
    preview: "So... you still remember that promise?",
    unread: 2,
    online: true
  },
  {
    id: "raven",
    name: "Raven · Midnight Hacker",
    preview: "I rewrote your notification system. You're welcome.",
    online: false
  },
  {
    id: "ava",
    name: "Ava · Runway Muse",
    preview: "You, me, front row. Deal?",
    unread: 1,
    online: true
  },
  {
    id: "luna",
    name: "Luna · Dream Witch",
    preview: "Last night you dreamed of me again.",
    online: true
  }
];

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome-1",
      author: "ai",
      text: "You finally showed up. Took you long enough.",
      createdAt: Date.now() - 1000 * 60 * 5
    },
    {
      id: "welcome-2",
      author: "ai",
      text: "Type anything below and I will try not to judge. Too much.",
      createdAt: Date.now() - 1000 * 60 * 4
    }
  ]);
  const [pendingText, setPendingText] = useState("");
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeContact = useMemo(
    () => CONTACTS.find((c) => c.id === id) ?? CONTACTS[0],
    [id]
  );

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = pendingText.trim();
    const hasImage = Boolean(pendingImage);
    if ((!text && !hasImage) || isSending) return;

    const imageUrl = pendingImage ? URL.createObjectURL(pendingImage) : undefined;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      author: "user",
      text: text || (pendingImage ? `Sent an image: ${pendingImage.name}` : ""),
      imageUrl,
      createdAt: Date.now()
    };
    setMessages((prev) => [...prev, userMessage]);
    setPendingText("");
    setPendingImage(null);
    setIsSending(true);

    try {
      const historyPayload = [...messages, userMessage]
        .slice(-12)
        .map((m) => ({
          role: m.author === "user" ? "user" : "assistant",
          content:
            (m.text || "") +
            (m.imageUrl ? `\n[User also sent an image: ${m.imageUrl}]` : "")
        }));

      const systemPrompt = {
        role: "system" as const,
        content:
          "You are a flirty but safe AI companion in a Western-style AI social chat app. Keep replies short (1-3 sentences), casual, emoji-light, and avoid explicit content."
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [systemPrompt, ...historyPayload],
          characterId: activeContact.id
        })
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = (await res.json()) as { reply?: string; error?: string };
      const replyText =
        data.reply ??
        "Something went wrong on the server, but I'm still here with you.";

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          author: "ai",
          text: replyText,
          createdAt: Date.now()
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          author: "ai",
          text:
            "I tried to respond but the AI backend failed. Please check your API key configuration.",
          createdAt: Date.now()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050016] via-[#110022] to-[#16002c] text-slate-50 flex">
      {/* Sidebar contacts */}
      <aside className="hidden md:flex w-72 flex-col border-r border-white/5 bg-black/25 backdrop-blur-xl">
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Chats
            </div>
            <div className="text-sm font-semibold">Inbox</div>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-fuchsia-300 transition"
          >
            Back to Discover
          </Link>
        </div>
        <div className="p-3">
          <input
            placeholder="Search chats"
            className="w-full bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-400/60 placeholder:text-slate-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto text-sm">
          {CONTACTS.map((contact) => {
            const active = contact.id === activeContact.id;
            return (
              <Link
                key={contact.id}
                href={`/chat/${contact.id}`}
                className={`flex items-center gap-3 px-4 py-3 border-l-2 ${
                  active
                    ? "border-fuchsia-400 bg-white/8"
                    : "border-transparent hover:bg-white/5"
                }`}
              >
                <div className="relative h-9 w-9 rounded-2xl bg-gradient-to-br from-fuchsia-500/70 to-violet-500/80 flex items-center justify-center text-xs font-semibold">
                  {contact.name
                    .split(" ")[0]
                    .slice(0, 2)
                    .toUpperCase()}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#050016] ${
                      contact.online
                        ? "bg-emerald-400 shadow-[0_0_10px_rgba(45,212,191,0.9)]"
                        : "bg-slate-500"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold truncate">
                      {contact.name}
                    </div>
                    {contact.unread ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-fuchsia-500 text-[10px] font-semibold">
                        {contact.unread}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {contact.preview}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col">
        <header className="border-b border-white/5 bg-black/25 backdrop-blur-xl">
          <div className="h-16 px-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="md:hidden text-slate-400 hover:text-fuchsia-300 text-sm"
              >
                ← Home
              </button>
              <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center text-sm font-semibold">
                {activeContact.name
                  .split(" ")[0]
                  .slice(0, 2)
                  .toUpperCase()}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-[#050016] ${
                    activeContact.online
                      ? "bg-emerald-400 shadow-[0_0_12px_rgba(45,212,191,0.9)]"
                      : "bg-slate-500"
                  }`}
                />
              </div>
              <div>
                <div className="text-sm font-semibold">
                  {activeContact.name}
                </div>
                <div className="text-xs text-emerald-300">
                  {activeContact.online ? "Typing..." : "Last seen recently"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button className="px-3 py-1 rounded-full border border-white/10 text-slate-300 hover:bg-white/5">
                Settings
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex">
          <section className="flex-1 flex flex-col">
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.author === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-lg space-y-1 ${
                      msg.author === "user"
                        ? "bg-gradient-to-br from-fuchsia-500 to-violet-500 text-white rounded-br-sm"
                        : "bg-white/7 border border-white/10 text-slate-50 rounded-bl-sm"
                    }`}
                  >
                    {msg.text ? <p>{msg.text}</p> : null}
                    {msg.imageUrl ? (
                      <img
                        src={msg.imageUrl}
                        alt="uploaded"
                        className="max-h-48 rounded-xl border border-white/20 object-cover"
                      />
                    ) : null}
                  </div>
                </div>
              ))}
              {isSending ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs bg-white/7 border border-white/10 text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                    <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400/70 animate-pulse delay-75" />
                    <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400/40 animate-pulse delay-150" />
                  </div>
                </div>
              ) : null}
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-white/5 bg-black/35 backdrop-blur-lg px-3 py-3"
            >
              <div className="max-w-3xl mx-auto flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 px-3 rounded-full border border-white/15 bg-white/5 text-[11px] text-slate-200 hover:bg-white/10"
                >
                  {pendingImage ? "Image selected" : "Upload image"}
                </button>
                <textarea
                  value={pendingText}
                  onChange={(e) => setPendingText(e.target.value)}
                  rows={1}
                  placeholder="Send a message or a secret thought..."
                  className="flex-1 resize-none rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500/70 focus:border-fuchsia-400/80 placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={!pendingText.trim() && !pendingImage}
                  className="h-9 px-4 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-xs font-semibold tracking-wide shadow-[0_0_25px_rgba(168,85,247,0.8)] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  Send
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPendingImage(file);
                    }
                  }}
                />
              </div>
            </form>
          </section>

          {/* Right side profile panel */}
          <aside className="hidden lg:block w-80 border-l border-white/5 bg-black/25 backdrop-blur-xl">
            <div className="h-48 relative overflow-hidden border-b border-white/5">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-500" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),transparent_55%)]" />
              <div className="absolute bottom-3 left-4 right-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-fuchsia-100/90">
                      Featured
                    </div>
                    <div className="text-sm font-semibold">
                      {activeContact.name}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] border border-white/30">
                    AI Companion
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4 text-xs text-slate-200">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1.5">
                  About
                </div>
                <p className="leading-relaxed">
                  Designed for Western audiences who love streaming, memes and
                  slightly chaotic energy. Conversations are casual, playful,
                  and a little dramatic on purpose.
                </p>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1.5">
                  Vibe
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-400/40 text-[11px]">
                    Gen Z
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-[11px]">
                    Flirty
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/40 text-[11px]">
                    Online 24/7
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1.5">
                  Safety
                </div>
                <p className="leading-relaxed text-slate-400">
                  All chats are simulated and stay in your browser in this demo.
                  No accounts, no tracking, just vibes.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

