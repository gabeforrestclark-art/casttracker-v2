import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock axios to avoid real network calls in tests
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

import axios from "axios";
import { fetchGofundmeData, clearGofundmeCache } from "./gofundme";

const mockAxios = axios as { get: ReturnType<typeof vi.fn> };

describe("GoFundMe Service", () => {
  beforeEach(() => {
    clearGofundmeCache();
    vi.clearAllMocks();
  });

  it("returns fallback data on network error", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("Network error"));
    const data = await fetchGofundmeData();
    expect(data).toBeDefined();
    expect(data.goal).toBe(8500);
    expect(data.shareUrl).toBe("https://gofund.me/cd0e2d185");
    expect(data.error).toContain("Network error");
  });

  it("returns cached data on second call within TTL", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("First call"));
    await fetchGofundmeData(); // populates cache with error fallback
    const data2 = await fetchGofundmeData(); // should use cache, not call axios again
    expect(mockAxios.get).toHaveBeenCalledTimes(1); // only one real call
    expect(data2.goal).toBe(8500);
  });

  it("clears cache and re-fetches after clearGofundmeCache", async () => {
    mockAxios.get.mockRejectedValue(new Error("Always fails"));
    await fetchGofundmeData();
    clearGofundmeCache();
    await fetchGofundmeData();
    expect(mockAxios.get).toHaveBeenCalledTimes(2);
  });

  it("extracts amount from __NEXT_DATA__ JSON when present", async () => {
    const nextData = {
      props: {
        pageProps: {
          initialState: {
            feed: {
              campaign: {
                current_amount: 125000, // $1,250 in cents
                donation_count: 7,
              },
            },
          },
        },
      },
    };

    const html = `
      <html>
        <body>
          <h1>Solo Fishing Journey of Healing in Minnesota</h1>
          <script id="__NEXT_DATA__" type="application/json">${JSON.stringify(nextData)}</script>
        </body>
      </html>
    `;

    mockAxios.get.mockResolvedValueOnce({ data: html });
    const data = await fetchGofundmeData();
    expect(data.amountRaised).toBe(1250);
    expect(data.donorCount).toBe(7);
    expect(data.heroesAmount).toBe(Math.round(1250 * 0.15));
    expect(data.percentComplete).toBe(Math.round((1250 / 8500) * 100));
  });

  it("calculates heroesAmount as 15% of amountRaised", async () => {
    const nextData = {
      props: {
        pageProps: {
          initialState: {
            feed: {
              campaign: {
                current_amount: 500000, // $5,000
                donation_count: 42,
              },
            },
          },
        },
      },
    };

    const html = `
      <html><body>
        <h1>Test</h1>
        <script id="__NEXT_DATA__" type="application/json">${JSON.stringify(nextData)}</script>
      </body></html>
    `;

    mockAxios.get.mockResolvedValueOnce({ data: html });
    const data = await fetchGofundmeData();
    expect(data.heroesAmount).toBe(750); // 15% of $5,000
  });

  it("caps percentComplete at 100", async () => {
    const nextData = {
      props: {
        pageProps: {
          initialState: {
            feed: {
              campaign: {
                current_amount: 1000000, // $10,000 — over goal
                donation_count: 100,
              },
            },
          },
        },
      },
    };

    const html = `
      <html><body>
        <h1>Test</h1>
        <script id="__NEXT_DATA__" type="application/json">${JSON.stringify(nextData)}</script>
      </body></html>
    `;

    mockAxios.get.mockResolvedValueOnce({ data: html });
    const data = await fetchGofundmeData();
    expect(data.percentComplete).toBe(100);
  });

  it("returns correct shareUrl", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("fail"));
    const data = await fetchGofundmeData();
    expect(data.shareUrl).toBe("https://gofund.me/cd0e2d185");
  });

  it("returns empty donors array when none found", async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: "<html><body><h1>Test</h1></body></html>",
    });
    const data = await fetchGofundmeData();
    expect(Array.isArray(data.donors)).toBe(true);
  });
});
