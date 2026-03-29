/**
 * GoFundMe Campaign Data Service
 *
 * GoFundMe does not provide a public API, so we scrape the campaign page
 * server-side to extract: amount raised, goal, donor count, and recent donors.
 * Results are cached in-memory for 5 minutes to avoid hammering the page.
 */

import axios from "axios";
import * as cheerio from "cheerio";

const CAMPAIGN_URL =
  "https://www.gofundme.com/f/solo-fishing-journey-of-healing-in-minnesota";
const CAMPAIGN_SHARE_URL = "https://gofund.me/cd0e2d185";
const GOAL = 8500;
const HEROES_PERCENT = 0.15;

export interface GofundmeDonor {
  name: string;
  amount: number;
  message: string;
  timeAgo: string;
}

export interface GofundmeData {
  title: string;
  amountRaised: number;
  goal: number;
  donorCount: number;
  heroesAmount: number;
  percentComplete: number;
  shareUrl: string;
  donors: GofundmeDonor[];
  lastFetched: number;
  error?: string;
}

// ── In-memory cache ────────────────────────────────────────────────────────
let cache: GofundmeData | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── Scraper ────────────────────────────────────────────────────────────────
export async function fetchGofundmeData(): Promise<GofundmeData> {
  // Return cached data if still fresh
  if (cache && Date.now() - cache.lastFetched < CACHE_TTL_MS) {
    return cache;
  }

  try {
    const { data: html } = await axios.get(CAMPAIGN_URL, {
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

    // ── Extract amount raised ──────────────────────────────────────────────
    let amountRaised = 0;
    // GoFundMe renders amount in various selectors; try multiple
    const amountSelectors = [
      '[data-testid="campaign-raised-amount"]',
      ".progress-meter_progressBarHeading__Nxc77",
      ".hrt-disp-inline",
      "[class*='raised']",
      "[class*='amount']",
    ];
    for (const sel of amountSelectors) {
      const text = $(sel).first().text().trim();
      if (text) {
        const match = text.match(/\$?([\d,]+)/);
        if (match) {
          amountRaised = parseInt(match[1].replace(/,/g, ""), 10);
          break;
        }
      }
    }

    // ── Extract donor count ────────────────────────────────────────────────
    let donorCount = 0;
    const donorSelectors = [
      '[data-testid="campaign-donor-count"]',
      "[class*='donor']",
      "[class*='supporters']",
    ];
    for (const sel of donorSelectors) {
      const text = $(sel).first().text().trim();
      if (text) {
        const match = text.match(/([\d,]+)/);
        if (match) {
          donorCount = parseInt(match[1].replace(/,/g, ""), 10);
          break;
        }
      }
    }

    // ── Extract title ──────────────────────────────────────────────────────
    const title =
      $("h1").first().text().trim() ||
      "Solo Fishing Journey of Healing in Minnesota";

    // ── Extract recent donors ──────────────────────────────────────────────
    const donors: GofundmeDonor[] = [];
    // GoFundMe donor items
    $("[class*='DonationItem'], [class*='donation-item'], [data-testid*='donation']").each(
      (_, el) => {
        const name =
          $(el).find("[class*='name'], [class*='donor']").first().text().trim() ||
          "Anonymous";
        const amountText = $(el)
          .find("[class*='amount']")
          .first()
          .text()
          .trim();
        const amountMatch = amountText.match(/\$?([\d,]+)/);
        const amount = amountMatch
          ? parseInt(amountMatch[1].replace(/,/g, ""), 10)
          : 0;
        const message =
          $(el).find("[class*='message'], [class*='comment']").first().text().trim() || "";
        const timeAgo =
          $(el).find("[class*='time'], time").first().text().trim() || "";

        if (name || amount) {
          donors.push({ name, amount, message, timeAgo });
        }
      }
    );

    // ── Also try Next.js __NEXT_DATA__ JSON embedded in page ──────────────
    const nextDataScript = $("script#__NEXT_DATA__").html();
    if (nextDataScript) {
      try {
        const nextData = JSON.parse(nextDataScript);
        const props =
          nextData?.props?.pageProps?.initialState?.feed?.campaign ||
          nextData?.props?.pageProps?.campaign ||
          null;

        if (props) {
          if (props.current_amount !== undefined) {
            amountRaised = Math.round(props.current_amount / 100); // cents to dollars
          }
          if (props.goal_amount !== undefined && props.goal_amount > 0) {
            // keep our defined goal
          }
          if (props.donation_count !== undefined) {
            donorCount = props.donation_count;
          }
        }

        // Try to extract donors from Next.js data
        const donations =
          nextData?.props?.pageProps?.initialState?.feed?.donations?.refs ||
          nextData?.props?.pageProps?.donations ||
          [];
        if (Array.isArray(donations) && donations.length > 0 && donors.length === 0) {
          for (const d of donations.slice(0, 10)) {
            donors.push({
              name: d.name || d.donor_name || "Anonymous",
              amount: d.amount ? Math.round(d.amount / 100) : 0,
              message: d.profile_name || d.comment || "",
              timeAgo: d.created_at || "",
            });
          }
        }
      } catch {
        // JSON parse failed — ignore, use scraped values
      }
    }

    const percentComplete = Math.min(
      100,
      Math.round((amountRaised / GOAL) * 100)
    );
    const heroesAmount = Math.round(amountRaised * HEROES_PERCENT);

    cache = {
      title,
      amountRaised,
      goal: GOAL,
      donorCount,
      heroesAmount,
      percentComplete,
      shareUrl: CAMPAIGN_SHARE_URL,
      donors: donors.slice(0, 10),
      lastFetched: Date.now(),
    };

    return cache;
  } catch (err) {
    // Return last cached data with error flag, or zeros
    const fallback: GofundmeData = cache
      ? { ...cache, error: String(err), lastFetched: Date.now() }
      : {
          title: "Solo Fishing Journey of Healing in Minnesota",
          amountRaised: 0,
          goal: GOAL,
          donorCount: 0,
          heroesAmount: 0,
          percentComplete: 0,
          shareUrl: CAMPAIGN_SHARE_URL,
          donors: [],
          lastFetched: Date.now(),
          error: String(err),
        };
    cache = fallback;
    return fallback;
  }
}

/** Force-clear the cache (useful after a manual refresh request) */
export function clearGofundmeCache() {
  cache = null;
}
