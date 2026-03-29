import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { fetchGofundmeData, clearGofundmeCache } from "./gofundme";
import { publishPost, type BundlePlatform } from "./bundleSocial";
import { getDb } from "./db";
import { socialPost } from "../drizzle/schema";

export const gofundmeRouter = router({
  // ── Get live campaign data (cached 5 min) ─────────────────────────────────
  getCampaign: publicProcedure.query(async () => {
    return fetchGofundmeData();
  }),

  // ── Force refresh (bypass cache) ──────────────────────────────────────────
  refresh: publicProcedure.mutation(async () => {
    clearGofundmeCache();
    return fetchGofundmeData();
  }),

  // ── Generate a thank-you post caption for a donor ─────────────────────────
  generateThankYou: publicProcedure
    .input(
      z.object({
        donorName: z.string(),
        amount: z.number(),
        totalRaised: z.number(),
        goal: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { donorName, amount, totalRaised, goal } = input;
      const percent = Math.round((totalRaised / goal) * 100);
      const heroesAmount = Math.round(totalRaised * 0.15);

      const name = donorName === "Anonymous" ? "an anonymous donor" : donorName;

      const captions = [
        `🎣 HUGE thank you to ${name} for the $${amount} donation to Working Man's Waters! We're now at $${totalRaised.toLocaleString()} — ${percent}% of our $${goal.toLocaleString()} goal. That means $${heroesAmount.toLocaleString()} already pledged to @HeroesontheWater for veteran healing through kayak fishing. Every dollar counts. Link in bio to join the journey. #WorkingMansWaters #MNFishing #HeroesOnTheWater`,

        `Thank you ${name} — $${amount} closer to fishing all of Minnesota. 🙏 $${totalRaised.toLocaleString()} raised so far toward our $${goal.toLocaleString()} goal. 15% goes straight to Heroes on the Water. One kayak. 124 trips. All of Minnesota. #WorkingMansWaters #KayakFishing #Minnesota`,

        `Working Man's Waters update: $${totalRaised.toLocaleString()} raised! Shoutout to ${name} for the $${amount} — you're helping put veterans in kayaks through @HeroesontheWater. ${percent}% to goal. Trip 1 starts April 7th on the Red River. Come fish with me. 🎣 #WorkingMansWaters #MNFishing`,
      ];

      // Return all 3 options so the user can pick
      return {
        captions,
        donorName,
        amount,
        totalRaised,
        percent,
        heroesAmount,
      };
    }),

  // ── Publish a thank-you post to social platforms ──────────────────────────
  publishThankYou: publicProcedure
    .input(
      z.object({
        caption: z.string().min(1),
        platforms: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      let bundlePostId: string | undefined;
      let status: "published" | "failed" = "failed";
      let errorMessage: string | undefined;

      try {
        const result = await publishPost({
          caption: input.caption,
          platforms: input.platforms as BundlePlatform[],
        });
        bundlePostId = result.id;
        status = "published";
      } catch (err) {
        errorMessage = String(err);
      }

      // Log to DB under a special "fundraising" task ID
      if (db) {
        await db.insert(socialPost).values({
          taskId: "fundraising-thankyou",
          caption: input.caption,
          platforms: input.platforms.join(","),
          status,
          publishedAt: status === "published" ? new Date() : undefined,
          ayrsharePostId: bundlePostId,
          errorMessage,
        });
      }

      return {
        success: status === "published",
        postId: bundlePostId,
        error: errorMessage,
      };
    }),
});
