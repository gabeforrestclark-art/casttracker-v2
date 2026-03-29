import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

import axios from "axios";
import { fetchPatreonData, clearPatreonCache } from "./patreon";

const mockAxios = axios as { get: ReturnType<typeof vi.fn> };

describe("Patreon Service", () => {
  beforeEach(() => {
    clearPatreonCache();
    vi.clearAllMocks();
  });

  it("always returns 3 static tiers regardless of network", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("Network error"));
    const data = await fetchPatreonData();
    expect(data.tiers).toHaveLength(3);
    expect(data.tiers[0].price).toBe(3);
    expect(data.tiers[1].price).toBe(10);
    expect(data.tiers[2].price).toBe(25);
  });

  it("returns correct tier names", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("fail"));
    const data = await fetchPatreonData();
    expect(data.tiers[0].name).toBe("The Local Circuit");
    expect(data.tiers[1].name).toBe("The Grand Journey");
    expect(data.tiers[2].name).toBe("The Working Man's Sponsor");
  });

  it("marks The Grand Journey as recommended", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("fail"));
    const data = await fetchPatreonData();
    const recommended = data.tiers.find(t => t.recommended);
    expect(recommended?.name).toBe("The Grand Journey");
  });

  it("returns correct Patreon URL", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("fail"));
    const data = await fetchPatreonData();
    expect(data.url).toBe("https://www.patreon.com/WorkingMansWaters");
  });

  it("returns cached data on second call within TTL", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("fail"));
    await fetchPatreonData();
    await fetchPatreonData();
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
  });

  it("clears cache and re-fetches after clearPatreonCache", async () => {
    mockAxios.get.mockRejectedValue(new Error("fail"));
    await fetchPatreonData();
    clearPatreonCache();
    await fetchPatreonData();
    expect(mockAxios.get).toHaveBeenCalledTimes(2);
  });

  it("extracts patron_count from page script JSON", async () => {
    const html = `
      <html><body>
        <script>window.__data__ = {"patron_count":42,"foo":"bar"}</script>
      </body></html>
    `;
    mockAxios.get.mockResolvedValueOnce({ data: html });
    const data = await fetchPatreonData();
    expect(data.patronCount).toBe(42);
    expect(data.monthlyRevenue).toBe(42 * 3); // 42 patrons × $3 minimum tier
  });

  it("returns error flag on network failure without crashing", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("timeout"));
    const data = await fetchPatreonData();
    expect(data.error).toContain("timeout");
    expect(data.tiers).toHaveLength(3); // tiers always present
  });
});
