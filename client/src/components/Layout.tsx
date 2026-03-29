import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Map, BookOpen, Share2,
  BarChart3, Megaphone, Trophy, Anchor, ChevronLeft, ChevronRight, Heart, Route, Lock
} from "lucide-react";
import { JOURNEY_TRIPS } from "@/lib/journeyData";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/map", icon: Map, label: "Journey Map" },
  { path: "/trips", icon: BookOpen, label: "Trip Log" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/social", icon: Share2, label: "Social" },
  { path: "/sponsors", icon: Trophy, label: "Sponsors" },
  { path: "/fundraising", icon: Heart, label: "Fundraising" },
  { path: "/campaign", icon: Megaphone, label: "Media Campaign" },
  { path: "/roadmap", icon: Route, label: "Roadmap" },
];

// ── Loading skeleton ───────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "oklch(0.13 0.01 240)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center animate-pulse" style={{ background: "oklch(0.65 0.18 200 / 20%)" }}>
          <Anchor size={20} style={{ color: "oklch(0.65 0.18 200)" }} />
        </div>
        <div className="text-xs tracking-widest uppercase" style={{ color: "oklch(0.45 0.01 200)" }}>Loading…</div>
      </div>
    </div>
  );
}

// ── Not signed in screen ───────────────────────────────────────────────────
function SignInScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "oklch(0.13 0.01 240)" }}>
      <div className="flex flex-col items-center gap-6 p-8 max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.65 0.18 200 / 15%)" }}>
          <Anchor size={28} style={{ color: "oklch(0.65 0.18 200)" }} />
        </div>
        <div>
          <div className="text-xl font-bold mb-2" style={{ color: "oklch(0.92 0.005 200)", fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}>
            CASTTRACKER
          </div>
          <div className="text-sm" style={{ color: "oklch(0.45 0.01 200)" }}>
            Working Man's Waters — Private Dashboard
          </div>
        </div>
        <button
          onClick={() => { window.location.href = getLoginUrl(); }}
          className="w-full py-3 rounded-xl text-sm font-bold tracking-wide"
          style={{ background: "oklch(0.65 0.18 200)", color: "oklch(0.1 0.01 240)", fontFamily: "'Oswald', sans-serif", letterSpacing: "0.08em" }}
        >
          SIGN IN
        </button>
      </div>
    </div>
  );
}

// ── Access denied screen (signed in but not the owner) ────────────────────
function AccessDeniedScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "oklch(0.13 0.01 240)" }}>
      <div className="flex flex-col items-center gap-6 p-8 max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.5 0.18 25 / 15%)" }}>
          <Lock size={28} style={{ color: "oklch(0.65 0.18 25)" }} />
        </div>
        <div>
          <div className="text-xl font-bold mb-2" style={{ color: "oklch(0.92 0.005 200)", fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}>
            PRIVATE DASHBOARD
          </div>
          <div className="text-sm leading-relaxed" style={{ color: "oklch(0.45 0.01 200)" }}>
            This is a personal tool for the Working Man's Waters journey. It's not open to the public.
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full py-3 rounded-xl text-sm font-bold tracking-wide"
          style={{ background: "oklch(0.22 0.012 240)", color: "oklch(0.65 0.01 200)", border: "1px solid oklch(1 0 0 / 10%)", fontFamily: "'Oswald', sans-serif", letterSpacing: "0.08em" }}
        >
          SIGN OUT
        </button>
      </div>
    </div>
  );
}

// ── Main layout ────────────────────────────────────────────────────────────
export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, loading, logout } = useAuth();

  const completedTrips = JOURNEY_TRIPS.filter(t => t.status === "completed").length;
  const totalTrips = JOURNEY_TRIPS.length;
  const progressPct = Math.round((completedTrips / totalTrips) * 100);

  // ── Auth gates ─────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;
  if (!user) return <SignInScreen />;

  // Owner check: compare user's openId against the app owner's openId
  // The server exposes ctx.user which includes openId from the DB
  const isOwner = (user as { openId?: string }).openId === import.meta.env.VITE_OWNER_OPEN_ID ||
    (user as { role?: string }).role === "admin";

  if (!isOwner) return <AccessDeniedScreen onLogout={logout} />;

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-300 relative"
        style={{
          width: collapsed ? "64px" : "220px",
          background: "oklch(0.11 0.01 240)",
          borderRight: "1px solid oklch(1 0 0 / 6%)",
          minHeight: "100vh",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "oklch(1 0 0 / 6%)" }}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.65 0.18 200)" }}>
            <Anchor size={16} style={{ color: "oklch(0.1 0.01 240)" }} />
          </div>
          {!collapsed && (
            <div>
              <div className="text-xs font-bold tracking-widest uppercase" style={{ color: "oklch(0.65 0.18 200)", fontFamily: "'Oswald', sans-serif" }}>CastTracker</div>
              <div className="text-xs" style={{ color: "oklch(0.45 0.01 200)" }}>Working Man's Waters</div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location === path;
            return (
              <Link key={path} href={path}>
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer"
                  style={{
                    background: isActive ? "oklch(0.65 0.18 200 / 15%)" : "transparent",
                    color: isActive ? "oklch(0.65 0.18 200)" : "oklch(0.65 0.01 200)",
                    borderLeft: isActive ? "2px solid oklch(0.65 0.18 200)" : "2px solid transparent",
                  }}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Journey Progress Mini */}
        {!collapsed && (
          <div className="px-4 py-4 border-t" style={{ borderColor: "oklch(1 0 0 / 6%)" }}>
            <div className="text-xs mb-2 flex justify-between" style={{ color: "oklch(0.45 0.01 200)" }}>
              <span>MISSION PROGRESS</span>
              <span style={{ color: "oklch(0.65 0.18 200)", fontFamily: "'JetBrains Mono', monospace" }}>{completedTrips}/{totalTrips}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(1 0 0 / 8%)" }}>
              <div
                className="h-full rounded-full journey-bar"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-2 text-xs" style={{ color: "oklch(0.45 0.01 200)" }}>
              Moorhead → Lanesboro, MN
            </div>
          </div>
        )}

        {/* User */}
        {!collapsed && (
          <div className="px-4 py-3 border-t flex items-center gap-3" style={{ borderColor: "oklch(1 0 0 / 6%)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "oklch(0.65 0.18 200)", color: "oklch(0.1 0.01 240)" }}>
              {user.name ? user.name.charAt(0).toUpperCase() : "G"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: "oklch(0.92 0.005 200)" }}>{user.name ?? "Gabe"}</div>
              <button onClick={logout} className="text-xs hover:opacity-70" style={{ color: "oklch(0.45 0.01 200)" }}>Sign out</button>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full flex items-center justify-center z-10"
          style={{ background: "oklch(0.22 0.012 240)", border: "1px solid oklch(1 0 0 / 10%)", color: "oklch(0.65 0.01 200)" }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto" style={{ background: "oklch(0.13 0.01 240)" }}>
        {children}
      </main>
    </div>
  );
}
