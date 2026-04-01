import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { socialAccounts, SocialAccount } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const PLATFORMS = ["instagram", "youtube", "tiktok", "facebook", "twitter"] as const;
type Platform = typeof PLATFORMS[number];

const DEFAULT_STATS = { handle: "", followers: 0, views: 0, posts: 0, profileUrl: "", updatedAt: null as Date | null };

export const socialAccountsRouter = router({
  // Get all platform stats
  getAll: protectedProcedure.query(async () => {
    const db = await getDb();
    const map: Record<Platform, typeof DEFAULT_STATS> = {
      instagram: { ...DEFAULT_STATS },
      youtube: { ...DEFAULT_STATS },
      tiktok: { ...DEFAULT_STATS },
      facebook: { ...DEFAULT_STATS },
      twitter: { ...DEFAULT_STATS },
    };
    if (!db) return map;

    const rows = await db.select().from(socialAccounts);
    for (const row of rows) {
      const p = row.platform as Platform;
      if (p in map) {
        map[p] = {
          handle: row.handle,
          followers: row.followers,
          views: row.views,
          posts: row.posts,
          profileUrl: row.profileUrl,
          updatedAt: row.updatedAt,
        };
      }
    }
    return map;
  }),

  // Update stats for a single platform (upsert)
  updatePlatform: protectedProcedure
    .input(z.object({
      platform: z.enum(PLATFORMS),
      handle: z.string().max(100).optional(),
      followers: z.number().int().min(0).optional(),
      views: z.number().int().min(0).optional(),
      posts: z.number().int().min(0).optional(),
      profileUrl: z.string().max(255).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, error: "DB unavailable" };

      const existing = await db.select().from(socialAccounts)
        .where(eq(socialAccounts.platform, input.platform))
        .limit(1);

      if (existing.length > 0) {
        const cur = existing[0] as SocialAccount;
        await db.update(socialAccounts)
          .set({
            handle: input.handle ?? cur.handle,
            followers: input.followers ?? cur.followers,
            views: input.views ?? cur.views,
            posts: input.posts ?? cur.posts,
            profileUrl: input.profileUrl ?? cur.profileUrl,
          })
          .where(eq(socialAccounts.platform, input.platform));
      } else {
        await db.insert(socialAccounts).values({
          platform: input.platform,
          handle: input.handle ?? "",
          followers: input.followers ?? 0,
          views: input.views ?? 0,
          posts: input.posts ?? 0,
          profileUrl: input.profileUrl ?? "",
        });
      }
      return { success: true };
    }),

  // Get totals across all platforms
  getTotals: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalFollowers: 0, totalViews: 0, totalPosts: 0 };

    const rows = await db.select().from(socialAccounts);
    const totalFollowers = rows.reduce((sum: number, r: SocialAccount) => sum + r.followers, 0);
    const totalViews = rows.reduce((sum: number, r: SocialAccount) => sum + r.views, 0);
    const totalPosts = rows.reduce((sum: number, r: SocialAccount) => sum + r.posts, 0);
    return { totalFollowers, totalViews, totalPosts };
  }),
});
