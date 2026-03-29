import { eq } from "drizzle-orm";
import { z } from "zod";
import { tripPlan } from "../drizzle/schema";
import { getDb } from "./db";
import { publicProcedure, router } from "./_core/trpc";

// Default gear checklist items for a kayak fishing trip
export const DEFAULT_CHECKLIST = [
  // Safety
  { id: "pfd", label: "PFD / Life jacket", checked: false, category: "Safety" },
  { id: "whistle", label: "Safety whistle", checked: false, category: "Safety" },
  { id: "light", label: "Waterproof flashlight / headlamp", checked: false, category: "Safety" },
  { id: "firstaid", label: "First aid kit", checked: false, category: "Safety" },
  { id: "phone", label: "Waterproof phone case / dry bag", checked: false, category: "Safety" },
  { id: "sunscreen", label: "Sunscreen & bug spray", checked: false, category: "Safety" },
  // Kayak & Paddle
  { id: "kayak", label: "Kayak loaded & secured to truck", checked: false, category: "Kayak" },
  { id: "paddle", label: "Paddle (+ spare if long trip)", checked: false, category: "Kayak" },
  { id: "anchor", label: "Anchor / stake-out pole", checked: false, category: "Kayak" },
  { id: "bilge", label: "Bilge pump / sponge", checked: false, category: "Kayak" },
  // Fishing Gear
  { id: "rods", label: "Rods & reels rigged", checked: false, category: "Fishing" },
  { id: "tackle", label: "Tackle box / lure selection", checked: false, category: "Fishing" },
  { id: "license", label: "MN fishing license (current year)", checked: false, category: "Fishing" },
  { id: "net", label: "Landing net", checked: false, category: "Fishing" },
  { id: "pliers", label: "Needle-nose pliers / hook remover", checked: false, category: "Fishing" },
  { id: "cooler", label: "Cooler / live well / catch bag", checked: false, category: "Fishing" },
  // Media / Campaign
  { id: "camera", label: "Camera / GoPro charged & mounted", checked: false, category: "Media" },
  { id: "extrabatt", label: "Extra batteries / power bank", checked: false, category: "Media" },
  { id: "sd", label: "SD cards cleared & ready", checked: false, category: "Media" },
  { id: "tripod", label: "Flexible tripod / mount", checked: false, category: "Media" },
  // Logistics
  { id: "fuel", label: "Truck fueled up", checked: false, category: "Logistics" },
  { id: "water", label: "Water & snacks packed", checked: false, category: "Logistics" },
  { id: "directions", label: "Access site directions saved offline", checked: false, category: "Logistics" },
  { id: "weather", label: "Weather forecast checked", checked: false, category: "Logistics" },
  { id: "notify", label: "Someone knows where you're going", checked: false, category: "Logistics" },
];

const checklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  checked: z.boolean(),
  category: z.string(),
});

