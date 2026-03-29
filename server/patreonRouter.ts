import { publicProcedure, router } from "./_core/trpc";
import { fetchPatreonData, clearPatreonCache } from "./patreon";

export const patreonRouter = router({
  // ── Get live Patreon data (cached 10 min) ─────────────────────────────────
  getCampaign: publicProcedure.query(async () => {
    return fetchPatreonData();
  }),

  // ── Force refresh ─────────────────────────────────────────────────────────
  refresh: publicProcedure.mutation(async () => {
    clearPatreonCache();
    return fetchPatreonData();
  }),
});
