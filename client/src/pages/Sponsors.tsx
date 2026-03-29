import { SPONSORS } from "@/lib/journeyData";
import { Trophy, Plus, Mail } from "lucide-react";
import { toast } from "sonner";

const teal = "oklch(0.65 0.18 200)";
const orange = "oklch(0.65 0.18 50)";
const dark = "oklch(0.17 0.012 240)";
const border = "oklch(1 0 0 / 8%)";
const muted = "oklch(0.45 0.01 200)";
const fg = "oklch(0.92 0.005 200)";

const STATUS_COLORS: Record<string, string> = {
  negotiating: orange,
  active: "oklch(0.55 0.15 145)",
  delivered: teal,
  paid: "oklch(0.65 0.15 280)",
  completed: muted,
};

const TIERS = [
  { name: "Local Champion", amount: "$200–$500/yr", perks: "Logo on kayak, 2 social shoutouts/month, name in video credits" },
  { name: "Regional Partner", amount: "$500–$1,000/yr", perks: "All above + dedicated sponsor video, logo on truck, quarterly check-in" },
  { name: "Journey Sponsor", amount: "$1,000+/yr", perks: "All above + co-branded content, featured in season recap documentary, first right of renewal" },
];

export default function Sponsors() {
  const totalRevenue = SPONSORS.filter(s => s.status === "active" || s.status === "paid").reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: fg, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}>SPONSORS</h1>
          <p className="text-sm mt-0.5" style={{ color: muted }}>Brand deals, deliverables, and sponsorship tiers</p>
        </div>
        <button
          onClick={() => toast.info("New deal form coming soon!")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: teal, color: "oklch(0.1 0.01 240)" }}
        >
          <Plus size={16} /> New Deal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Deals", value: SPONSORS.length.toString(), color: teal },
          { label: "Active", value: SPONSORS.filter(s => s.status === "active").toString(), color: "oklch(0.55 0.15 145)" },
          { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, color: orange },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: dark, border: `1px solid ${border}` }}>
            <div className="text-2xl font-bold" style={{ color: stat.color, fontFamily: "'Oswald', sans-serif" }}>{stat.value}</div>
            <div className="text-xs mt-1" style={{ color: muted }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Active Deals */}
      <div>
        <div className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: muted }}>CURRENT DEALS</div>
        <div className="space-y-3">
          {SPONSORS.map(s => (
            <div key={s.id} className="rounded-xl p-4" style={{ background: dark, border: `1px solid ${border}` }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${teal}20` }}>
                    <Trophy size={18} style={{ color: teal }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: fg }}>{s.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded capitalize" style={{ background: `${STATUS_COLORS[s.status]}20`, color: STATUS_COLORS[s.status] }}>{s.status}</span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${orange}10`, color: orange }}>{s.type}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail size={10} style={{ color: muted }} />
                      <span className="text-xs" style={{ color: muted }}>{s.contact} · {s.email}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: teal, fontFamily: "'JetBrains Mono', monospace" }}>${s.value.toLocaleString()}</div>
                  <div className="text-xs" style={{ color: muted }}>{s.dateRange}</div>
                </div>
              </div>
              <div className="mt-3 text-xs p-2 rounded" style={{ background: "oklch(1 0 0 / 4%)", color: muted }}>
                <span style={{ color: fg }}>Deliverables:</span> {s.deliverables}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sponsorship Tiers */}
      <div>
        <div className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: muted }}>SPONSORSHIP TIERS</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map((tier, i) => (
            <div key={tier.name} className="rounded-xl p-4" style={{ background: dark, border: `1px solid ${i === 2 ? teal + "40" : border}` }}>
              <div className="font-bold text-sm mb-1" style={{ color: i === 2 ? teal : fg }}>{tier.name}</div>
              <div className="text-lg font-bold mb-2" style={{ color: orange, fontFamily: "'Oswald', sans-serif" }}>{tier.amount}</div>
              <div className="text-xs" style={{ color: muted }}>{tier.perks}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