export const planRouter = router({
  // Get plan for a trip (returns default checklist if none saved)
  getByTrip: publicProcedure
    .input(z.object({ tripNumber: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          tripNumber: input.tripNumber,
          goNoGo: "undecided" as const,
          prepNotes: "",
          checklist: DEFAULT_CHECKLIST,
        };
      }
      const rows = await db
        .select()
        .from(tripPlan)
        .where(eq(tripPlan.tripNumber, input.tripNumber))
        .limit(1);

      if (rows.length === 0) {
        return {
          tripNumber: input.tripNumber,
          goNoGo: "undecided" as const,
          prepNotes: "",
          checklist: DEFAULT_CHECKLIST,
        };
      }

      const row = rows[0];
      let checklist = DEFAULT_CHECKLIST;
      if (row.checklistJson) {
        try {
          checklist = JSON.parse(row.checklistJson);
        } catch {
          checklist = DEFAULT_CHECKLIST;
        }
      }

      return {
        tripNumber: row.tripNumber,
        goNoGo: row.goNoGo,
        prepNotes: row.prepNotes ?? "",
        checklist,
      };
    }),

  // Upsert plan (create or update)
  upsert: publicProcedure
    .input(
      z.object({
        tripNumber: z.number().int().positive(),
        goNoGo: z.enum(["go", "no-go", "undecided"]).optional(),
        prepNotes: z.string().max(2000).optional(),
        checklist: z.array(checklistItemSchema).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const checklistJson = input.checklist
        ? JSON.stringify(input.checklist)
        : undefined;

      await db
        .insert(tripPlan)
        .values({
          tripNumber: input.tripNumber,
          goNoGo: input.goNoGo ?? "undecided",
          prepNotes: input.prepNotes ?? null,
          checklistJson: checklistJson ?? null,
        })
        .onDuplicateKeyUpdate({
          set: {
            ...(input.goNoGo !== undefined && { goNoGo: input.goNoGo }),
            ...(input.prepNotes !== undefined && { prepNotes: input.prepNotes }),
            ...(checklistJson !== undefined && { checklistJson }),
          },
        });

      return { success: true };
    }),

  // Fetch weather forecast from Open-Meteo (free, no API key needed)
  getWeather: publicProcedure
    .input(
      z.object({
        lat: z.number(),
        lon: z.number(),
        tripDate: z.string(), // YYYY-MM-DD
      })
    )
    .query(async ({ input }) => {
      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.searchParams.set("latitude", String(input.lat));
        url.searchParams.set("longitude", String(input.lon));
        url.searchParams.set(
          "daily",
          "temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode"
        );
        url.searchParams.set("temperature_unit", "fahrenheit");
        url.searchParams.set("windspeed_unit", "mph");
        url.searchParams.set("precipitation_unit", "inch");
        url.searchParams.set("timezone", "America/Chicago");
        url.searchParams.set("forecast_days", "7");

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
        const data = await res.json();

        // Find the day matching the trip date
        const days: Array<{
          date: string;
          tempMax: number;
          tempMin: number;
          precipitation: number;
          windspeed: number;
          weathercode: number;
          description: string;
          icon: string;
          isTrip: boolean;
        }> = (data.daily.time as string[]).map((date: string, i: number) => ({
          date,
          tempMax: Math.round(data.daily.temperature_2m_max[i]),
          tempMin: Math.round(data.daily.temperature_2m_min[i]),
          precipitation: Math.round(data.daily.precipitation_sum[i] * 100) / 100,
          windspeed: Math.round(data.daily.windspeed_10m_max[i]),
          weathercode: data.daily.weathercode[i],
          description: wmoDescription(data.daily.weathercode[i]),
          icon: wmoIcon(data.daily.weathercode[i]),
          isTrip: date === input.tripDate,
        }));

        const tripDay = days.find(d => d.isTrip);
        const goNoGoSuggestion = tripDay
          ? suggestGoNoGo(tripDay.weathercode, tripDay.windspeed, tripDay.precipitation)
          : "undecided";

        return { days, tripDay: tripDay ?? null, goNoGoSuggestion };
      } catch (err) {
        return { days: [], tripDay: null, goNoGoSuggestion: "undecided", error: String(err) };
      }
    }),
});

// WMO weather code descriptions
function wmoDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 49) return "Foggy";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

function wmoIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code <= 49) return "🌫️";
  if (code <= 69) return "🌧️";
  if (code <= 79) return "❄️";
  if (code <= 82) return "🌦️";
  if (code <= 86) return "🌨️";
  if (code <= 99) return "⛈️";
  return "🌡️";
}

function suggestGoNoGo(
  weathercode: number,
  windspeed: number,
  precipitation: number
): "go" | "no-go" | "undecided" {
  // Hard no-go: thunderstorm, heavy rain, snow
  if (weathercode >= 80 || weathercode === 65 || weathercode === 67) return "no-go";
  // Hard no-go: winds over 20mph on a kayak
  if (windspeed > 20) return "no-go";
  // Caution: moderate wind or rain
  if (windspeed > 12 || precipitation > 0.3) return "undecided";
  // Clear/partly cloudy, calm winds
  if (weathercode <= 2 && windspeed <= 12) return "go";
  return "undecided";
}
