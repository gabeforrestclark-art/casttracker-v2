import { useState } from "react";
import { SOCIAL_POSTS } from "@/lib/journeyData";
import { Plus, Instagram, Youtube, Facebook } from "lucide-react";
import { toast } from "sonner";

const teal = "oklch(0.65 0.18 200)";
const orange = "oklch(0.65 0.18 50)";
const dark = "oklch(0.17 0.012 240)";
const border = "oklch(1 0 0 / 8%)";
const muted = "oklch(0.45 0.01 200)";
const fg = "oklch(0.92 0.005 200)";

const STATUS_COLORS: Record<string, string> = {
  draft: muted,
  scheduled: orange,
  published: "oklch(0.55 0.15 145)",
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <Instagram size={12} />,
  youtube: <Youtube size={12} />,
  facebook: <Facebook size={12} />,
  tiktok: <span style={{ fontSize: "10px", fontWeight: "bold" }}>TT</span>,
};

const CONTENT_CALENDAR = [
  { day: "Monday", platform: "Instagram / TikTok", content: "30-sec weekend highlight reel" },
  { day: "Tuesday", platform: "Facebook Group", content: "Journey map update + ask for tips on next location" },
  { day: "Wednesday", platform: "YouTube", content: "Full 8–15 min episode" },
  { day: "Thursday", platform: "Instagram / TikTok", content: "Raw 'reality' photo — the grind" },
  { day: "Friday", platform: "Snow Bros FB/IG", content: "'Where's Gabe?' cross-promo post" },
  { day: "Saturday", platform: "Instagram Stories", content: "Live water updates" },
  { day: "Sunday", platform: "Patreon", content: "Exclusive trip report + GPS waypoints" },
];

export default function Social() {
  const [tab, setTab] = useState<"posts" | "calendar">("posts");
  const [filter, setFilter] = useState<"all" | "draft" | "scheduled" | "published">("all");

  const filtered = SOCIAL_POSTS.filter(p => filter === "all" || p.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: fg, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}>SOCIAL PUBLISHING</h1>
          <p className="text-sm mt-0.5" style={{ color: muted }}>Compose, schedule, and manage your fishing content across platforms</p>
        </div>
        <button
          onClick={() => toast.info("Post composer coming soon!")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: teal, color: "oklch(0.1 0.01 240)" }}
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: dark }}>
        {(["posts", "calendar"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all"
            style={{
              background: tab === t ? "oklch(0.22 0.012 240)" : "transparent",
              color: tab === t ? fg : muted,
            }}
          >
            {t === "posts" ? "Posts" : "Weekly Rhythm"}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        <>
          {/* Status Filters */}
          <div className="flex gap-2">
            {(["all", "draft", "scheduled", "published"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                style={{
                  background: filter === f ? `${teal}20` : dark,
                  color: filter === f ? teal : muted,
                  border: `1px solid ${filter === f ? teal + "50" : border}`,
                }}
              >
                {f} {f === "all" ? `(${SOCIAL_POSTS.length})` : `(${SOCIAL_POSTS.filter(p => p.status === f).length})`}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div className="space-y-3">
            {filtered.map(post => (
              <div key={post.id} className="rounded-xl p-4" style={{ background: dark, border: `1px solid ${border}` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: fg }}>{post.content}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-xs" style={{ color: teal }}>{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs px-2 py-0.5 rounded capitalize" style={{ background: `${STATUS_COLORS[post.status]}20`, color: STATUS_COLORS[post.status] }}>
                        {post.status}
                      </span>
                      {post.date && <span className="text-xs" style={{ color: muted }}>{new Date(post.date).toLocaleDateString()}</span>}
                      <div className="flex items-center gap-1">
                        {post.platforms.map(p => (
                          <span key={p} className="flex items-center justify-center w-5 h-5 rounded" style={{ background: `${teal}15`, color: teal }}>
                            {PLATFORM_ICONS[p] || p[0].toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "calendar" && (
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
          <div className="grid grid-cols-3 px-4 py-2 text-xs font-medium tracking-widest uppercase" style={{ background: "oklch(0.15 0.01 240)", color: muted }}>
            <span>DAY</span>
            <span>PLATFORM</span>
            <span>CONTENT TYPE</span>
          </div>
          {CONTENT_CALENDAR.map((row, i) => (
            <div
              key={row.day}
              className="grid grid-cols-3 px-4 py-3 border-t"
              style={{ borderColor: border, background: i % 2 === 0 ? dark : "oklch(0.15 0.01 240)" }}
            >
              <span className="text-sm font-semibold" style={{ color: i === 4 ? orange : fg }}>{row.day}</span>
              <span className="text-xs" style={{ color: teal }}>{row.platform}</span>
              <span className="text-xs" style={{ color: muted }}>{row.content}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
