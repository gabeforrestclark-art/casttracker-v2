import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

const mockInsert = vi.fn();
const mockOnDuplicateKeyUpdate = vi.fn().mockResolvedValue(undefined);
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();

function buildMockDb(checkedRows: { taskId: string; checked: number }[] = []) {
  mockWhere.mockResolvedValue(checkedRows);
  mockFrom.mockReturnValue({ where: mockWhere });
  mockSelect.mockReturnValue({ from: mockFrom });
  mockInsert.mockReturnValue({
    values: vi.fn().mockReturnValue({ onDuplicateKeyUpdate: mockOnDuplicateKeyUpdate }),
  });
  return {
    select: mockSelect,
    insert: mockInsert,
  };
}

describe("roadmap.getChecked", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns empty array when no tasks are checked", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(buildMockDb([]));
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.roadmap.getChecked();
    expect(result.checkedIds).toEqual([]);
  });

  it("returns checked task IDs from the database", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockDb([
        { taskId: "phase-0-day-1-task-0", checked: 1 },
        { taskId: "phase-0-day-1-task-1", checked: 1 },
      ])
    );
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.roadmap.getChecked();
    expect(result.checkedIds).toHaveLength(2);
    expect(result.checkedIds).toContain("phase-0-day-1-task-0");
    expect(result.checkedIds).toContain("phase-0-day-1-task-1");
  });

  it("returns empty array when db is unavailable", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.roadmap.getChecked();
    expect(result.checkedIds).toEqual([]);
  });
});

describe("roadmap.toggle", () => {
  beforeEach(() => vi.clearAllMocks());

  it("upserts a task as checked", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(buildMockDb());
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.roadmap.toggle({
      taskId: "phase-0-day-1-task-0",
      checked: true,
    });
    expect(result.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockOnDuplicateKeyUpdate).toHaveBeenCalledWith({ set: { checked: 1 } });
  });

  it("upserts a task as unchecked", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(buildMockDb());
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.roadmap.toggle({
      taskId: "phase-0-day-1-task-0",
      checked: false,
    });
    expect(result.success).toBe(true);
    expect(mockOnDuplicateKeyUpdate).toHaveBeenCalledWith({ set: { checked: 0 } });
  });

  it("throws when db is unavailable", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.roadmap.toggle({ taskId: "test-task", checked: true })
    ).rejects.toThrow("Database not available");
  });
});

describe("roadmap.bulkToggle", () => {
  beforeEach(() => vi.clearAllMocks());

  it("upserts multiple tasks at once", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(buildMockDb());
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.roadmap.bulkToggle({
      taskIds: ["task-1", "task-2", "task-3"],
      checked: true,
    });
    expect(result.success).toBe(true);
    expect(result.count).toBe(3);
    expect(mockInsert).toHaveBeenCalledTimes(3);
  });

  it("handles empty task list gracefully", async () => {
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(buildMockDb());
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.roadmap.bulkToggle({ taskIds: [], checked: true });
    expect(result.success).toBe(true);
    expect(result.count).toBe(0);
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
