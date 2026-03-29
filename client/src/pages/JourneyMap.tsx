import { useEffect, useRef, useState } from "react";
import { MapView } from "@/components/Map";
import { JOURNEY_SITES, JOURNEY_TRIPS, type JourneySite } from "@/lib/journeyData";
import { Map, Fish, Clock, Navigation } from "lucide-react";

const teal = "oklch(0.65 0.18 200)";
const orange = "oklch(0.65 0.18 50)";
const dark = "oklch(0.17 0.012 240)";
const border = "oklch(1 0 0 / 8%)";
const muted = "oklch(0.45 0.01 200)";
const fg = "oklch(0.92 0.005 200)";

const ZONE_COLORS: Record<number, string> = {
  1: "#0EA5E9",
  2: "#22C55E",
  3: "#F59E0B",
  4: "#F97316",
  5: "#EF4444",
};

const ZONE_LABELS: Record<number, string> = {
  1: "Local (< 1hr)",
  2: "Zone 2 (1–2hr)",
  3: "Zone 3 (2–3hr)",
  4: "Zone 4 (3–5hr)",
  5: "Zone 5 (5hr+)",
};

export default function JourneyMap() {
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [selectedSite, setSelectedSite] = useState<JourneySite | null>(null);
  const [filter, setFilter] = useState<"all" | "local" | "journey">("all");

  const completedSiteIds = new Set(
    JOURNEY_TRIPS.filter(t => t.status === "completed").map(t => t.siteId)
  );

  const handleMapReady = (map: google.maps.Map) => {
    infoWindowRef.current = new google.maps.InfoWindow();

    // Home base marker
    const homeMarker = new google.maps.Marker({
      position: { lat: 46.8738, lng: -96.7678 },
      map,
      title: "Home Base — Moorhead, MN",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#0EA5E9",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
      zIndex: 1000,
    });

    homeMarker.addListener("click", () => {
      infoWindowRef.current?.setContent(`
        <div style="font-family:'Space Grotesk',sans-serif;padding:8px;min-width:180px;">
          <div style="font-weight:700;font-size:14px;color:#0F172A;">🏠 Home Base</div>
          <div style="color:#475569;font-size:12px;margin-top:4px;">1812 33rd St S, Moorhead, MN</div>
          <div style="color:#0EA5E9;font-size:12px;margin-top:4px;">Journey starts here</div>
        </div>
      `);
      infoWindowRef.current?.open(map, homeMarker);
    });

    // Site markers
    const sitesToShow = JOURNEY_SITES.filter(s => filter === "all" || s.type === filter);
    sitesToShow.forEach(site => {
      const tripForSite = JOURNEY_TRIPS.find(t => t.siteId === site.id);
      const isCompleted = completedSiteIds.has(site.id);
      const color = ZONE_COLORS[site.zone];

      const marker = new google.maps.Marker({
        position: { lat: site.lat, lng: site.lng },
        map,
        title: site.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: site.type === "local" ? 7 : 8,
          fillColor: isCompleted ? "#22C55E" : color,
          fillOpacity: isCompleted ? 1 : 0.85,
          strokeColor: "#ffffff",
          strokeWeight: 1.5,
        },
        label: site.type === "journey" && tripForSite ? {
          text: String(tripForSite.tripNumber),
          color: "#ffffff",
          fontSize: "9px",
          fontWeight: "bold",
        } : undefined,
      });

      marker.addListener("click", () => {
        setSelectedSite(site);
        const trip = JOURNEY_TRIPS.find(t => t.siteId === site.id);
        infoWindowRef.current?.setContent(`
          <div style="font-family:'Space Grotesk',sans-serif;padding:8px;min-width:200px;">
            <div style="font-weight:700;font-size:13px;color:#0F172A;">${site.name}</div>
            <div style="color:#475569;font-size:11px;margin-top:2px;">${site.location} · ${site.county} County</div>
            ${trip ? `<div style="color:#0EA5E9;font-size:11px;margin-top:4px;">Trip #${trip.tripNumber} · ${trip.date}</div>` : ""}
            <div style="color:#64748B;font-size:11px;margin-top:4px;">${site.driveMinutes} min · ${site.driveMiles} mi from Moorhead</div>
            <div style="color:#64748B;font-size:11px;margin-top:2px;">${site.targetSpecies.slice(0,2).join(", ")}</div>
            <div style="margin-top:4px;">
              <span style="background:${isCompleted ? "#22C55E" : color}20;color:${isCompleted ? "#22C55E" : color};padding:2px 6px;border-radius:4px;font-size:10px;">
                ${isCompleted ? "✓ Completed" : site.type === "local" ? "Local" : "Journey"}
              </span>
            </div>
          </div>
        `);
        infoWindowRef.current?.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  };

  const completedCount = completedSiteIds.size;
  const localCount = JOURNEY_SITES.filter(s => s.type === "local").length;
  const journeyCount = JOURNEY_SITES.filter(s => s.type === "journey").length;

  return (
    <div className="flex flex-col h-screen" style={{ background: "oklch(0.13 0.01 240)" }}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: border }}>
        <div className="flex items-center gap-3">
          <Map size={20} style={{ color: teal }} />
          <div>
            <h1 className="text-lg font-bold" style={{ color: fg, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}>JOURNEY MAP</h1>
            <p className="text-xs" style={{ color: muted }}>All 70 public kayak fishing access sites across Minnesota</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs" style={{ color: muted }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }} />
            {completedCount} completed
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: muted }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#0EA5E9" }} />
            {localCount} local
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: muted }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#F97316" }} />
            {journeyCount} journey
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1">
          <MapView
            onMapReady={handleMapReady}
            initialCenter={{ lat: 46.5, lng: -94.0 }}
            initialZoom={6}
            className="w-full h-full"
          />
        </div>

        {/* Side Panel */}
        <div className="w-72 flex flex-col border-l overflow-y-auto" style={{ borderColor: border, background: dark }}>
          {/* Zone Legend */}
          <div className="p-4 border-b" style={{ borderColor: border }}>
            <div className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: muted }}>DRIVE TIME ZONES</div>
            {Object.entries(ZONE_LABELS).map(([zone, label]) => (
              <div key={zone} className="flex items-center gap-2 mb-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: ZONE_COLORS[Number(zone)] }} />
                <span className="text-xs" style={{ color: muted }}>{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-3 h-3 rounded-full" style={{ background: "#22C55E" }} />
              <span className="text-xs" style={{ color: muted }}>Completed</span>
            </div>
          </div>

          {/* Selected Site Info */}
          {selectedSite && (
            <div className="p-4 border-b" style={{ borderColor: border }}>
              <div className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: muted }}>SELECTED SITE</div>
              <div className="font-bold text-sm mb-1" style={{ color: fg }}>{selectedSite.name}</div>
              <div className="text-xs mb-2" style={{ color: muted }}>{selectedSite.location}</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs" style={{ color: muted }}>
                  <Clock size={10} />{selectedSite.driveMinutes} min · {selectedSite.driveMiles} mi
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: muted }}>
                  <Navigation size={10} />{selectedSite.accessType}
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: muted }}>
                  <Fish size={10} />{selectedSite.targetSpecies.join(", ")}
                </div>
              </div>
            </div>
          )}

          {/* Site List */}
          <div className="p-4 flex-1">
            <div className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: muted }}>ALL SITES ({JOURNEY_SITES.length})</div>
            <div className="space-y-1">
              {JOURNEY_SITES.map(site => {
                const trip = JOURNEY_TRIPS.find(t => t.siteId === site.id);
                const isCompleted = completedSiteIds.has(site.id);
                return (
                  <div
                    key={site.id}
                    className="flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-all"
                    style={{ background: selectedSite?.id === site.id ? `${teal}15` : "transparent" }}
                    onClick={() => setSelectedSite(site)}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isCompleted ? "#22C55E" : ZONE_COLORS[site.zone] }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate" style={{ color: selectedSite?.id === site.id ? teal : fg }}>{site.name}</div>
                    </div>
                    {trip && <span className="text-xs flex-shrink-0" style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}>#{trip.tripNumber}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
