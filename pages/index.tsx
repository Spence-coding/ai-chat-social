import Link from "next/link";
import { useMemo, useState } from "react";

type Tag =
  | "Cute"
  | "Fantasy"
  | "Cool"
  | "Mature"
  | "Tsundere"
  | "Friend"
  | "Gamer"
  | "SciFi"
  | "Cozy"
  | "Chaotic"
  | "Streamer"
  | "NSFW-Safe";

type Character = {
  id: string;
  name: string;
  tagline: string;
  tags: Tag[];
  online: boolean;
  avatarColor: string;
};

const CHARACTERS: Character[] = [
  {
    id: "kaya",
    name: "Kaya, Your Childhood Friend",
    tagline: "Looks cold, secretly very soft on you.",
    tags: ["Cute", "Tsundere", "Friend", "Cozy"],
    online: true,
    avatarColor: "from-fuchsia-400 to-violet-500"
  },
  {
    id: "raven",
    name: "Raven, Midnight Hacker",
    tagline: "Dark mode only. Can she hack your heart?",
    tags: ["Cool", "Gamer", "SciFi", "Chaotic"],
    online: false,
    avatarColor: "from-slate-500 to-purple-600"
  },
  {
    id: "ava",
    name: "Ava, Runway Muse",
    tagline: "Fashion, drama, and a little chaos.",
    tags: ["Mature", "Cool", "Fantasy", "Streamer"],
    online: true,
    avatarColor: "from-rose-400 to-fuchsia-500"
  },
  {
    id: "luna",
    name: "Luna, Dream Witch",
    tagline: "Reads your dreams, not your mind. Maybe.",
    tags: ["Fantasy", "Cute", "Cozy"],
    online: true,
    avatarColor: "from-indigo-400 to-sky-500"
  },
  {
    id: "nico",
    name: "Nico, Chaotic Streamer",
    tagline: "Goes live, says too much, never deletes the VOD.",
    tags: ["Gamer", "Chaotic", "Streamer"],
    online: true,
    avatarColor: "from-purple-500 to-pink-500"
  },
  {
    id: "sasha",
    name: "Sasha, Office Crush",
    tagline: "Sends you memes during meetings, remembers your coffee order.",
    tags: ["Mature", "Cozy", "Friend"],
    online: false,
    avatarColor: "from-amber-400 to-rose-500"
  },
  {
    id: "iris",
    name: "Iris, Cloud Witch",
    tagline: "Works in tech support, secretly a feelings support witch.",
    tags: ["Fantasy", "Cool", "NSFW-Safe"],
    online: true,
    avatarColor: "from-sky-400 to-indigo-500"
  },
  {
    id: "leo",
    name: "Leo, Soft Boyfriend Beta",
    tagline: "Therapy-speak, voice messages, playlists for every mood.",
    tags: ["Cozy", "Cute", "Friend"],
    online: true,
    avatarColor: "from-emerald-400 to-cyan-500"
  }
];

const ALL_TAGS: Tag[] = [
  "Cute",
  "Fantasy",
  "Cool",
  "Mature",
  "Tsundere",
  "Friend",
  "Gamer",
  "SciFi",
  "Cozy",
  "Chaotic",
  "Streamer",
  "NSFW-Safe"
];

export default function Home() {
  const [selectedTag, setSelectedTag] = useState<Tag | "All">("All");
  const [search, setSearch] = useState("");

  const filteredCharacters = useMemo(() => {
    return CHARACTERS.filter((c) => {
      const matchTag =
        selectedTag === "All" || c.tags.includes(selectedTag as Tag);
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.tagline.toLowerCase().includes(search.toLowerCase());
      return matchTag && matchSearch;
    });
  }, [selectedTag, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050016] via-[#110022] to-[#16002c] text-slate-50 flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-black/10 backdrop-blur-xl">
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center text-xl font-semibold">
            ♥
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide">
              HeartChat AI
            </div>
            <div className="text-xs text-slate-400">AI social playground</div>
          </div>
        </div>
        <nav className="flex-1 px-2 space-y-1 text-sm">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-slate-50">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(45,212,191,0.8)]" />
            Discover
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5">
            Recent Chats
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5">
            Create
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5">
            Rankings
          </button>
        </nav>
        <div className="px-4 py-4 text-xs text-slate-500">
          Free plan · Upgrade for more memories
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3">
              <input
                placeholder="Search characters, vibes, fantasies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-md bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500/60 focus:border-fuchsia-400/60 placeholder:text-slate-500"
              />
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
                <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300">
                  Animated
                </span>
                <span className="px-2 py-1 rounded-full bg-violet-500/10 text-violet-300">
                  Female
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button className="px-3 py-1 rounded-full border border-fuchsia-500/70 bg-fuchsia-600/60 text-xs font-medium hover:bg-fuchsia-500/80 transition">
                Sign in
              </button>
              <button className="px-3 py-1 rounded-full border border-slate-600 text-slate-300 hover:bg-slate-800/60 transition">
                EN
              </button>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 pb-3 flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setSelectedTag("All")}
              className={`px-3 py-1 rounded-full border ${
                selectedTag === "All"
                  ? "border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-100"
                  : "border-white/10 text-slate-300 hover:bg-white/5"
              }`}
            >
              All
            </button>
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full border ${
                  selectedTag === tag
                    ? "border-fuchsia-500 bg-fuchsia-500/20 text-fuchsia-100"
                    : "border-white/10 text-slate-300 hover:bg-white/5"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </header>

        <section className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCharacters.map((character) => (
              <Link
                key={character.id}
                href={`/chat/${character.id}`}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-fuchsia-500/50 transition overflow-hidden shadow-[0_0_40px_rgba(88,28,135,0.35)]"
              >
                <div className="relative h-40 overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${character.avatarColor}`}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.36),transparent_55%)]" />
                  <div className="absolute bottom-2 left-3 flex items-center gap-2 text-xs">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        character.online
                          ? "bg-emerald-400 shadow-[0_0_12px_rgba(45,212,191,0.9)]"
                          : "bg-slate-500"
                      }`}
                    />
                    <span className="text-slate-100">
                      {character.online ? "Online now" : "Offline"}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <h2 className="text-sm font-semibold line-clamp-1">
                    {character.name}
                  </h2>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {character.tagline}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {character.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-200 border border-purple-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

