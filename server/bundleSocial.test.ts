import { describe, it, expect } from "vitest";
import { getConnectedAccounts, getBundleTeamId } from "./bundleSocial";

describe("bundle.social API", () => {
  it("should have BUNDLE_SOCIAL_API_KEY and BUNDLE_SOCIAL_TEAM_ID set", () => {
    expect(process.env.BUNDLE_SOCIAL_API_KEY).toBeTruthy();
    expect(process.env.BUNDLE_SOCIAL_TEAM_ID).toBeTruthy();
  });

  it("should return the correct teamId", () => {
    const teamId = getBundleTeamId();
    expect(teamId).toBe("d5660c0a-b2ee-4d9e-a3c4-81e49f1fadbe");
  });

  it("should fetch connected social accounts from bundle.social", async () => {
    const accounts = await getConnectedAccounts();
    expect(Array.isArray(accounts)).toBe(true);
    expect(accounts.length).toBeGreaterThan(0);
    // Should have at least YouTube, Facebook, TikTok, Instagram
    const types = accounts.map((a) => a.type);
    expect(types).toContain("YOUTUBE");
    expect(types).toContain("FACEBOOK");
    expect(types).toContain("TIKTOK");
    expect(types).toContain("INSTAGRAM");
  }, 15000);
});
