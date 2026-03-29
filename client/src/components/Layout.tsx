import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Map, BookOpen, Share2, DollarSign,
  BarChart3, Calendar, Megaphone, Trophy, Anchor, ChevronLeft, ChevronRight, Heart, Route
} from "lucide-react";
import { JOURNEY_TRIPS } from "@/lib/journeyData";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/map", icon: Map, label: "Journey Map" },
  { path: "/trips", icon: BookOpen, label: "Trip Log" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/social", icon: Share2, label: "Social" },
  { path: "/calendar", icon: Calendar, label: "Content Calendar" },
  { path: "/sponsors", icon: Trophy, label: "Sponsors" },
  { path: "/fundraising", icon: Heart, label: "Fundraising" },
  { path: "/campaign", icon: Megaphone, label: "Media Campaign" },
  { path: "/roadmap", icon: Route, label: "Roadmap" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const completedTrips = JOURNEY_TRIPS.filter(t => t.status === "completed").length;
  const totalTrips = JOURNEY_TRIPS.length;
  const progressPct = Math.round((completedTrips / totalTrips) * 100);

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
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "oklch(0.65 0.18 200)", color: "oklch(0.1 0.01 240)" }}>G</div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "oklch(0.92 0.005 200)" }}>Gabe</div>
              <div className="text-xs" style={{ color: "oklch(0.45 0.01 200)" }}>Snow Bros</div>
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
