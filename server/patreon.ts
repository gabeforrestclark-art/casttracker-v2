/**
 * Patreon Campaign Data Service
 *
 * Patreon does not expose a public API for patron counts or earnings.
 * We scrape the public campaign page server-side and supplement with
 * hardcoded tier data (which is static and publicly visible).
 * Results are cached in-memory for 10 minutes.
 */

import axios from "axios";
import * as cheerio from "cheerio";

const PATREON_URL = "https://www.patreon.com/WorkingMansWaters";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export interface PatreonTier {
  id: string;
  name: string;
  price: number; // USD per month
  description: string;
  benefits: string[];
  recommended?: boolean;
}

export interface PatreonData {
  creatorName: string;
  url: string;
  patronCount: number;
  monthlyRevenue: number; // estimated minimum (patronCount * lowestTier)
  tiers: PatreonTier[];
  lastFetched: number;
  error?: string;
}

// ── Static tier data (scraped once, won't change often) ───────────────────
const STATIC_TIERS: PatreonTier[] = [
  {
    id: "local-circuit",
    name: "The Local Circuit",
    price: 3,
    description: "For the guys who just want to buy me a cup of coffee and see the behind-the-scenes.",
    benefits: [
      "Early Access: Watch every YouTube episode 24 hours before it goes public",
      "The Reality Feed: Patron-only raw photos and thoughts from the truck cab",
      "Direct Messages: Direct access to ask about gear or local Moorhead spots",
    ],
  },
  {
    id: "grand-journey",
    name: "The Grand Journey",
    price: 10,
    description: "The ultimate value tier for Minnesota anglers. I do the scouting; you get the spots.",
    benefits: [
      "All Tier 1 Benefits",
      "The Trip Reports: Detailed Sunday breakdown of Saturday's trip — water temps, wind, baits",
      "The Waypoints: Exact GPS coordinates of launch and fish locations",
      "Q&A Priority: Your lake/river questions answered before I head to a new zone",
    ],
    recommended: true,
  },
  {
    id: "working-mans-sponsor",
    name: "The Working Man's Sponsor",
    price: 25,
    description: "For the true believers who want to see this journey cross the finish line.",
    benefits: [
      "All Tier 1 & 2 Benefits",
      "Your Name in the Credits: Listed in rolling credits of every YouTube video",
      "The Annual Sticker: Exclusive patron-only heavy-duty vinyl sticker sent every spring",
      "End-of-Season Livestream: Private November livestream to break down the season",
    ],
  },
];

// ── In-memory cache ────────────────────────────────────────────────────────
let cache: PatreonData | null = null;

// ── Scraper ────────────────────────────────────────────────────────────────
export async function fetchPatreonData(): Promise<PatreonData> {
  if (cache && Date.now() - cache.lastFetched < CACHE_TTL_MS) {
    return cache;
  }

  try {
    const { data: html } = await axios.get(PATREON_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);

    // ── Try to extract patron count from page text ─────────────────────
    let patronCount = 0;

    // Patreon embeds data in a <script type="application/json"> or window.__BOOTSTRAP__
    $("script").each((_, el) => {
      const content = $(el).html() || "";
      // Look for patron_count in JSON blobs
      const match = content.match(/"patron_count"\s*:\s*(\d+)/);
      if (match) {
        patronCount = parseInt(match[1], 10);
        return false; // break
      }
    });

    // Fallback: look for visible text like "X members"
    if (patronCount === 0) {
      $("*").each((_, el) => {
        const text = $(el).text();
        const match = text.match(/(\d+)\s+(?:members?|patrons?)/i);
        if (match) {
          patronCount = parseInt(match[1], 10);
          return false;
        }
      });
    }

    // ── Estimated monthly revenue (conservative: all patrons at lowest tier) ─
    const monthlyRevenue = patronCount * STATIC_TIERS[0].price;

    cache = {
      creatorName: "Working Mans Waters",
      url: PATREON_URL,
      patronCount,
      monthlyRevenue,
      tiers: STATIC_TIERS,
      lastFetched: Date.now(),
    };

    return cache;
  } catch (err) {
    const fallback: PatreonData = cache
      ? { ...cache, error: String(err), lastFetched: Date.now() }
      : {
          creatorName: "Working Mans Waters",
          url: PATREON_URL,
          patronCount: 0,
          monthlyRevenue: 0,
          tiers: STATIC_TIERS,
          lastFetched: Date.now(),
          error: String(err),
        };
    cache = fallback;
    return fallback;
  }
}

export function clearPatreonCache() {
  cache = null;
}
