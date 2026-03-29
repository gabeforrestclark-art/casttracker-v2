import { eq } from "drizzle-orm";
import { z } from "zod";
import { roadmapTask } from "../drizzle/schema";
import { getDb } from "./db";
import { publicProcedure, router } from "./_core/trpc";

export const roadmapRouter = router({
  // Get all checked task IDs
  getChecked: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { checkedIds: [] as string[] };
    const rows = await db
      .select()
      .from(roadmapTask)
      .where(eq(roadmapTask.checked, 1));
    return { checkedIds: rows.map(r => r.taskId) };
  }),

  // Toggle a task checked/unchecked
  toggle: publicProcedure
    .input(z.object({ taskId: z.string().max(128), checked: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .insert(roadmapTask)
        .values({ taskId: input.taskId, checked: input.checked ? 1 : 0 })
        .onDuplicateKeyUpdate({ set: { checked: input.checked ? 1 : 0 } });
      return { success: true };
    }),

  // Bulk toggle (check/uncheck all tasks in a day or phase)
  bulkToggle: publicProcedure
    .input(z.object({ taskIds: z.array(z.string().max(128)), checked: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      for (const taskId of input.taskIds) {
        await db
          .insert(roadmapTask)
          .values({ taskId, checked: input.checked ? 1 : 0 })
          .onDuplicateKeyUpdate({ set: { checked: input.checked ? 1 : 0 } });
      }
      return { success: true, count: input.taskIds.length };
    }),
});
