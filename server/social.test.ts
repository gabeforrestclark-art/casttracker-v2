import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "gabe@snowbros.com",
      name: "Gabe",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("social.createDraft", () => {
  it("rejects empty caption with Zod validation error", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.social.createDraft({
        taskId: "p0-d1-t1",
        caption: "",
        platforms: ["instagram"],
      })
    ).rejects.toThrow();
  });

  it("rejects empty platforms array with Zod validation error", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.social.createDraft({
        taskId: "p0-d1-t1",
        caption: "Test caption",
        platforms: [],
      })
    ).rejects.toThrow();
  });
});

describe("social.saveNote", () => {
  it("accepts a valid taskId and notes", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    // Valid input — may fail on DB connection but input schema is valid
    const result = await caller.social.saveNote({ taskId: "p0-d1-t1", notes: "some notes" });
    expect(result).toHaveProperty("success");
  });
});

describe("roadmap.toggle", () => {
  it("accepts a valid taskId and checked state", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    // Valid input — may fail on DB connection but input schema is valid
    const result = await caller.roadmap.toggle({ taskId: "p0-d1-t1", checked: true });
    expect(result).toHaveProperty("success");
  });
});

describe("roadmap.bulkToggle", () => {
  it("resolves successfully with empty taskIds array (no-op)", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    // bulkToggle with empty array is a valid no-op — returns success with count 0
    const result = await caller.roadmap.bulkToggle({ taskIds: [], checked: true });
    expect(result.success).toBe(true);
    expect(result.count).toBe(0);
  });

  it("accepts a valid taskIds array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    // This will attempt a DB write; if DB unavailable it may throw, but input is valid
    const result = await caller.roadmap.bulkToggle({ taskIds: ["p0-d1-t1", "p0-d1-t2"], checked: true });
    expect(result).toHaveProperty("success");
  });
});
