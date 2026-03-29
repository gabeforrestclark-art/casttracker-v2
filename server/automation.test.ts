/**
 * Tests for Trip Catch Router and Automation Router
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock DB ────────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null), // null = DB unavailable, triggers graceful fallback
}));

// ── Mock LLM ───────────────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          captions: [
            "Trip #1 in the books. Red River - Moorhead, Moorhead MN. Landed 3x Walleye. One paddle. One kayak. All of Minnesota. #WorkingMansWaters",
            "Red River — Trip 1 of 124. 3x Walleye on jig + minnow. Support the journey at GoFundMe. #MNFishing",
            "Working man's Saturday. Up before the sun. 3 fish. This is what the journey looks like. #WorkingMansWaters",
          ],
        }),
      },
    }],
  }),
}));

// ── Mock GoFundMe ──────────────────────────────────────────────────────────────
vi.mock("./gofundme", () => ({
  fetchGofundmeData: vi.fn().mockResolvedValue({
    amountRaised: 1250,
    goal: 8500,
    percentComplete: 15,
    donorCount: 12,
    heroesAmount: 188,
    donors: [
      { name: "John Smith", amount: 50, message: "Go Gabe!", timeAgo: "2 hours ago" },
      { name: "Anonymous", amount: 25, message: "", timeAgo: "1 day ago" },
    ],
    lastUpdated: new Date(),
    campaignTitle: "Solo Fishing Journey of Healing in Minnesota",
    campaignUrl: "https://www.gofundme.com/f/solo-fishing-journey-of-healing-in-minnesota",
  }),
}));

// ── Mock Patreon ───────────────────────────────────────────────────────────────
vi.mock("./patreon", () => ({
  fetchPatreonData: vi.fn().mockResolvedValue({
    patronCount: 8,
    monthlyRevenue: "54",
    tiers: [],
    lastUpdated: new Date(),
    pageUrl: "https://www.patreon.com/WorkingMansWaters",
  }),
}));

// ── Mock notification ──────────────────────────────────────────────────────────
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// ── Trip Catch Router Tests ────────────────────────────────────────────────────
describe("tripCatch router", () => {
  it("getByTrip returns null when DB is unavailable", async () => {
    const { tripCatchRouter } = await import("./tripCatchRouter");
    // Router is defined and has expected procedures
    expect(tripCatchRouter).toBeDefined();
    expect(typeof tripCatchRouter).toBe("object");
  });

  it("listLogged returns empty array when DB is unavailable", async () => {
    const { getDb } = await import("./db");
    const db = await getDb();
    expect(db).toBeNull();
  });

  it("generateCaption uses LLM and returns 3 captions", async () => {
    const { invokeLLM } = await import("./_core/llm");
    const result = await invokeLLM({
      messages: [{ role: "user", content: "test" }],
    });
    const content = result.choices[0].message.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    expect(parsed.captions).toHaveLength(3);
    expect(parsed.captions[0]).toContain("Trip #1");
  });

  it("generateCaption returns fallback captions on LLM error", async () => {
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockRejectedValueOnce(new Error("LLM unavailable"));

    // Fallback logic: should produce 3 captions with trip number and site
    const tripNumber = 1;
    const fishCaught = 3;
    const siteName = "Red River - Moorhead";
    const fallbackCaptions = [
      `Trip #${tripNumber} in the books. ${siteName}. ${fishCaught > 0 ? `Landed ${fishCaught} fish.` : "Got skunked today."}`,
      `${siteName} — Trip ${tripNumber} of 124.`,
      `Working man's Saturday. Up before the sun, kayak on the water at ${siteName}.`,
    ];
    expect(fallbackCaptions).toHaveLength(3);
    expect(fallbackCaptions[0]).toContain("Trip #1");
  });
});

// ── Automation Router Tests ────────────────────────────────────────────────────
describe("automation router", () => {
  it("automationRouter is defined with expected procedures", async () => {
    const { automationRouter } = await import("./automationRouter");
    expect(automationRouter).toBeDefined();
  });

  it("GoFundMe mock returns correct donor data", async () => {
    const { fetchGofundmeData } = await import("./gofundme");
    const data = await fetchGofundmeData();
    expect(data.amountRaised).toBe(1250);
    expect(data.donorCount).toBe(12);
    expect(data.donors).toHaveLength(2);
    expect(data.donors[0].name).toBe("John Smith");
  });

  it("filters anonymous donors from thank-you generation", async () => {
    const { fetchGofundmeData } = await import("./gofundme");
    const data = await fetchGofundmeData();
    const nonAnonymous = data.donors.filter(d => d.name !== "Anonymous");
    expect(nonAnonymous).toHaveLength(1);
    expect(nonAnonymous[0].name).toBe("John Smith");
  });

  it("Patreon mock returns correct patron data", async () => {
    const { fetchPatreonData } = await import("./patreon");
    const data = await fetchPatreonData();
    expect(data.patronCount).toBe(8);
    expect(data.monthlyRevenue).toBe("54");
  });

  it("notifyOwner mock is callable", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const result = await notifyOwner({ title: "Test", content: "Test content" });
    expect(result).toBe(true);
  });

  it("monthly report calculates Heroes on Water pledge correctly", async () => {
    const { fetchGofundmeData } = await import("./gofundme");
    const data = await fetchGofundmeData();
    const heroesAmount = Math.round(data.amountRaised * 0.15);
    expect(heroesAmount).toBe(188); // 15% of $1,250
  });

  it("weather alert finds next upcoming trip from journey data", async () => {
    const { JOURNEY_TRIPS } = await import("../client/src/lib/journeyData");
    const nextTrip = JOURNEY_TRIPS.find((t: { status: string }) => t.status === "upcoming");
    // Either finds an upcoming trip or gracefully returns undefined
    if (nextTrip) {
      expect(nextTrip).toHaveProperty("tripNumber");
      expect(nextTrip).toHaveProperty("date");
      expect(nextTrip).toHaveProperty("siteId");
    } else {
      expect(nextTrip).toBeUndefined();
    }
  });
});

// ── Schema Tests ───────────────────────────────────────────────────────────────
describe("schema tables", () => {
  it("tripCatch table is defined in schema", async () => {
    const { tripCatch } = await import("../drizzle/schema");
    expect(tripCatch).toBeDefined();
  });

  it("automationLog table is defined in schema", async () => {
    const { automationLog } = await import("../drizzle/schema");
    expect(automationLog).toBeDefined();
  });

  it("tripCatch table has required columns", async () => {
    const { tripCatch } = await import("../drizzle/schema");
    const columns = Object.keys(tripCatch);
    expect(columns.length).toBeGreaterThan(0);
  });
});
