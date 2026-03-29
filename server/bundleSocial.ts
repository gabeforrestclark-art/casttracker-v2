/**
 * bundle.social API service
 * Handles live social media publishing to Facebook, Instagram, TikTok, and YouTube
 * via the bundle.social unified API.
 *
 * API Docs: https://info.bundle.social/api-reference/introduction
 * Base URL: https://api.bundle.social
 * Auth: x-api-key header
 */

const BUNDLE_BASE = "https://api.bundle.social/api/v1";

function getBundleHeaders() {
  const apiKey = process.env.BUNDLE_SOCIAL_API_KEY;
  if (!apiKey) throw new Error("BUNDLE_SOCIAL_API_KEY is not set");
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  };
}

export function getBundleTeamId(): string {
  const teamId = process.env.BUNDLE_SOCIAL_TEAM_ID;
  if (!teamId) throw new Error("BUNDLE_SOCIAL_TEAM_ID is not set");
  return teamId;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type BundlePlatform = "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "YOUTUBE";

export interface BundlePostPayload {
  caption: string;
  platforms: BundlePlatform[];
  scheduledAt?: string; // ISO 8601 UTC string, omit to publish immediately
  title?: string;
}

export interface BundlePostResult {
  id: string;
  status: string;
  postDate: string | null;
  errors?: Record<string, unknown>;
}

export interface BundleConnectedAccount {
  id: string;
  type: BundlePlatform;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

// ─── Build platform-specific data blocks ──────────────────────────────────────

function buildPlatformData(
  platforms: BundlePlatform[],
  caption: string
): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  if (platforms.includes("FACEBOOK")) {
    data["FACEBOOK"] = {
      type: "POST",
      text: caption,
    };
  }

  if (platforms.includes("INSTAGRAM")) {
    data["INSTAGRAM"] = {
      type: "POST",
      text: caption,
    };
  }

  if (platforms.includes("TIKTOK")) {
    data["TIKTOK"] = {
      type: "VIDEO",
      text: caption,
      privacy: "PUBLIC",
      uploadToDraft: false,
    };
  }

  if (platforms.includes("YOUTUBE")) {
    data["YOUTUBE"] = {
      type: "SHORT",
      text: caption,
      description: caption,
      privacy: "PUBLIC",
    };
  }

  return data;
}

// ─── Publish a post ───────────────────────────────────────────────────────────

export async function publishPost(
  payload: BundlePostPayload
): Promise<BundlePostResult> {
  const teamId = getBundleTeamId();
  const headers = getBundleHeaders();

  const body: Record<string, unknown> = {
    teamId,
    title: payload.title ?? payload.caption.slice(0, 80),
    status: payload.scheduledAt ? "SCHEDULED" : "PUBLISHED",
    socialAccountTypes: payload.platforms,
    data: buildPlatformData(payload.platforms, payload.caption),
  };

  if (payload.scheduledAt) {
    body["postDate"] = payload.scheduledAt;
  }

  const response = await fetch(`${BUNDLE_BASE}/post/`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `bundle.social publish failed (${response.status}): ${errorText}`
    );
  }

  const result = (await response.json()) as BundlePostResult;
  return result;
}

// ─── Get connected social accounts ────────────────────────────────────────────

export async function getConnectedAccounts(): Promise<BundleConnectedAccount[]> {
  const teamId = getBundleTeamId();
  const headers = getBundleHeaders();

  // bundle.social requires fetching each platform individually via /social-account/by-type
  const platforms: BundlePlatform[] = ["INSTAGRAM", "FACEBOOK", "TIKTOK", "YOUTUBE"];
  const results: BundleConnectedAccount[] = [];

  for (const platform of platforms) {
    try {
      const response = await fetch(
        `${BUNDLE_BASE}/social-account/by-type?type=${platform}&teamId=${teamId}`,
        { method: "GET", headers }
      );
      if (response.ok) {
        const a = (await response.json()) as {
          id: string;
          type: string;
          username: string | null;
          displayName: string | null;
          avatarUrl: string | null;
        };
        results.push({
          id: a.id,
          type: a.type as BundlePlatform,
          username: a.username ?? "",
          displayName: a.displayName ?? a.username ?? platform,
          avatarUrl: a.avatarUrl ?? null,
        });
      }
    } catch {
      // platform not connected — skip
    }
  }

  return results;
}

// ─── Legacy stub (kept for type compat) ───────────────────────────────────────
function _legacyStub() {
  const result = { items: [] as Array<{ id: string; type: string; username: string; displayName: string; avatarUrl: string | null }> };
  return result.items.map((a) => ({
    id: a.id,
    type: a.type as BundlePlatform,
    username: a.username,
    displayName: a.displayName,
    avatarUrl: a.avatarUrl,
  }));
}

// ─── Get post status ──────────────────────────────────────────────────────────

export async function getPostStatus(postId: string): Promise<BundlePostResult> {
  const headers = getBundleHeaders();

  const response = await fetch(`${BUNDLE_BASE}/post/${postId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `bundle.social getPost failed (${response.status}): ${errorText}`
    );
  }

  return (await response.json()) as BundlePostResult;
}
