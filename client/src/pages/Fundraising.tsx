import { useState } from "react";
import { CAUSES } from "@/lib/journeyData";
import { trpc } from "@/lib/trpc";
import {
  Heart,
  ExternalLink,
  RefreshCw,
  Users,
  DollarSign,
  TrendingUp,
  Send,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquarePlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const teal = "oklch(0.65 0.18 200)";
const orange = "oklch(0.65 0.18 50)";
const dark = "oklch(0.17 0.012 240)";
const darker = "oklch(0.13 0.01 240)";
const border = "oklch(1 0 0 / 8%)";
const muted = "oklch(0.45 0.01 200)";
const fg = "oklch(0.92 0.005 200)";
const green = "oklch(0.65 0.18 145)";

const PLATFORMS = ["instagram", "facebook", "tiktok", "youtube"] as const;
type Platform = (typeof PLATFORMS)[number];

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
};

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div
      className="rounded-xl p-5 flex items-start gap-4"
      style={{ background: dark, border: `1px solid ${border}` }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}20` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: muted }}>
          {label}
        </div>
        <div className="text-2xl font-bold" style={{ color, fontFamily: "'Oswald', sans-serif" }}>
          {value}
        </div>
        <div className="text-xs mt-0.5" style={{ color: muted }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

// ── Thank-you composer ────────────────────────────────────────────────────
function ThankYouComposer({
  donorName,
  amount,
  totalRaised,
  goal,
  onClose,
}: {
  donorName: string;
  amount: number;
  totalRaised: number;
  goal: number;
  onClose: () => void;
}) {
  const [selectedCaption, setSelectedCaption] = useState<string>("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "instagram",
    "facebook",
    "tiktok",
  ]);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = trpc.gofundme.generateThankYou.useMutation();
  const publish = trpc.gofundme.publishThankYou.useMutation();

  const handleGenerate = () => {
    generate.mutate(
      { donorName, amount, totalRaised, goal },
      {
        onSuccess: (data) => {
          setSelectedCaption(data.captions[0]);
        },
      }
    );
  };

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handlePublish = () => {
    if (!selectedCaption || selectedPlatforms.length === 0) return;
    publish.mutate(
      { caption: selectedCaption, platforms: selectedPlatforms },
      {
        onSuccess: (data) => {
          setPublishResult({
            success: data.success,
            message: data.success
              ? `Published to ${selectedPlatforms.join(", ")}!`
              : `Failed: ${data.error}`,
          });
        },
      }
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ background: darker, border: `1px solid ${teal}40` }}
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold text-sm" style={{ color: teal }}>
          Thank-You Post for {donorName === "Anonymous" ? "Anonymous Donor" : donorName}
        </div>
        <button onClick={onClose} style={{ color: muted }} className="text-xs hover:opacity-70">
          ✕ close
        </button>
      </div>

      {/* Generate captions */}
      {!generate.data && (
        <button
          onClick={handleGenerate}
          disabled={generate.isPending}
          className="w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: `${teal}20`, color: teal, border: `1px solid ${teal}40` }}
        >
          {generate.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <MessageSquarePlus size={14} />
          )}
          {generate.isPending ? "Generating..." : "Generate Thank-You Captions"}
        </button>
      )}

      {/* Caption options */}
      {generate.data && (
        <div className="space-y-2">
          <div className="text-xs font-medium tracking-widest uppercase" style={{ color: muted }}>
            Pick a caption
          </div>
          {generate.data.captions.map((cap, i) => (
            <button
              key={i}
              onClick={() => setSelectedCaption(cap)}
              className="w-full text-left rounded-lg p-3 text-xs leading-relaxed transition-all"
              style={{
                background: selectedCaption === cap ? `${teal}15` : `oklch(1 0 0 / 3%)`,
                border: `1px solid ${selectedCaption === cap ? teal : border}`,
                color: fg,
              }}
            >
              {cap}
            </button>
          ))}
        </div>
      )}

      {/* Edit caption */}
      {selectedCaption && (
        <div className="space-y-2">
          <div className="text-xs font-medium tracking-widest uppercase" style={{ color: muted }}>
            Edit caption
          </div>
          <textarea
            value={selectedCaption}
            onChange={(e) => setSelectedCaption(e.target.value)}
            rows={5}
            className="w-full rounded-lg p-3 text-xs resize-none"
            style={{
              background: "oklch(1 0 0 / 4%)",
              border: `1px solid ${border}`,
              color: fg,
              outline: "none",
            }}
          />
        </div>
      )}

      {/* Platform selector */}
      {selectedCaption && (
        <div className="space-y-2">
          <div className="text-xs font-medium tracking-widest uppercase" style={{ color: muted }}>
            Publish to
          </div>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: selectedPlatforms.includes(p) ? `${teal}20` : "oklch(1 0 0 / 4%)",
                  border: `1px solid ${selectedPlatforms.includes(p) ? teal : border}`,
                  color: selectedPlatforms.includes(p) ? teal : muted,
                }}
              >
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {selectedCaption && (
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2"
            style={{ background: "oklch(1 0 0 / 6%)", color: fg, border: `1px solid ${border}` }}
          >
            {copied ? <CheckCircle2 size={13} style={{ color: green }} /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handlePublish}
            disabled={publish.isPending || selectedPlatforms.length === 0}
            className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2"
            style={{ background: teal, color: "#0a1628" }}
          >
            {publish.isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
            {publish.isPending ? "Publishing..." : "Publish Now"}
          </button>
        </div>
      )}

      {/* Result */}
      {publishResult && (
        <div
          className="rounded-lg p-3 flex items-center gap-2 text-xs"
          style={{
            background: publishResult.success ? `${green}15` : "oklch(0.5 0.18 25 / 15%)",
            border: `1px solid ${publishResult.success ? green : "oklch(0.5 0.18 25)"}`,
            color: publishResult.success ? green : "oklch(0.7 0.18 25)",
          }}
        >
          {publishResult.success ? (
            <CheckCircle2 size={14} />
          ) : (
            <AlertCircle size={14} />
          )}
          {publishResult.message}
        </div>
      )}
    </div>
  );
}

// ── Donor row ─────────────────────────────────────────────────────────────
function DonorRow({
  donor,
  totalRaised,
  goal,
}: {
  donor: { name: string; amount: number; message: string; timeAgo: string };
  totalRaised: number;
  goal: number;
}) {
  const [showComposer, setShowComposer] = useState(false);

  return (
    <div
      className="rounded-xl p-4 space-y-2"
      style={{ background: dark, border: `1px solid ${border}` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: `${teal}20`, color: teal }}
          >
            {donor.name === "Anonymous" ? "?" : donor.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: fg }}>
              {donor.name}
            </div>
            {donor.timeAgo && (
              <div className="text-xs" style={{ color: muted }}>
                {donor.timeAgo}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {donor.amount > 0 && (
            <div className="font-bold text-sm" style={{ color: teal, fontFamily: "'Oswald', sans-serif" }}>
              ${donor.amount.toLocaleString()}
            </div>
          )}
          <button
            onClick={() => setShowComposer((v) => !v)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
            style={{
              background: showComposer ? `${teal}20` : "oklch(1 0 0 / 5%)",
              color: showComposer ? teal : muted,
              border: `1px solid ${showComposer ? teal + "40" : border}`,
            }}
          >
            <MessageSquarePlus size={12} />
            Thank
            {showComposer ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>
      </div>
      {donor.message && (
        <div className="text-xs italic pl-11" style={{ color: muted }}>
          "{donor.message}"
        </div>
      )}
      {showComposer && (
        <div className="pt-1">
          <ThankYouComposer
            donorName={donor.name}
            amount={donor.amount}
            totalRaised={totalRaised}
            goal={goal}
            onClose={() => setShowComposer(false)}
          />
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function Fundraising() {
  const { data: campaign, isLoading, error } = trpc.gofundme.getCampaign.useQuery(undefined, {
    refetchInterval: 5 * 60 * 1000, // auto-refresh every 5 min
  });
  const refresh = trpc.gofundme.refresh.useMutation();
  const utils = trpc.useUtils();

  const handleRefresh = () => {
    refresh.mutate(undefined, {
      onSuccess: () => {
        utils.gofundme.getCampaign.invalidate();
      },
    });
  };

  // Patreon static data (no API available)
  const patreonMonthly = 0;
  const patreonGoal = 500;
  const patreonPct = Math.round((patreonMonthly / patreonGoal) * 100);

  const amountRaised = campaign?.amountRaised ?? 0;
  const goal = campaign?.goal ?? 8500;
  const donorCount = campaign?.donorCount ?? 0;
  const heroesAmount = campaign?.heroesAmount ?? 0;
  const percentComplete = campaign?.percentComplete ?? 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: fg, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}
          >
            FUNDRAISING
          </h1>
          <p className="text-sm mt-0.5" style={{ color: muted }}>
            Working Man's Waters · Live GoFundMe data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={campaign?.shareUrl ?? "https://gofund.me/cd0e2d185"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: `${teal}20`, color: teal, border: `1px solid ${teal}40` }}
          >
            <ExternalLink size={12} />
            View on GoFundMe
          </a>
          <button
            onClick={handleRefresh}
            disabled={refresh.isPending || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "oklch(1 0 0 / 6%)", color: muted, border: `1px solid ${border}` }}
          >
            <RefreshCw size={12} className={refresh.isPending ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error banner */}
      {(error || campaign?.error) && (
        <div
          className="rounded-xl p-3 flex items-center gap-2 text-xs"
          style={{ background: "oklch(0.5 0.18 25 / 10%)", border: `1px solid oklch(0.5 0.18 25 / 40%)`, color: "oklch(0.7 0.18 25)" }}
        >
          <AlertCircle size={14} />
          Could not fetch live GoFundMe data — showing last known values. GoFundMe may be temporarily unavailable.
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-5 h-24 animate-pulse"
              style={{ background: dark }}
            />
          ))}
        </div>
      )}

      {/* Stat cards */}
      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Raised"
            value={`$${amountRaised.toLocaleString()}`}
            sub={`of $${goal.toLocaleString()} goal`}
            color={teal}
            icon={DollarSign}
          />
          <StatCard
            label="Donors"
            value={donorCount.toString()}
            sub="total supporters"
            color={orange}
            icon={Users}
          />
          <StatCard
            label="Progress"
            value={`${percentComplete}%`}
            sub="of campaign goal"
            color={green}
            icon={TrendingUp}
          />
          <StatCard
            label="Heroes on Water"
            value={`$${heroesAmount.toLocaleString()}`}
            sub="15% pledged to veterans"
            color="oklch(0.65 0.18 300)"
            icon={Heart}
          />
        </div>
      )}

      {/* Progress bar */}
      {!isLoading && (
        <div
          className="rounded-xl p-5"
          style={{ background: dark, border: `1px solid ${border}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium tracking-widest uppercase" style={{ color: muted }}>
              GoFundMe Campaign Progress
            </div>
            <div className="text-xs font-bold" style={{ color: teal }}>
              ${amountRaised.toLocaleString()} / ${goal.toLocaleString()}
            </div>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{ background: "oklch(1 0 0 / 6%)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(percentComplete, 1)}%`,
                background: `linear-gradient(90deg, ${teal}, oklch(0.65 0.18 170))`,
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs" style={{ color: muted }}>
            <span>{percentComplete}% funded</span>
            <span>15% → Heroes on the Water · ${heroesAmount.toLocaleString()} pledged</span>
          </div>
        </div>
      )}

      {/* Patreon */}
      <div
        className="rounded-xl p-5"
        style={{ background: dark, border: `1px solid ${border}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-medium tracking-widest uppercase" style={{ color: muted }}>
            Patreon Monthly Supporters
          </div>
          <a
            href="https://patreon.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1"
            style={{ color: orange }}
          >
            <ExternalLink size={11} /> Set up Patreon
          </a>
        </div>
        <div className="text-3xl font-bold mb-1" style={{ color: orange, fontFamily: "'Oswald', sans-serif" }}>
          ${patreonMonthly}/mo
        </div>
        <div className="text-sm mb-3" style={{ color: muted }}>
          goal: ${patreonGoal}/mo
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "oklch(1 0 0 / 6%)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.max(patreonPct, 1)}%`, background: orange }}
          />
        </div>
        <div className="text-xs mt-2" style={{ color: muted }}>
          {patreonPct}% of monthly goal · connect Patreon to show live data
        </div>
      </div>

      {/* Donor feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-medium tracking-widest uppercase" style={{ color: muted }}>
            Recent Donors
          </div>
          {campaign?.lastFetched && (
            <div className="text-xs" style={{ color: muted }}>
              Updated {new Date(campaign.lastFetched).toLocaleTimeString()}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-4 h-16 animate-pulse"
                style={{ background: dark }}
              />
            ))}
          </div>
        )}

        {!isLoading && campaign?.donors && campaign.donors.length > 0 && (
          <div className="space-y-3">
            {campaign.donors.map((donor, i) => (
              <DonorRow
                key={i}
                donor={donor}
                totalRaised={amountRaised}
                goal={goal}
              />
            ))}
          </div>
        )}

        {!isLoading && (!campaign?.donors || campaign.donors.length === 0) && (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: dark, border: `1px solid ${border}` }}
          >
            <Heart size={28} className="mx-auto mb-3" style={{ color: muted }} />
            <div className="text-sm font-medium mb-1" style={{ color: fg }}>
              Be the first donor
            </div>
            <div className="text-xs mb-4" style={{ color: muted }}>
              No donations yet — share your GoFundMe to get the ball rolling.
            </div>
            <a
              href={campaign?.shareUrl ?? "https://gofund.me/cd0e2d185"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium"
              style={{ background: teal, color: "#0a1628" }}
            >
              <ExternalLink size={12} />
              Open GoFundMe
            </a>
          </div>
        )}
      </div>

      {/* Cause partners */}
      <div>
        <div className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: muted }}>
          CAUSE PARTNERS
        </div>
        <div className="space-y-3">
          {CAUSES.map((c) => (
            <div
              key={c.id}
              className="rounded-xl p-4 flex items-center justify-between"
              style={{ background: dark, border: `1px solid ${border}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${teal}20` }}
                >
                  <Heart size={16} style={{ color: teal }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: fg }}>
                    {c.name}
                  </div>
                  <div className="text-xs" style={{ color: muted }}>
                    {c.description}
                  </div>
                </div>
              </div>
              <a href={c.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} style={{ color: teal }} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
