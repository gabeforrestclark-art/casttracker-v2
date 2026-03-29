/**
 * Automation Router
 * Handles scheduled and on-demand automation tasks:
 * - Donor thank-you detection (polls GoFundMe for new donors)
 * - Weekly weather + trip prep notification (Friday night alert)
 * - Automation log retrieval
 */
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { automationLog, socialPost } from "../drizzle/schema";
import { getDb } from "./db";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { fetchGofundmeData } from "./gofundme";
import { notifyOwner } from "./_core/notification";
import { JOURNEY_TRIPS, JOURNEY_SITES } from "../client/src/lib/journeyData";

// ── Donor Thank-You ───────────────────────────────────────────────────────────

/**
 * Checks GoFundMe for new donors since the last check.
 * Returns any new donors and auto-generates thank-you captions for each.
 */
export const automationRouter = router({
  // Check for new donors and generate thank-you drafts
  checkNewDonors: protectedProcedure.mutation(async () => {
    const db = await getDb();

    const gfData = await fetchGofundmeData();
    const donors = gfData.donors ?? [];

    // Find donors we haven't thanked yet (no socialPost with their name in last 7 days)
    let existingThankYous: Array<{ caption: string | null }> = [];

    if (db) {
      existingThankYous = await db
        .select({ caption: socialPost.caption })
        .from(socialPost)
        .where(eq(socialPost.taskId, "fundraising-thankyou"));
    }

    const thankedNames = new Set(
      existingThankYous
        .map(p => p.caption ?? "")
        .join(" ")
        .match(/\b[A-Z][a-z]+\b/g) ?? []
    );

    // Generate thank-you captions for new donors
    const newDonors = donors.filter((d: { name: string; amount: number; date?: string }) => {
      if (!d.name || d.name === "Anonymous") return false;
      return !thankedNames.has(d.name.split(" ")[0]);
    });

    const thankYouDrafts: Array<{ donor: { name: string; amount: number }; captions: string[] }> = [];

    for (const donor of newDonors.slice(0, 5)) {
      const captions = await generateThankYouCaptions(
        donor.name,
        donor.amount,
        gfData.amountRaised,
        gfData.goal
      );
      thankYouDrafts.push({ donor, captions });
    }

    // Log the automation run
    if (db) {
      await db.insert(automationLog).values({
        type: "donor_check",
        status: "success",
        summary: `Found ${newDonors.length} new donor(s). Generated ${thankYouDrafts.length} thank-you draft(s).`,
      });
    }

    return {
      totalDonors: gfData.donorCount,
      amountRaised: gfData.amountRaised,
      newDonors: newDonors.length,
      thankYouDrafts,
    };
  }),

  // ── Weekly Weather + Trip Prep Notification ───────────────────────────────
  sendWeeklyTripAlert: protectedProcedure.mutation(async () => {
    const db = await getDb();

    // Find the next upcoming trip
    const nextTrip = JOURNEY_TRIPS.find((t: { status: string }) => t.status === "upcoming") as
      | { tripNumber: number; siteId: number; date: string; status: string; season: number; type: string }
      | undefined;

    if (!nextTrip) {
      return { sent: false, reason: "No upcoming trips found" };
    }

    const site = JOURNEY_SITES.find((s: { id: number }) => s.id === nextTrip.siteId) as
      | { id: number; name: string; location: string; lat: number; lng: number; driveMinutes: number; driveMiles: number; targetSpecies: string[]; accessType: string; region: string }
      | undefined;

    if (!site) {
      return { sent: false, reason: "Site data not found" };
    }

    // Fetch weather for the trip date
    let weatherSummary = "Weather data unavailable";
    let goNoGo = "undecided";
    try {
      const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
      weatherUrl.searchParams.set("latitude", String(site.lat));
      weatherUrl.searchParams.set("longitude", String(site.lng));
      weatherUrl.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode");
      weatherUrl.searchParams.set("temperature_unit", "fahrenheit");
      weatherUrl.searchParams.set("windspeed_unit", "mph");
      weatherUrl.searchParams.set("precipitation_unit", "inch");
      weatherUrl.searchParams.set("timezone", "America/Chicago");
      weatherUrl.searchParams.set("forecast_days", "7");

      const res = await fetch(weatherUrl.toString());
      if (res.ok) {
        const data = await res.json();
        const idx = (data.daily.time as string[]).indexOf(nextTrip.date);
        if (idx >= 0) {
          const tempMax = Math.round(data.daily.temperature_2m_max[idx]);
          const tempMin = Math.round(data.daily.temperature_2m_min[idx]);
          const wind = Math.round(data.daily.windspeed_10m_max[idx]);
          const precip = Math.round(data.daily.precipitation_sum[idx] * 100) / 100;
          const code = data.daily.weathercode[idx];

          weatherSummary = `${tempMin}°F–${tempMax}°F, Wind ${wind}mph, Precip ${precip}in`;

          if (code >= 80 || wind > 20) goNoGo = "no-go";
          else if (wind > 12 || precip > 0.3) goNoGo = "caution";
          else if (code <= 2 && wind <= 12) goNoGo = "go";
        }
      }
    } catch { /* weather fetch failed, use fallback */ }

    const goNoGoEmoji = goNoGo === "go" ? "✅" : goNoGo === "no-go" ? "🚫" : "⚠️";
    const goNoGoLabel = goNoGo === "go" ? "GO" : goNoGo === "no-go" ? "NO-GO" : "CAUTION";

    const alertContent = [
      `🎣 TRIP #${nextTrip.tripNumber} PREP ALERT — ${nextTrip.date}`,
      ``,
      `📍 ${site.name}`,
      `📌 ${site.location}`,
      `🚗 ${site.driveMinutes} min drive (${site.driveMiles} mi)`,
      `🐟 Target species: ${site.targetSpecies.join(", ")}`,
      `🚣 Access: ${site.accessType}`,
      ``,
      `🌤️ WEATHER FORECAST`,
      `   ${weatherSummary}`,
      `   ${goNoGoEmoji} Recommendation: ${goNoGoLabel}`,
      ``,
      `📋 CHECKLIST REMINDERS`,
      `   • PFD, whistle, first aid kit`,
      `   • Camera/GoPro charged`,
      `   • MN fishing license current`,
      `   • Truck fueled up`,
      `   • Tell someone where you're going`,
      `   • Check GoFundMe — thank any new donors`,
      ``,
      `Have a great trip, Gabe. One paddle. One kayak. All of Minnesota. 🏕️`,
    ].join("\n");

    await notifyOwner({
      title: `Trip #${nextTrip.tripNumber} Prep Alert — ${nextTrip.date}`,
      content: alertContent,
    });

    // Log the automation run
    if (db) {
      await db.insert(automationLog).values({
        type: "weather_alert",
        status: "success",
        summary: `Trip #${nextTrip.tripNumber} at ${site.name} on ${nextTrip.date}. Weather: ${weatherSummary}. Recommendation: ${goNoGoLabel}.`,
      });
    }

    return {
      sent: true,
      tripNumber: nextTrip.tripNumber,
      siteName: site.name,
      date: nextTrip.date,
      weather: weatherSummary,
      goNoGo,
    };
  }),

  // ── Get automation logs ───────────────────────────────────────────────────
  getLogs: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(automationLog)
        .orderBy(desc(automationLog.runAt))
        .limit(input.limit);
    }),
});

