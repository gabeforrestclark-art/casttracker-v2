import { eq } from "drizzle-orm";
import { z } from "zod";
import { socialPost, taskNote } from "../drizzle/schema";
import { getDb } from "./db";
import { publicProcedure, router } from "./_core/trpc";

// Ayrshare API helper
async function publishToAyrshare(
  caption: string,
  platforms: string[],
  scheduledAt?: Date | null,
  apiKey?: string
): Promise<{ postId?: string; error?: string; status: "published" | "queued" | "failed" }> {
  if (!apiKey) {
    return { status: "failed", error: "No Ayrshare API key configured. Add AYRSHARE_API_KEY in Settings > Secrets." };
  }

  try {
    const body: Record<string, unknown> = {
      post: caption,
      platforms,
    };
    if (scheduledAt) {
      body.scheduleDate = scheduledAt.toISOString();
    }

    const res = await fetch("https://app.ayrshare.com/api/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json() as { id?: string; status?: string; errors?: Array<{ message: string }> };

    if (!res.ok || data.status === "error") {
      const errMsg = data.errors?.[0]?.message ?? "Unknown Ayrshare error";
      return { status: "failed", error: errMsg };
    }

    return {
      status: scheduledAt ? "queued" : "published",
      postId: data.id,
    };
  } catch (err) {
    return { status: "failed", error: String(err) };
  }
}

export const socialRouter = router({
  // List all posts for a specific roadmap task
  listByTask: publicProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(socialPost).where(eq(socialPost.taskId, input.taskId));
    }),

  // Create a draft post (no publishing yet)
  createDraft: publicProcedure
    .input(z.object({
      taskId: z.string(),
      caption: z.string().min(1),
      platforms: z.array(z.string()).min(1),
      scheduledAt: z.string().optional(), // ISO string
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const scheduledDate = input.scheduledAt ? new Date(input.scheduledAt) : null;

      await db.insert(socialPost).values({
        taskId: input.taskId,
        caption: input.caption,
        platforms: input.platforms.join(","),
        status: "draft",
        scheduledAt: scheduledDate ?? undefined,
      });

      const rows = await db.select().from(socialPost)
        .where(eq(socialPost.taskId, input.taskId));
      return rows[rows.length - 1];
    }),

  // Publish a post immediately or queue it via Ayrshare
  publish: publicProcedure
    .input(z.object({
      postId: z.number(),
      taskId: z.string(),
      caption: z.string().min(1),
      platforms: z.array(z.string()).min(1),
      scheduledAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const apiKey = process.env.AYRSHARE_API_KEY;
      const scheduledDate = input.scheduledAt ? new Date(input.scheduledAt) : null;

      const result = await publishToAyrshare(
        input.caption,
        input.platforms,
        scheduledDate,
        apiKey
      );

      await db
        .update(socialPost)
        .set({
          caption: input.caption,
          platforms: input.platforms.join(","),
          status: result.status,
          scheduledAt: scheduledDate ?? undefined,
          publishedAt: result.status === "published" ? new Date() : undefined,
          ayrsharePostId: result.postId,
          errorMessage: result.error,
        })
        .where(eq(socialPost.id, input.postId));

      return { success: result.status !== "failed", ...result };
    }),

  // Publish a brand new post directly (create + publish in one step)
  publishNew: publicProcedure
    .input(z.object({
      taskId: z.string(),
      caption: z.string().min(1),
      platforms: z.array(z.string()).min(1),
      scheduledAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const apiKey = process.env.AYRSHARE_API_KEY;
      const scheduledDate = input.scheduledAt ? new Date(input.scheduledAt) : null;

      const result = await publishToAyrshare(
        input.caption,
        input.platforms,
        scheduledDate,
        apiKey
      );

      await db.insert(socialPost).values({
        taskId: input.taskId,
        caption: input.caption,
        platforms: input.platforms.join(","),
        status: result.status,
        scheduledAt: scheduledDate ?? undefined,
        publishedAt: result.status === "published" ? new Date() : undefined,
        ayrsharePostId: result.postId,
        errorMessage: result.error,
      });

      return { success: result.status !== "failed", ...result };
    }),

  // Delete a post record
  delete: publicProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(socialPost).where(eq(socialPost.id, input.postId));
      return { success: true };
    }),

  // Get task note
  getNote: publicProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(taskNote).where(eq(taskNote.taskId, input.taskId));
      return rows[0] ?? null;
    }),

  // Save / update task note
  saveNote: publicProcedure
    .input(z.object({
      taskId: z.string(),
      notes: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(taskNote)
        .values({ taskId: input.taskId, notes: input.notes })
        .onDuplicateKeyUpdate({ set: { notes: input.notes } });
      return { success: true };
    }),

  // Mark task completed (saves completedAt timestamp)
  markCompleted: publicProcedure
    .input(z.object({ taskId: z.string(), completed: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(taskNote)
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
