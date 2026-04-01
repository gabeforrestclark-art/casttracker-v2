import { JOURNEY_TRIPS, JOURNEY_SITES, ANALYTICS, FUNDRAISING } from "@/lib/journeyData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Anchor, TrendingUp, Eye, FileText, Users, Heart, Map, Fish } from "lucide-react";

const teal = "oklch(0.65 0.18 200)";
const orange = "oklch(0.65 0.18 50)";
const dark = "oklch(0.17 0.012 240)";
const border = "oklch(1 0 0 / 8%)";
const muted = "oklch(0.45 0.01 200)";
const fg = "oklch(0.92 0.005 200)";

function StatCard({ icon: Icon, label, value, growth, color }: { icon: any; label: string; value: string; growth?: string; color?: string }) {
  return (
    <div className="rounded-xl p-5" style={{ background: dark, border: `1px solid ${border}` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium tracking-widest uppercase" style={{ color: muted }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color || teal}20` }}>
          <Icon size={16} style={{ color: color || teal }} />
        </div>
      </div>
      <div className="text-3xl font-bold" style={{ color: fg, fontFamily: "'Oswald', sans-serif" }}>{value}</div>
      {growth && <div className="text-xs mt-1" style={{ color: teal }}>↑ {growth} vs last month</div>}
    </div>
  );
}

export default function Dashboard() {
  const completedTrips = JOURNEY_TRIPS.filter(t => t.status === "completed").length;
  const totalTrips = JOURNEY_TRIPS.length;
  const progressPct = Math.round((completedTrips / totalTrips) * 100);
  const nextTrip = JOURNEY_TRIPS.find(t => t.status !== "completed");
  const nextSite = nextTrip ? JOURNEY_SITES.find(s => s.id === nextTrip.siteId) : null;
  const goFundPct = Math.round((FUNDRAISING.goFundMeRaised / FUNDRAISING.goFundMeGoal) * 100);
  const patreonPct = Math.round((FUNDRAISING.patreonMonthly / FUNDRAISING.patreonGoal) * 100);

  const recentTrips = JOURNEY_TRIPS.filter(t => t.status === "completed").slice(-3).reverse();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: fg, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}>
            WORKING MAN'S WATERS
          </h1>
          <p className="text-sm mt-0.5" style={{ color: muted }}>One paddle. One kayak. All of Minnesota.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: `${teal}15`, border: `1px solid ${teal}30` }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: teal }} />
          <span className="text-sm font-medium" style={{ color: teal }}>SEASON 1 — 2026</span>
        </div>
      </div>

      {/* Journey Progress Banner */}
      <div className="rounded-xl p-5" style={{ background: dark, border: `1px solid ${border}` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Anchor size={20} style={{ color: teal }} />
            <div>
              <div className="font-bold text-lg" style={{ color: fg, fontFamily: "'Oswald', sans-serif" }}>
                MISSION PROGRESS — TRIP {completedTrips} OF {totalTrips}
              </div>
              <div className="text-xs" style={{ color: muted }}>Moorhead, MN → Root River, Lanesboro, MN</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: teal, fontFamily: "'JetBrains Mono', monospace" }}>{progressPct}%</div>
            <div className="text-xs" style={{ color: muted }}>complete</div>
          </div>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "oklch(1 0 0 / 6%)" }}>
          <div className="h-full rounded-full journey-bar transition-all duration-1000" style={{ width: `${progressPct}%` }} />
        </div>
        {nextSite && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs" style={{ color: muted }}>NEXT UP:</span>
            <span className="text-xs font-semibold" style={{ color: orange }}>
              Trip {nextTrip?.tripNumber} — {nextSite.name} ({nextSite.location}) — {nextTrip?.date}
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Followers" value={ANALYTICS.totalFollowers.toLocaleString()} growth={`${ANALYTICS.followerGrowth}%`} />
        <StatCard icon={TrendingUp} label="Engagement" value={ANALYTICS.engagement.toLocaleString()} growth={`${ANALYTICS.engagementGrowth}%`} color={orange} />
        <StatCard icon={Eye} label="Total Views" value={ANALYTICS.totalViews.toLocaleString()} growth={`${ANALYTICS.viewsGrowth}%`} color="oklch(0.55 0.15 145)" />
        <StatCard icon={FileText} label="Posts Published" value={ANALYTICS.postsPublished.toString()} growth={`${ANALYTICS.postsGrowth}%`} color="oklch(0.65 0.15 280)" />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Engagement Chart */}
        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: dark, border: `1px solid ${border}` }}>
          <div className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: muted }}>Weekly Engagement</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ANALYTICS.weeklyEngagement} barGap={2}>
              <XAxis dataKey="day" tick={{ fill: muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "oklch(0.17 0.012 240)", border: `1px solid ${border}`, borderRadius: "8px", color: fg }}
                cursor={{ fill: "oklch(1 0 0 / 4%)" }}
              />
              <Bar dataKey="instagram" fill="oklch(0.65 0.18 200)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="youtube" fill="oklch(0.65 0.18 50)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="tiktok" fill="oklch(0.55 0.15 145)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {[{ label: "Instagram", color: teal }, { label: "YouTube", color: orange }, { label: "TikTok", color: "oklch(0.55 0.15 145)" }].map(p => (
              <div key={p.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                <span className="text-xs" style={{ color: muted }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="rounded-xl p-5" style={{ background: dark, border: `1px solid ${border}` }}>
          <div className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: muted }}>Platform Breakdown</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={ANALYTICS.platforms} dataKey="followers" cx="50%" cy="50%" innerRadius={40} outerRadius={65}>
                {ANALYTICS.platforms.map((p, i) => (
                  <Cell key={i} fill={p.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {ANALYTICS.platforms.map(p => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <span className="text-xs" style={{ color: muted }}>{p.name}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: fg, fontFamily: "'JetBrains Mono', monospace" }}>{p.followers.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fundraising */}
        <div className="rounded-xl p-5" style={{ background: dark, border: `1px solid ${border}` }}>
          <div className="flex items-center gap-2 mb-4">
            <Heart size={16} style={{ color: orange }} />
            <div className="text-xs font-medium tracking-widest uppercase" style={{ color: muted }}>Fundraising</div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm" style={{ color: fg }}>GoFundMe Campaign</span>
                <span className="text-sm font-bold" style={{ color: teal, fontFamily: "'JetBrains Mono', monospace" }}>${FUNDRAISING.goFundMeRaised.toLocaleString()} / ${FUNDRAISING.goFundMeGoal.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "oklch(1 0 0 / 6%)" }}>
                <div className="h-full rounded-full" style={{ width: `${goFundPct}%`, background: teal }} />
              </div>
              <div className="text-xs mt-1" style={{ color: muted }}>{goFundPct}% of goal</div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm" style={{ color: fg }}>Patreon Monthly</span>
                <span className="text-sm font-bold" style={{ color: orange, fontFamily: "'JetBrains Mono', monospace" }}>${FUNDRAISING.patreonMonthly} / ${FUNDRAISING.patreonGoal}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "oklch(1 0 0 / 6%)" }}>
                <div className="h-full rounded-full" style={{ width: `${patreonPct}%`, background: orange }} />
              </div>
              <div className="text-xs mt-1" style={{ color: muted }}>{FUNDRAISING.patreonPatrons} of {FUNDRAISING.patreonPatronGoal} patrons · ${FUNDRAISING.heroesOnWaterDonated} donated to Heroes on the Water</div>
            </div>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="rounded-xl p-5" style={{ background: dark, border: `1px solid ${border}` }}>
          <div className="flex items-center gap-2 mb-4">
            <Fish size={16} style={{ color: teal }} />
            <div className="text-xs font-medium tracking-widest uppercase" style={{ color: muted }}>Recent Trips</div>
          </div>
          {recentTrips.length === 0 ? (
            <div className="text-sm" style={{ color: muted }}>No trips completed yet. Season starts April 4, 2026!</div>
          ) : (
            <div className="space-y-3">
              {recentTrips.map(trip => {
                const site = JOURNEY_SITES.find(s => s.id === trip.siteId);
                return (
                  <div key={trip.tripNumber} className="flex items-center justify-between py-2 border-b" style={{ borderColor: border }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: fg }}>Trip #{trip.tripNumber} — {site?.name}</div>
                      <div className="text-xs" style={{ color: muted }}>{site?.location} · {trip.date}</div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded" style={{ background: `${teal}20`, color: teal }}>
                      {trip.type === "local" ? "Local" : "Journey"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-3">
            <a href="/trips" className="text-xs font-medium" style={{ color: teal }}>View all trips →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
