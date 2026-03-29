import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { tripMedia } from "../drizzle/schema";
import { getDb } from "./db";
import { storagePut } from "./storage";
import { publicProcedure, router } from "./_core/trpc";

export const mediaRouter = router({
  // Get all media for a specific trip
  getByTrip: publicProcedure
    .input(z.object({ tripNumber: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(tripMedia)
        .where(eq(tripMedia.tripNumber, input.tripNumber))
        .orderBy(tripMedia.uploadedAt);
    }),

  // Upload a file: client sends base64 data + metadata, server stores to S3 + DB
  upload: publicProcedure
    .input(
      z.object({
        tripNumber: z.number().int().positive(),
        fileName: z.string().min(1).max(256),
        mimeType: z.string().min(1).max(128),
        fileSize: z.number().int().positive().max(100 * 1024 * 1024), // 100MB max
        base64Data: z.string().min(1),
        caption: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Decode base64 to buffer
      const base64 = input.base64Data.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64, "base64");

      // Build a unique S3 key
      const ext = input.fileName.split(".").pop() ?? "bin";
      const fileKey = `trip-media/trip-${input.tripNumber}/${nanoid(12)}.${ext}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      // Save metadata to DB
      const [result] = await db
        .insert(tripMedia)
        .values({
          tripNumber: input.tripNumber,
          fileKey,
          url,
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          caption: input.caption ?? null,
        })
        .$returningId();

      return { id: result.id, url, fileKey };
    }),

  // Delete a media item
  delete: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(tripMedia).where(eq(tripMedia.id, input.id));
      return { success: true };
    }),

  // Update caption
  updateCaption: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        caption: z.string().max(500),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(tripMedia)
        .set({ caption: input.caption })
        .where(eq(tripMedia.id, input.id));
      return { success: true };
    }),
});
