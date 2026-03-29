import { FUNDRAISING, CAUSES } from "@/lib/journeyData";
import { Heart, ExternalLink } from "lucide-react";

const teal = "oklch(0.65 0.18 200)";
const orange = "oklch(0.65 0.18 50)";
const dark = "oklch(0.17 0.012 240)";
const border = "oklch(1 0 0 / 8%)";
const muted = "oklch(0.45 0.01 200)";
const fg = "oklch(0.92 0.005 200)";

export default function Fundraising() {
  const goFundPct = Math.round((FUNDRAISING.goFundMeRaised / FUNDRAISING.goFundMeGoal) * 100);
  const patreonPct = Math.round((FUNDRAISING.patreonMonthly / FUNDRAISING.patreonGoal) * 100);
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: fg, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}>FUNDRAISING</h1>
        <p className="text-sm mt-0.5" style={{ color: muted }}>Working Man's Waters campaign funding & cause partners</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={{ background: dark, border: `1px solid ${border}` }}>
          <div className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: muted }}>GoFundMe Campaign</div>
          <div className="text-3xl font-bold mb-1" style={{ color: teal, fontFamily: "'Oswald', sans-serif" }}>${FUNDRAISING.goFundMeRaised.toLocaleString()}</div>
          <div className="text-sm mb-3" style={{ color: muted }}>of ${FUNDRAISING.goFundMeGoal.toLocaleString()} goal</div>
          <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "oklch(1 0 0 / 6%)" }}>
            <div className="h-full rounded-full" style={{ width: `${goFundPct}%`, background: teal }} />
          </div>
          <div className="text-xs" style={{ color: muted }}>{goFundPct}% funded · 15% pledged to Heroes on the Water</div>
        </div>
        <div className="rounded-xl p-5" style={{ background: dark, border: `1px solid ${border}` }}>
          <div className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: muted }}>Patreon Monthly</div>
          <div className="text-3xl font-bold mb-1" style={{ color: orange, fontFamily: "'Oswald', sans-serif" }}>${FUNDRAISING.patreonMonthly}/mo</div>
          <div className="text-sm mb-3" style={{ color: muted }}>{FUNDRAISING.patreonPatrons} of {FUNDRAISING.patreonPatronGoal} patrons · goal: ${FUNDRAISING.patreonGoal}/mo</div>
          <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "oklch(1 0 0 / 6%)" }}>
            <div className="h-full rounded-full" style={{ width: `${patreonPct}%`, background: orange }} />
          </div>
          <div className="text-xs" style={{ color: muted }}>{patreonPct}% of monthly goal</div>
        </div>
      </div>
      <div>
        <div className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: muted }}>CAUSE PARTNERS</div>
        <div className="space-y-3">
          {CAUSES.map(c => (
            <div key={c.id} className="rounded-xl p-4 flex items-center justify-between" style={{ background: dark, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${teal}20` }}>
                  <Heart size={16} style={{ color: teal }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: fg }}>{c.name}</div>
                  <div className="text-xs" style={{ color: muted }}>{c.description}</div>
                </div>
              </div>
              <a href={c.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} style={{ color: teal }} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
