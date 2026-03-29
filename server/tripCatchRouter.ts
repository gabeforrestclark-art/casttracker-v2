/**
 * Trip Catch Router
 * Handles logging catch data after each Saturday trip,
 * AI caption generation, and monthly report generation.
 */
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { tripCatch, automationLog } from "../drizzle/schema";
import { getDb } from "./db";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { fetchGofundmeData } from "./gofundme";
import { fetchPatreonData } from "./patreon";
import { notifyOwner } from "./_core/notification";

const speciesEntrySchema = z.object({
  species: z.string(),
  count: z.number().int().min(0),
  biggestInches: z.number().min(0).optional(),
});

const catchInputSchema = z.object({
  tripNumber: z.number().int().positive(),
  fishCaught: z.number().int().min(0).default(0),
  species: z.array(speciesEntrySchema).optional(),
  waterTemp: z.string().max(32).optional(),
  weatherSummary: z.string().max(128).optional(),
  windMph: z.number().int().min(0).max(100).optional(),
  baitUsed: z.string().max(256).optional(),
  launchTime: z.string().max(32).optional(),
  hoursOnWater: z.string().max(32).optional(),
  gpsLat: z.string().max(32).optional(),
  gpsLng: z.string().max(32).optional(),
  personalNotes: z.string().max(2000).optional(),
});

