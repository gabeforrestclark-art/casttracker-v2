import { eq } from "drizzle-orm";
import { z } from "zod";
import { socialPost, taskNote } from "../drizzle/schema";
import { getDb } from "./db";
import { publicProcedure, router } from "./_core/trpc";
import {
  publishPost,
  getConnectedAccounts,
  type BundlePlatform,
} from "./bundleSocial";

export const socialRouter = router({
  // ── Connected accounts ─────────────────────────────────────────────────────
  getConnectedAccounts: publicProcedure.query(async () => {
    try {
      return await getConnectedAccounts();
    } catch {
      return [];
    }
  }),

  // ── List posts for a roadmap task ──────────────────────────────────────────
  listByTask: publicProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(socialPost)
        .where(eq(socialPost.taskId, input.taskId));
    }),

  // ── Create a draft post (no publishing yet) ────────────────────────────────
  createDraft: publicProcedure
    .input(
      z.object({
        taskId: z.string(),
        caption: z.string().min(1),
        platforms: z.array(z.string()).min(1),
        scheduledAt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const scheduledDate = input.scheduledAt
        ? new Date(input.scheduledAt)
        : null;

      await db.insert(socialPost).values({
        taskId: input.taskId,
        caption: input.caption,
        platforms: input.platforms.join(","),
        status: "draft",
        scheduledAt: scheduledDate ?? undefined,
      });

      const rows = await db
        .select()
        .from(socialPost)
        .where(eq(socialPost.taskId, input.taskId));
      return rows[rows.length - 1];
    }),

  // ── Publish a new post directly via bundle.social ─────────────────────────
  publishNew: publicProcedure
    .input(
      z.object({
        taskId: z.string(),
        caption: z.string().min(1),
        platforms: z.array(z.string()).min(1),
        scheduledAt: z.string().optional(),
        title: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const scheduledDate = input.scheduledAt
        ? new Date(input.scheduledAt)
        : null;

      let bundlePostId: string | undefined;
      let status: "published" | "queued" | "failed" = "failed";
      let errorMessage: string | undefined;

      try {
        const result = await publishPost({
          caption: input.caption,
          platforms: input.platforms as BundlePlatform[],
          scheduledAt: scheduledDate?.toISOString(),
          title: input.title,
        });

        bundlePostId = result.id;
        status = scheduledDate ? "queued" : "published";
      } catch (err) {
        errorMessage = String(err);
        status = "failed";
      }

      await db.insert(socialPost).values({
        taskId: input.taskId,
        caption: input.caption,
        platforms: input.platforms.join(","),
        status,
        scheduledAt: scheduledDate ?? undefined,
        publishedAt: status === "published" ? new Date() : undefined,
        ayrsharePostId: bundlePostId,
        errorMessage,
      });

      return {
        success: status !== "failed",
        status,
        postId: bundlePostId,
        error: errorMessage,
      };
    }),

  // ── Re-publish an existing draft ──────────────────────────────────────────
  publish: publicProcedure
    .input(
      z.object({
        postId: z.number(),
        taskId: z.string(),
        caption: z.string().min(1),
        platforms: z.array(z.string()).min(1),
        scheduledAt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const scheduledDate = input.scheduledAt
        ? new Date(input.scheduledAt)
        : null;

      let bundlePostId: string | undefined;
      let status: "published" | "queued" | "failed" = "failed";
      let errorMessage: string | undefined;

      try {
        const result = await publishPost({
          caption: input.caption,
          platforms: input.platforms as BundlePlatform[],
          scheduledAt: scheduledDate?.toISOString(),
        });

        bundlePostId = result.id;
        status = scheduledDate ? "queued" : "published";
      } catch (err) {
        errorMessage = String(err);
        status = "failed";
      }

      await db
        .update(socialPost)
        .set({
          caption: input.caption,
          platforms: input.platforms.join(","),
          status,
          scheduledAt: scheduledDate ?? undefined,
          publishedAt: status === "published" ? new Date() : undefined,
          ayrsharePostId: bundlePostId,
          errorMessage,
        })
        .where(eq(socialPost.id, input.postId));

      return {
        success: status !== "failed",
        status,
        postId: bundlePostId,
        error: errorMessage,
      };
    }),

  // ── Delete a post record ──────────────────────────────────────────────────
  delete: publicProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(socialPost).where(eq(socialPost.id, input.postId));
      return { success: true };
    }),

  // ── Task notes ────────────────────────────────────────────────────────────
  getNote: publicProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db
        .select()
        .from(taskNote)
        .where(eq(taskNote.taskId, input.taskId));
      return rows[0] ?? null;
    }),

  saveNote: publicProcedure
    .input(
      z.object({
        taskId: z.string(),
        notes: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db
        .insert(taskNote)
        .values({ taskId: input.taskId, notes: input.notes })
        .onDuplicateKeyUpdate({ set: { notes: input.notes } });
      return { success: true };
    }),

  markCompleted: publicProcedure
    .input(z.object({ taskId: z.string(), completed: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db
        .insert(taskNote)
        .values({
          taskId: input.taskId,
          notes: "",
          completedAt: input.completed ? new Date() : undefined,
        })
        .onDuplicateKeyUpdate({
          set: { completedAt: input.completed ? new Date() : undefined },
        });
      return { success: true };
    }),
});
