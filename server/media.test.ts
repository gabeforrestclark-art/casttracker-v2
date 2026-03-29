import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database and storage modules
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn(),
}));

vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "test-nanoid-12"),
}));

import { getDb } from "./db";
import { storagePut } from "./storage";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("media.getByTrip", () => {
  it("returns empty array when db is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null);
    const caller = appRouter.createCaller(createContext());
    const result = await caller.media.getByTrip({ tripNumber: 1 });
    expect(result).toEqual([]);
  });

  it("queries media for the correct tripNumber", async () => {
    const mockMedia = [
      {
        id: 1,
        tripNumber: 5,
        fileKey: "trip-media/trip-5/abc123.jpg",
        url: "https://cdn.example.com/trip-5/abc123.jpg",
        fileName: "fish.jpg",
        mimeType: "image/jpeg",
        fileSize: 1024000,
        caption: "Big walleye!",
        uploadedAt: new Date("2026-05-01"),
      },
    ];

    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(mockMedia),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    const caller = appRouter.createCaller(createContext());
    const result = await caller.media.getByTrip({ tripNumber: 5 });
    expect(result).toEqual(mockMedia);
    expect(mockDb.select).toHaveBeenCalled();
  });
});

describe("media.upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when db is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null);
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.media.upload({
        tripNumber: 1,
        fileName: "test.jpg",
        mimeType: "image/jpeg",
        fileSize: 1024,
        base64Data: "data:image/jpeg;base64,/9j/4AAQSkZJRgAB",
      })
    ).rejects.toThrow("Database not available");
  });

  it("uploads file to S3 and inserts record into DB", async () => {
    vi.mocked(storagePut).mockResolvedValue({
      key: "trip-media/trip-3/test-nanoid-12.jpg",
      url: "https://cdn.example.com/trip-3/test-nanoid-12.jpg",
    });

    const mockDb = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      $returningId: vi.fn().mockResolvedValue([{ id: 42 }]),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    const caller = appRouter.createCaller(createContext());
    const result = await caller.media.upload({
      tripNumber: 3,
      fileName: "walleye.jpg",
      mimeType: "image/jpeg",
      fileSize: 2048000,
      base64Data: "data:image/jpeg;base64,/9j/4AAQSkZJRgAB",
      caption: "First walleye of the season!",
    });

    expect(storagePut).toHaveBeenCalledWith(
      "trip-media/trip-3/test-nanoid-12.jpg",
      expect.any(Buffer),
      "image/jpeg"
    );
    expect(result).toMatchObject({
      id: 42,
      url: "https://cdn.example.com/trip-3/test-nanoid-12.jpg",
      fileKey: "trip-media/trip-3/test-nanoid-12.jpg",
    });
  });

  it("rejects files over 100MB", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.media.upload({
        tripNumber: 1,
        fileName: "huge.mp4",
        mimeType: "video/mp4",
        fileSize: 200 * 1024 * 1024, // 200MB — over limit
        base64Data: "data:video/mp4;base64,AAAA",
      })
    ).rejects.toThrow();
  });
});

describe("media.delete", () => {
  it("throws when db is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null);
    const caller = appRouter.createCaller(createContext());
    await expect(caller.media.delete({ id: 1 })).rejects.toThrow("Database not available");
  });

  it("deletes the record from DB", async () => {
    const mockDb = {
      delete: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    const caller = appRouter.createCaller(createContext());
    const result = await caller.media.delete({ id: 7 });
    expect(result).toEqual({ success: true });
    expect(mockDb.delete).toHaveBeenCalled();
  });
});