export const tripCatchRouter = router({
  // ── Log or update a trip catch ────────────────────────────────────────────
  upsert: protectedProcedure
    .input(catchInputSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const speciesJson = input.species ? JSON.stringify(input.species) : null;

      await db
        .insert(tripCatch)
        .values({
          tripNumber: input.tripNumber,
          fishCaught: input.fishCaught,
          speciesJson,
          waterTemp: input.waterTemp ?? null,
          weatherSummary: input.weatherSummary ?? null,
          windMph: input.windMph ?? null,
          baitUsed: input.baitUsed ?? null,
          launchTime: input.launchTime ?? null,
          hoursOnWater: input.hoursOnWater ?? null,
          gpsLat: input.gpsLat ?? null,
          gpsLng: input.gpsLng ?? null,
          personalNotes: input.personalNotes ?? null,
        })
        .onDuplicateKeyUpdate({
          set: {
            fishCaught: input.fishCaught,
            ...(speciesJson !== null && { speciesJson }),
            ...(input.waterTemp !== undefined && { waterTemp: input.waterTemp }),
            ...(input.weatherSummary !== undefined && { weatherSummary: input.weatherSummary }),
            ...(input.windMph !== undefined && { windMph: input.windMph }),
            ...(input.baitUsed !== undefined && { baitUsed: input.baitUsed }),
            ...(input.launchTime !== undefined && { launchTime: input.launchTime }),
            ...(input.hoursOnWater !== undefined && { hoursOnWater: input.hoursOnWater }),
            ...(input.gpsLat !== undefined && { gpsLat: input.gpsLat }),
            ...(input.gpsLng !== undefined && { gpsLng: input.gpsLng }),
            ...(input.personalNotes !== undefined && { personalNotes: input.personalNotes }),
          },
        });

      return { success: true };
    }),

  // ── Get catch log for a trip ──────────────────────────────────────────────
  getByTrip: publicProcedure
    .input(z.object({ tripNumber: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const rows = await db
        .select()
        .from(tripCatch)
        .where(eq(tripCatch.tripNumber, input.tripNumber))
        .limit(1);

      if (rows.length === 0) return null;

      const row = rows[0];
      let species: Array<{ species: string; count: number; biggestInches?: number }> = [];
      if (row.speciesJson) {
        try { species = JSON.parse(row.speciesJson); } catch { species = []; }
      }

      return { ...row, species };
    }),

  // ── Get all logged trips (for dashboard summary) ──────────────────────────
  listLogged: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(tripCatch).orderBy(desc(tripCatch.tripNumber)).limit(50);
  }),

  // ── AI caption generator ──────────────────────────────────────────────────
  generateCaption: protectedProcedure
    .input(
      z.object({
        tripNumber: z.number().int().positive(),
        siteName: z.string(),
        location: z.string(),
        fishCaught: z.number().int().min(0),
        species: z.array(speciesEntrySchema).optional(),
        waterTemp: z.string().optional(),
        weatherSummary: z.string().optional(),
        windMph: z.number().optional(),
        baitUsed: z.string().optional(),
        hoursOnWater: z.string().optional(),
        personalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const speciesText = input.species && input.species.length > 0
        ? input.species.map(s => `${s.count}x ${s.species}${s.biggestInches ? ` (biggest: ${s.biggestInches}")` : ""}`).join(", ")
        : "no fish caught";

      const prompt = `You are writing social media captions for Gabe, a working man from Moorhead, MN who is on a 4-year solo kayak fishing journey to fish all 124 Minnesota public water access sites. His campaign is called "Working Man's Waters" and he donates 15% of all fundraising to Heroes on the Water (veterans kayak fishing therapy).

Trip #${input.tripNumber} — ${input.siteName}, ${input.location}
Catch: ${speciesText}
${input.waterTemp ? `Water temp: ${input.waterTemp}` : ""}
${input.weatherSummary ? `Weather: ${input.weatherSummary}` : ""}
${input.windMph ? `Wind: ${input.windMph} mph` : ""}
${input.baitUsed ? `Bait: ${input.baitUsed}` : ""}
${input.hoursOnWater ? `Time on water: ${input.hoursOnWater}` : ""}
${input.personalNotes ? `Notes: ${input.personalNotes}` : ""}

Write 3 different social media captions for this trip. Each should:
- Sound like a real working man talking, not a polished influencer
- Be 3-5 sentences max
- Include the trip number and location
- Mention the fish caught (or be honest if skunked — that's relatable)
- End with a call to action (follow the journey, donate, or support on Patreon)
- Use 3-5 relevant hashtags at the end

Format your response as JSON: {"captions": ["caption1", "caption2", "caption3"]}`;

      try {
        const response = await invokeLLM({
          messages: [{ role: "user", content: prompt }],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "trip_captions",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  captions: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["captions"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const parsed = typeof content === "string" ? JSON.parse(content) : content;
        return { captions: parsed.captions as string[] };
      } catch (err) {
        // Fallback captions if LLM fails
        return {
          captions: [
            `Trip #${input.tripNumber} in the books. ${input.siteName}, ${input.location}. ${input.fishCaught > 0 ? `Landed ${speciesText}.` : "Got skunked today — that's fishing."} One paddle. One kayak. All of Minnesota. Follow the Working Man's Waters journey and help us support Heroes on the Water. 🎣 #WorkingMansWaters #MNFishing #KayakFishing`,
            `${input.siteName} — Trip ${input.tripNumber} of 124. ${input.fishCaught > 0 ? `${speciesText} on ${input.baitUsed || "the rod"}.` : "Blank day on the water."} Every Saturday counts. Support the journey at GoFundMe — 15% goes to veterans fishing therapy. #MNFishing #WorkingMansWaters #HeroesOnTheWater`,
            `Working man's Saturday. Up before the sun, kayak on the water at ${input.siteName}. ${input.fishCaught > 0 ? `${input.fishCaught} fish.` : "Zero fish."} ${input.hoursOnWater ? `${input.hoursOnWater} on the water.` : ""} This is what the journey looks like. Link in bio to follow along. #WorkingMansWaters #MNFishing #KayakLife`,
          ],
        };
      }
    }),

  // ── Save generated caption back to the catch log ──────────────────────────
  saveCaption: protectedProcedure
    .input(z.object({ tripNumber: z.number().int().positive(), caption: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(tripCatch)
        .set({ generatedCaption: input.caption })
        .where(eq(tripCatch.tripNumber, input.tripNumber));
      return { success: true };
    }),

  // ── Monthly Fundraising Report (auto-generate on demand or scheduled) ──────
  generateMonthlyReport: protectedProcedure
    .mutation(async () => {
      const db = await getDb();

      const [gfData, ptData] = await Promise.all([
        fetchGofundmeData(),
        fetchPatreonData(),
      ]);

      const now = new Date();
      const monthName = now.toLocaleString("en-US", { month: "long", year: "numeric" });

      const reportLines = [
        `📊 WORKING MAN'S WATERS — ${monthName.toUpperCase()} FUNDRAISING REPORT`,
        ``,
        `GoFundMe`,
        `  • Raised: $${gfData.amountRaised.toLocaleString()} of $${gfData.goal.toLocaleString()} goal (${gfData.percentComplete}%)`,
        `  • Donors: ${gfData.donorCount}`,
        `  • Heroes on the Water pledge: $${gfData.heroesAmount.toLocaleString()} (15%)`,
        ``,
        `Patreon`,
        `  • Active patrons: ${ptData.patronCount}`,
        `  • Est. monthly revenue: $${ptData.monthlyRevenue}/mo`,
        ``,
        `Combined Impact`,
        `  • Total raised (GoFundMe): $${gfData.amountRaised.toLocaleString()}`,
        `  • Recurring monthly (Patreon): $${ptData.monthlyRevenue}/mo`,
        `  • Veterans fund pledge: $${gfData.heroesAmount.toLocaleString()}`,
        ``,
        `Generated: ${now.toLocaleString()}`,
      ];

      const report = reportLines.join("\n");

      // Log the automation run
      if (db) {
        await db.insert(automationLog).values({
          type: "monthly_report",
          status: "success",
          summary: `GoFundMe: $${gfData.amountRaised} raised, ${gfData.donorCount} donors. Patreon: ${ptData.patronCount} patrons.`,
        });
      }

      // Notify owner
      await notifyOwner({
        title: `${monthName} Fundraising Report`,
        content: report,
      });

      return { report, gfData, ptData };
    }),

  // ── Get recent automation logs ─────────────────────────────────────────────
  getAutomationLogs: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(automationLog).orderBy(desc(automationLog.runAt)).limit(20);
  }),
});
