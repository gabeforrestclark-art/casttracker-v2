import { useState } from "react";
import { JOURNEY_TRIPS, JOURNEY_SITES } from "@/lib/journeyData";
import {
  Fish, MapPin, Calendar, ChevronDown, ChevronUp, Camera,
  ClipboardList, Sparkles, Copy, Check, Send, Zap, Bell, FileText, RefreshCw
} from "lucide-react";
import { MediaUploadModal } from "@/components/MediaUploadModal";
import { TripMediaGallery } from "@/components/TripMediaGallery";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const teal = "oklch(0.65 0.18 200)";
const orange = "oklch(0.65 0.18 50)";
const green = "oklch(0.55 0.15 145)";
const dark = "oklch(0.17 0.012 240)";
const darker = "oklch(0.13 0.01 240)";
const border = "oklch(1 0 0 / 8%)";
const muted = "oklch(0.45 0.01 200)";
const fg = "oklch(0.92 0.005 200)";

const STATUS_COLORS: Record<string, string> = {
  completed: green,
  upcoming: orange,
  planned: muted,
};

// ── Catch Logger Modal ─────────────────────────────────────────────────────────
function CatchLoggerModal({
  trip,
  siteName,
  location,
  onClose,
}: {
  trip: { tripNumber: number; date: string };
  siteName: string;
  location: string;
  onClose: () => void;
}) {
  const [fishCaught, setFishCaught] = useState(0);
  const [species, setSpecies] = useState<Array<{ species: string; count: number; biggestInches?: number }>>([]);
  const [newSpecies, setNewSpecies] = useState("");
  const [newCount, setNewCount] = useState(1);
  const [newBiggest, setNewBiggest] = useState("");
  const [waterTemp, setWaterTemp] = useState("");
  const [weatherSummary, setWeatherSummary] = useState("");
  const [windMph, setWindMph] = useState("");
  const [baitUsed, setBaitUsed] = useState("");
  const [launchTime, setLaunchTime] = useState("");
  const [hoursOnWater, setHoursOnWater] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [captions, setCaptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState(0);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"log" | "caption">("log");

  const upsert = trpc.tripCatch.upsert.useMutation();
  const generateCaption = trpc.tripCatch.generateCaption.useMutation();
  const saveCaption = trpc.tripCatch.saveCaption.useMutation();

  const addSpecies = () => {
    if (!newSpecies.trim()) return;
    setSpecies(prev => [...prev, {
      species: newSpecies.trim(),
      count: newCount,
      biggestInches: newBiggest ? parseFloat(newBiggest) : undefined,
    }]);
    setFishCaught(prev => prev + newCount);
    setNewSpecies("");
    setNewCount(1);
    setNewBiggest("");
  };

  const removeSpecies = (i: number) => {
    setSpecies(prev => {
      const removed = prev[i];
      setFishCaught(fc => Math.max(0, fc - removed.count));
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleSaveAndGenerate = async () => {
    try {
      await upsert.mutateAsync({
        tripNumber: trip.tripNumber,
        fishCaught,
        species,
        waterTemp: waterTemp || undefined,
        weatherSummary: weatherSummary || undefined,
        windMph: windMph ? parseInt(windMph) : undefined,
        baitUsed: baitUsed || undefined,
        launchTime: launchTime || undefined,
        hoursOnWater: hoursOnWater || undefined,
        personalNotes: personalNotes || undefined,
      });

      const result = await generateCaption.mutateAsync({
        tripNumber: trip.tripNumber,
        siteName,
        location,
        fishCaught,
        species,
        waterTemp: waterTemp || undefined,
        weatherSummary: weatherSummary || undefined,
        windMph: windMph ? parseInt(windMph) : undefined,
        baitUsed: baitUsed || undefined,
        hoursOnWater: hoursOnWater || undefined,
        personalNotes: personalNotes || undefined,
      });

      setCaptions(result.captions);
      setStep("caption");
    } catch {
      toast.error("Failed to save trip data. Try again.");
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(captions[selectedCaption]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Caption copied to clipboard.");
  };

  const handleSaveCaption = async () => {
    await saveCaption.mutateAsync({ tripNumber: trip.tripNumber, caption: captions[selectedCaption] });
    toast.success("Caption saved to trip log.");
    onClose();
  };

  const inputStyle = {
    background: darker,
    border: `1px solid ${border}`,
    color: fg,
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "13px",
    width: "100%",
    outline: "none",
  };

  const labelStyle = { color: muted, fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: "4px", display: "block" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "oklch(0 0 0 / 70%)" }}>
      <div className="w-full max-w-2xl mx-4 rounded-2xl overflow-hidden" style={{ background: "oklch(0.15 0.01 240)", border: `1px solid ${border}`, maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: border }}>
          <div>
            <div className="font-bold text-sm" style={{ color: teal, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.06em" }}>
              {step === "log" ? "LOG CATCH" : "CAPTION GENERATOR"}
            </div>
            <div className="text-xs mt-0.5" style={{ color: muted }}>Trip #{trip.tripNumber} — {siteName}</div>
          </div>
          <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: dark, color: muted }}>Close</button>
        </div>

        {step === "log" ? (
          <div className="p-6 space-y-5">
            {/* Fish Caught */}
            <div>
              <label style={labelStyle}>Total Fish Caught</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setFishCaught(Math.max(0, fishCaught - 1))} className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold" style={{ background: dark, color: muted }}>−</button>
                <span className="text-3xl font-bold w-16 text-center" style={{ color: teal, fontFamily: "'JetBrains Mono', monospace" }}>{fishCaught}</span>
                <button onClick={() => setFishCaught(fishCaught + 1)} className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold" style={{ background: dark, color: teal }}>+</button>
                <span className="text-sm ml-2" style={{ color: muted }}>fish</span>
              </div>
            </div>

            {/* Species */}
            <div>
              <label style={labelStyle}>Species Breakdown</label>
              <div className="flex gap-2 mb-2">
                <input value={newSpecies} onChange={e => setNewSpecies(e.target.value)} placeholder="Species (e.g. Walleye)" style={{ ...inputStyle, flex: 2 }} onKeyDown={e => e.key === "Enter" && addSpecies()} />
                <input value={newCount} onChange={e => setNewCount(parseInt(e.target.value) || 1)} type="number" min={1} placeholder="Count" style={{ ...inputStyle, flex: 1 }} />
                <input value={newBiggest} onChange={e => setNewBiggest(e.target.value)} placeholder='Biggest (")' style={{ ...inputStyle, flex: 1 }} />
                <button onClick={addSpecies} className="px-3 py-2 rounded-lg text-xs font-bold" style={{ background: `${teal}20`, color: teal, border: `1px solid ${teal}40`, whiteSpace: "nowrap" }}>+ Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {species.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs" style={{ background: `${teal}15`, color: teal, border: `1px solid ${teal}30` }}>
                    <Fish size={10} />
                    {s.count}x {s.species}{s.biggestInches ? ` (${s.biggestInches}")` : ""}
                    <button onClick={() => removeSpecies(i)} className="ml-1 opacity-60 hover:opacity-100">×</button>
                  </div>
                ))}
                {species.length === 0 && <span className="text-xs" style={{ color: muted }}>No species added yet</span>}
              </div>
            </div>

            {/* Conditions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Water Temp</label>
                <input value={waterTemp} onChange={e => setWaterTemp(e.target.value)} placeholder="e.g. 58°F" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Wind Speed (mph)</label>
                <input value={windMph} onChange={e => setWindMph(e.target.value)} type="number" placeholder="e.g. 8" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Weather Summary</label>
                <input value={weatherSummary} onChange={e => setWeatherSummary(e.target.value)} placeholder="e.g. Partly cloudy" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Bait / Lure Used</label>
                <input value={baitUsed} onChange={e => setBaitUsed(e.target.value)} placeholder="e.g. Jig + minnow" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Launch Time</label>
                <input value={launchTime} onChange={e => setLaunchTime(e.target.value)} placeholder="e.g. 5:30 AM" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Hours on Water</label>
                <input value={hoursOnWater} onChange={e => setHoursOnWater(e.target.value)} placeholder="e.g. 4.5 hrs" style={inputStyle} />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>Personal Notes</label>
              <textarea value={personalNotes} onChange={e => setPersonalNotes(e.target.value)} placeholder="What happened out there? Anything memorable? Be honest — even a skunk day is a good story." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <button
              onClick={handleSaveAndGenerate}
              disabled={upsert.isPending || generateCaption.isPending}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: teal, color: "oklch(0.1 0.01 240)", fontFamily: "'Oswald', sans-serif", letterSpacing: "0.08em", opacity: (upsert.isPending || generateCaption.isPending) ? 0.6 : 1 }}
            >
              <Sparkles size={16} />
              {upsert.isPending || generateCaption.isPending ? "SAVING & GENERATING..." : "SAVE TRIP + GENERATE CAPTIONS"}
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="text-sm" style={{ color: muted }}>Pick the caption that sounds most like you, then copy or save it.</div>

            {/* Caption Options */}
            <div className="space-y-3">
              {captions.map((caption, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedCaption(i)}
                  className="p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: selectedCaption === i ? `${teal}10` : dark,
                    border: `1px solid ${selectedCaption === i ? teal + "50" : border}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: selectedCaption === i ? teal : border, color: selectedCaption === i ? "oklch(0.1 0.01 240)" : muted }}>
                      {i + 1}
                    </div>
                    <span className="text-xs font-semibold" style={{ color: selectedCaption === i ? teal : muted }}>Option {i + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: fg }}>{caption}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleCopyCaption} className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ background: dark, color: teal, border: `1px solid ${teal}40` }}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "COPIED!" : "COPY"}
              </button>
              <button onClick={handleSaveCaption} disabled={saveCaption.isPending} className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ background: teal, color: "oklch(0.1 0.01 240)", fontFamily: "'Oswald', sans-serif" }}>
                <Check size={14} />
                SAVE TO TRIP LOG
              </button>
            </div>

            <button onClick={() => setStep("log")} className="w-full text-xs py-2" style={{ color: muted }}>← Back to edit catch data</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Automation Panel ───────────────────────────────────────────────────────────
function AutomationPanel() {
  const [showLogs, setShowLogs] = useState(false);

  const checkDonors = trpc.automation.checkNewDonors.useMutation({
    onSuccess: (data) => {
      if (data.newDonors > 0) {
        toast.success(`${data.newDonors} new donor(s) found! ${data.thankYouDrafts.length} thank-you draft(s) generated.`);
      } else {
        toast("No new donors — all donors have been thanked.");
      }
    },
  });

  const sendWeatherAlert = trpc.automation.sendWeeklyTripAlert.useMutation({
    onSuccess: (data) => {
      if (data.sent) {
        toast.success(`Trip prep alert sent! Trip #${data.tripNumber} at ${data.siteName} — ${data.weather}`);
      } else {
        toast("No upcoming trips found.");
      }
    },
  });

  const generateReport = trpc.tripCatch.generateMonthlyReport.useMutation({
    onSuccess: () => {
      toast.success("Monthly report generated and sent to your Manus notifications!");
    },
  });

  const { data: logs } = trpc.automation.getLogs.useQuery({ limit: 10 });

  const automations = [
    {
      icon: Bell,
      label: "Check New Donors",
      description: "Scan GoFundMe for new donors & generate thank-you drafts",
      color: teal,
      action: () => checkDonors.mutate(),
      loading: checkDonors.isPending,
    },
    {
      icon: Send,
      label: "Send Trip Prep Alert",
      description: "Fetch weather for next trip & send prep notification",
      color: orange,
      action: () => sendWeatherAlert.mutate(),
      loading: sendWeatherAlert.isPending,
    },
    {
      icon: FileText,
      label: "Generate Monthly Report",
      description: "Auto-generate GoFundMe + Patreon summary report",
      color: green,
      action: () => generateReport.mutate(),
      loading: generateReport.isPending,
    },
  ];

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: dark, border: `1px solid ${border}` }}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: border }}>
        <div className="flex items-center gap-2">
          <Zap size={16} style={{ color: orange }} />
          <span className="text-sm font-bold tracking-widest uppercase" style={{ color: fg, fontFamily: "'Oswald', sans-serif" }}>Automations</span>
        </div>
        <button onClick={() => setShowLogs(!showLogs)} className="text-xs flex items-center gap-1" style={{ color: muted }}>
          <RefreshCw size={11} />
          {showLogs ? "Hide Logs" : "View Logs"}
        </button>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {automations.map(({ icon: Icon, label, description, color, action, loading }) => (
          <button
            key={label}
            onClick={action}
            disabled={loading}
            className="text-left p-4 rounded-xl transition-all"
            style={{ background: darker, border: `1px solid ${border}`, opacity: loading ? 0.6 : 1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={14} style={{ color }} />
              </div>
              <span className="text-xs font-bold" style={{ color: fg }}>{label}</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: muted }}>{description}</p>
            {loading && <div className="mt-2 text-xs" style={{ color }}>Running…</div>}
          </button>
        ))}
      </div>

      {showLogs && logs && logs.length > 0 && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: border }}>
          <div className="text-xs font-bold tracking-widest uppercase mt-4 mb-2" style={{ color: muted }}>Recent Automation Runs</div>
          <div className="space-y-1.5">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-3 text-xs py-2 px-3 rounded-lg" style={{ background: darker }}>
                <span className="px-1.5 py-0.5 rounded text-xs font-bold uppercase" style={{ background: log.status === "success" ? `${green}20` : `${orange}20`, color: log.status === "success" ? green : orange }}>{log.status}</span>
                <span style={{ color: muted }} className="uppercase">{log.type.replace("_", " ")}</span>
                <span className="flex-1" style={{ color: fg }}>{log.summary}</span>
                <span style={{ color: muted }}>{new Date(log.runAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main TripLog Page ──────────────────────────────────────────────────────────
export default function TripLog() {
  const [filter, setFilter] = useState<"all" | "completed" | "upcoming" | "planned">("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [season, setSeason] = useState<number | "all">("all");
  const [uploadModal, setUploadModal] = useState<{ tripNumber: number; tripName: string } | null>(null);
  const [catchModal, setCatchModal] = useState<{ tripNumber: number; date: string; siteName: string; location: string } | null>(null);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);

  const filtered = JOURNEY_TRIPS.filter(t => {
    if (filter !== "all" && t.status !== filter) return false;
    if (season !== "all" && t.season !== season) return false;
    return true;
  });

  const completedCount = JOURNEY_TRIPS.filter(t => t.status === "completed").length;
  const upcomingCount = JOURNEY_TRIPS.filter(t => t.status === "upcoming").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: fg, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}>TRIP LOG</h1>
          <p className="text-sm mt-0.5" style={{ color: muted }}>All 124 Working Man's Waters trips — April 2026 through August 2029</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: teal, fontFamily: "'JetBrains Mono', monospace" }}>{completedCount}</div>
            <div className="text-xs" style={{ color: muted }}>completed</div>
          </div>
          <div className="w-px h-10 mx-2" style={{ background: border }} />
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: orange, fontFamily: "'JetBrains Mono', monospace" }}>{upcomingCount}</div>
            <div className="text-xs" style={{ color: muted }}>upcoming</div>
          </div>
        </div>
      </div>

      {/* Automation Panel */}
      <AutomationPanel />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "completed", "upcoming", "planned"] as const).map(f => (
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
            {f}
          </button>
        ))}
        <div className="w-px mx-1" style={{ background: border }} />
        {([1, 2, 3, 4] as const).map(s => (
          <button
            key={s}
            onClick={() => setSeason(season === s ? "all" : s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: season === s ? `${orange}20` : dark,
              color: season === s ? orange : muted,
              border: `1px solid ${season === s ? orange + "50" : border}`,
            }}
          >
            Season {s}
          </button>
        ))}
      </div>

      {/* Trip List */}
      <div className="space-y-2">
        {filtered.map(trip => {
          const site = JOURNEY_SITES.find(s => s.id === trip.siteId)!;
          const isExpanded = expanded === trip.tripNumber;
          return (
            <div
              key={trip.tripNumber}
              className="rounded-xl overflow-hidden"
              style={{ background: dark, border: `1px solid ${border}` }}
            >
              {/* Trip Row Header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : trip.tripNumber)}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${STATUS_COLORS[trip.status]}20` }}>
                  <span className="text-sm font-bold" style={{ color: STATUS_COLORS[trip.status], fontFamily: "'JetBrains Mono', monospace" }}>
                    {trip.tripNumber}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: fg }}>{site.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: trip.type === "journey" ? `${teal}20` : `${orange}20`, color: trip.type === "journey" ? teal : orange }}>
                      {trip.type === "journey" ? "Journey" : "Local"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs flex items-center gap-1" style={{ color: muted }}>
                      <MapPin size={10} />{site.location}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: muted }}>
                      <Calendar size={10} />{trip.date}
                    </span>
                    <span className="text-xs" style={{ color: muted }}>Season {trip.season}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 rounded capitalize" style={{ background: `${STATUS_COLORS[trip.status]}15`, color: STATUS_COLORS[trip.status] }}>
                    {trip.status}
                  </span>
                  {isExpanded ? <ChevronUp size={14} style={{ color: muted }} /> : <ChevronDown size={14} style={{ color: muted }} />}
                </div>
              </div>

              {/* Expanded Panel */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: border }}>
                  {/* Trip Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3">
                    <div>
                      <div className="text-xs mb-1" style={{ color: muted }}>DRIVE TIME</div>
                      <div className="text-sm font-semibold" style={{ color: fg }}>{site.driveMinutes} min ({site.driveMiles} mi)</div>
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: muted }}>ACCESS TYPE</div>
                      <div className="text-sm font-semibold" style={{ color: fg }}>{site.accessType}</div>
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: muted }}>REGION</div>
                      <div className="text-sm font-semibold" style={{ color: fg }}>{site.region}</div>
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: muted }}>TARGET SPECIES</div>
                      <div className="text-sm font-semibold" style={{ color: fg }}>{site.targetSpecies.slice(0, 2).join(", ")}</div>
                    </div>
                  </div>

                  {/* Species Tags */}
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {site.targetSpecies.map(sp => (
                      <span key={sp} className="text-xs px-2 py-0.5 rounded" style={{ background: `${teal}10`, color: teal }}>
                        <Fish size={10} className="inline mr-1" />{sp}
                      </span>
                    ))}
                  </div>

                  {/* Log Catch Button */}
                  <div className="mt-4 pt-3 border-t flex items-center gap-3" style={{ borderColor: border }}>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setCatchModal({ tripNumber: trip.tripNumber, date: trip.date, siteName: site.name, location: site.location });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: `${green}20`, color: green, border: `1px solid ${green}40` }}
                    >
                      <ClipboardList size={12} />
                      Log Catch + Generate Caption
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setUploadModal({ tripNumber: trip.tripNumber, tripName: site.name });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: `${teal}20`, color: teal, border: `1px solid ${teal}40` }}
                    >
                      <Camera size={12} />
                      Add Media
                    </button>
                  </div>

                  {/* Media Section */}
                  <div className="mt-3">
                    <TripMediaGallery key={`${trip.tripNumber}-${galleryRefreshKey}`} tripNumber={trip.tripNumber} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <MediaUploadModal
          open={true}
          tripNumber={uploadModal.tripNumber}
          tripName={uploadModal.tripName}
          onClose={() => setUploadModal(null)}
          onUploaded={() => {
            setGalleryRefreshKey(k => k + 1);
            setUploadModal(null);
          }}
        />
      )}

      {/* Catch Logger Modal */}
      {catchModal && (
        <CatchLoggerModal
          trip={{ tripNumber: catchModal.tripNumber, date: catchModal.date }}
          siteName={catchModal.siteName}
          location={catchModal.location}
          onClose={() => setCatchModal(null)}
        />
      )}
    </div>
  );
}
