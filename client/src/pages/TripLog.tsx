import { useState } from "react";
import { JOURNEY_TRIPS, JOURNEY_SITES } from "@/lib/journeyData";
import { Fish, MapPin, Calendar, ChevronDown, ChevronUp, Camera } from "lucide-react";
import { MediaUploadModal } from "@/components/MediaUploadModal";
import { TripMediaGallery } from "@/components/TripMediaGallery";

const teal = "oklch(0.65 0.18 200)";
const orange = "oklch(0.65 0.18 50)";
const dark = "oklch(0.17 0.012 240)";
const border = "oklch(1 0 0 / 8%)";
const muted = "oklch(0.45 0.01 200)";
const fg = "oklch(0.92 0.005 200)";

const STATUS_COLORS: Record<string, string> = {
  completed: "oklch(0.55 0.15 145)",
  upcoming: orange,
  planned: muted,
};

export default function TripLog() {
  const [filter, setFilter] = useState<"all" | "completed" | "upcoming" | "planned">("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [season, setSeason] = useState<number | "all">("all");
  const [uploadModal, setUploadModal] = useState<{ tripNumber: number; tripName: string } | null>(null);
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

                  {/* Media Section */}
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: border }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Camera size={14} style={{ color: teal }} />
                        <span className="text-xs font-medium tracking-widest uppercase" style={{ color: muted }}>TRIP PHOTOS & VIDEOS</span>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setUploadModal({ tripNumber: trip.tripNumber, tripName: site.name });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: `${teal}20`,
                          color: teal,
                          border: `1px solid ${teal}40`,
                        }}
                      >
                        <Camera size={12} />
                        Add Media
                      </button>
                    </div>
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
          onClose={() => setUploadModal(null)}
          tripNumber={uploadModal.tripNumber}
          tripName={uploadModal.tripName}
          onUploaded={() => {
            setGalleryRefreshKey(k => k + 1);
            setUploadModal(null);
          }}
        />
      )}
    </div>
  );
}