// ── Helper: Generate thank-you captions via LLM ───────────────────────────────
async function generateThankYouCaptions(
  donorName: string,
  amount: number,
  totalRaised: number,
  goal: number
): Promise<string[]> {
  const percentComplete = Math.round((totalRaised / goal) * 100);
  const heroesAmount = Math.round(totalRaised * 0.15);

  const prompt = `Write 3 short, genuine social media thank-you posts for a GoFundMe donor.

Campaign: Working Man's Waters — Gabe's 4-year solo kayak fishing journey across all 124 Minnesota public water access sites. 15% of all donations go to Heroes on the Water (veterans kayak fishing therapy).

Donor: ${donorName}
Donation amount: $${amount}
Total raised so far: $${totalRaised} (${percentComplete}% of goal)
Heroes on the Water pledge so far: $${heroesAmount}

Each thank-you should:
- Be 2-3 sentences max
- Sound genuine and personal, not corporate
- Mention the donor by first name
- Reference the journey or the cause briefly
- Not be over-the-top or sappy

Format as JSON: {"captions": ["caption1", "caption2", "caption3"]}`;

  try {
    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "thank_you_captions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              captions: { type: "array", items: { type: "string" } },
            },
            required: ["captions"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = response.choices[0].message.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    return parsed.captions as string[];
  } catch {
    const firstName = donorName.split(" ")[0];
    return [
      `Big thanks to ${firstName} for the support on Working Man's Waters! Every dollar gets me one trip closer to fishing all of Minnesota — and 15% goes straight to Heroes on the Water. Means a lot. 🎣`,
      `${firstName} — thank you. Seriously. This journey doesn't happen without people like you backing it. One paddle. One kayak. All of Minnesota. #WorkingMansWaters`,
      `Grateful for ${firstName}'s donation to the Working Man's Waters campaign. We're at $${totalRaised.toLocaleString()} raised — $${heroesAmount.toLocaleString()} pledged to veterans fishing therapy. Let's keep going. 🙏`,
    ];
  }
}


