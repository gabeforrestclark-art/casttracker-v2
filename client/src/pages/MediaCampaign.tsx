const teal = "oklch(0.65 0.18 200)";
const orange = "oklch(0.65 0.18 50)";
const dark = "oklch(0.17 0.012 240)";
const border = "oklch(1 0 0 / 8%)";
const muted = "oklch(0.45 0.01 200)";
const fg = "oklch(0.92 0.005 200)";

const phases = [
  { phase: "Pre-Launch", dates: "March 2026", items: ["Film announcement video", "Set up GoFundMe & Patreon", "Design kayak branding", "Reach out to local sponsors"] },
  { phase: "Season 1 Launch", dates: "April 2026", items: ["Post announcement video", "Begin weekly trip vlogs", "Start 'Where's Gabe?' Friday posts", "First Heroes on the Water donation"] },
  { phase: "Growth Phase", dates: "May–Aug 2026", items: ["3–5 social posts/week", "Monthly Patreon exclusives", "Mid-season sponsor check-ins", "Local press outreach (WDAY, Sun Tribune)"] },
  { phase: "Season Wrap", dates: "Nov 2026", items: ["Season 1 recap documentary", "Winter plow truck vlog", "Gear review series", "Plan Season 2 journey sites"] },
];

export default function MediaCampaign() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: fg, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}>MEDIA CAMPAIGN</h1>
        <p className="text-sm mt-0.5" style={{ color: muted }}>Working Man's Waters — campaign roadmap & strategy</p>
      </div>
      <div className="rounded-xl p-5" style={{ background: dark, border: `1px solid ${border}` }}>
        <div className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: muted }}>Campaign Identity</div>
        <div className="text-xl font-bold mb-1" style={{ color: fg, fontFamily: "'Oswald', sans-serif" }}>WORKING MAN'S WATERS</div>
        <div className="text-sm" style={{ color: teal }}>One paddle. One kayak. All of Minnesota.</div>
        <div className="mt-3 text-sm" style={{ color: muted }}>A working man from Moorhead, MN paddles every public kayak fishing access in the state — 124 trips over 4 seasons — to raise money for Heroes on the Water and prove that Minnesota's waters belong to everyone.</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {phases.map(p => (
          <div key={p.phase} className="rounded-xl p-4" style={{ background: dark, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-sm" style={{ color: fg }}>{p.phase}</div>
              <div className="text-xs px-2 py-0.5 rounded" style={{ background: `${orange}20`, color: orange }}>{p.dates}</div>
            </div>
            <ul className="space-y-1.5">
              {p.items.map(item => (
                <li key={item} className="text-xs flex items-start gap-2" style={{ color: muted }}>
                  <span style={{ color: teal }}>▸</span>{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
