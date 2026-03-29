import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  ROADMAP_PHASES,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  getTotalTaskCount,
  type RoadmapTask,
} from "@/lib/roadmapData";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Flag, MapPin, Tent, Fish } from "lucide-react";
import { toast } from "sonner";

// ─── Progress bar ────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ─── Single task row ─────────────────────────────────────────────────────────
function TaskRow({
  task,
  checked,
  onToggle,
}: {
  task: RoadmapTask;
  checked: boolean;
  onToggle: (id: string, val: boolean) => void;
}) {
  const catColor = CATEGORY_COLORS[task.category];
  return (
    <button
      onClick={() => onToggle(task.id, !checked)}
      className="w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-white/5 group"
    >
      <span className="mt-0.5 shrink-0">
        {checked ? (
          <CheckCircle2 size={18} style={{ color: catColor }} />
        ) : (
          <Circle size={18} className="text-white/30 group-hover:text-white/60 transition-colors" />
        )}
      </span>
      <span className="flex-1 min-w-0">
        <span
          className={`text-sm leading-snug transition-colors ${
            checked ? "line-through text-white/35" : "text-white/85"
          }`}
        >
          {task.label}
        </span>
        {task.detail && !checked && (
          <span className="block text-xs text-white/40 mt-0.5 italic">{task.detail}</span>
        )}
      </span>
      <span
        className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
        style={{ background: catColor + "33", color: catColor }}
      >
        {CATEGORY_LABELS[task.category]}
      </span>
    </button>
  );
}

// ─── Day card ────────────────────────────────────────────────────────────────
function DayCard({
  day,
  checkedIds,
  onToggle,
  onBulkToggle,
}: {
  day: (typeof ROADMAP_PHASES)[0]["days"][0];
  checkedIds: Set<string>;
  onToggle: (id: string, val: boolean) => void;
  onBulkToggle: (ids: string[], val: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const taskIds = day.tasks.map(t => t.id);
  const doneCount = taskIds.filter(id => checkedIds.has(id)).length;
  const allDone = doneCount === taskIds.length;
  const pct = taskIds.length === 0 ? 0 : Math.round((doneCount / taskIds.length) * 100);

  return (
    <div
      className={`rounded-xl border transition-all ${
        day.milestone
          ? "border-amber-400/40 bg-amber-400/5"
          : day.isTripDay
          ? "border-teal-400/25 bg-teal-400/5"
          : "border-white/8 bg-white/3"
      }`}
    >
      {/* Day header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="shrink-0 text-white/40">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>

        <span className="flex-1 min-w-0">
          {day.milestone && (
            <span className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Flag size={12} />
              {day.milestone}
            </span>
          )}
          <span className="flex items-center gap-2">
            {day.isTripDay && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-400/15 px-1.5 py-0.5 rounded">
                <Fish size={10} />
                Trip {day.tripNumber}
              </span>
            )}
            <span className="text-sm font-medium text-white/80">{day.label}</span>
          </span>
          {day.siteName && (
            <span className="flex items-center gap-1 text-xs text-white/45 mt-0.5">
              <MapPin size={10} />
              {day.siteName}
            </span>
          )}
        </span>

        <span className="shrink-0 flex items-center gap-2">
          <span className="text-xs text-white/40">
            {doneCount}/{taskIds.length}
          </span>
          <div className="w-16">
            <ProgressBar
              value={doneCount}
              max={taskIds.length}
              color={allDone ? "oklch(0.65 0.18 145)" : "oklch(0.65 0.18 200)"}
            />
          </div>
          <span className="text-xs font-bold text-white/50 w-8 text-right">{pct}%</span>
        </span>
      </button>

      {/* Task list */}
      {open && (
        <div className="px-3 pb-3 space-y-0.5 border-t border-white/8 pt-2">
          {/* Bulk check/uncheck */}
          <div className="flex justify-end mb-1">
            <button
              onClick={() => onBulkToggle(taskIds, !allDone)}
              className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded"
            >
              {allDone ? "Uncheck all" : "Check all"}
            </button>
          </div>
          {day.tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              checked={checkedIds.has(task.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Phase accordion ─────────────────────────────────────────────────────────
function PhaseAccordion({
  phase,
  checkedIds,
  onToggle,
  onBulkToggle,
}: {
  phase: (typeof ROADMAP_PHASES)[0];
  checkedIds: Set<string>;
  onToggle: (id: string, val: boolean) => void;
  onBulkToggle: (ids: string[], val: boolean) => void;
}) {
  const [open, setOpen] = useState(phase.phaseId === "phase-0");

  const allTaskIds = phase.days.flatMap(d => d.tasks.map(t => t.id));
  const doneCount = allTaskIds.filter(id => checkedIds.has(id)).length;
  const pct = allTaskIds.length === 0 ? 0 : Math.round((doneCount / allTaskIds.length) * 100);

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      {/* Phase header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        style={{ background: phase.color + "18" }}
      >
        <span className="text-2xl">{phase.icon}</span>
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2">
            <span className="font-bold text-base tracking-wide" style={{ color: phase.color }}>
              {phase.title}
            </span>
            <span className="text-xs text-white/40">{phase.dateRange}</span>
          </span>
          <span className="text-sm text-white/55 mt-0.5 block">{phase.subtitle}</span>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1">
              <ProgressBar value={doneCount} max={allTaskIds.length} color={phase.color} />
            </div>
            <span className="text-xs font-bold shrink-0" style={{ color: phase.color }}>
              {pct}% · {doneCount}/{allTaskIds.length}
            </span>
          </div>
        </span>
        <span className="shrink-0 text-white/40">
          {open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </span>
      </button>

      {/* Days */}
      {open && (
        <div className="px-4 py-3 space-y-2 bg-black/20">
          {phase.days.map(day => (
            <DayCard
              key={day.dayId}
              day={day}
              checkedIds={checkedIds}
              onToggle={onToggle}
              onBulkToggle={onBulkToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Roadmap page ────────────────────────────────────────────────────────
export default function Roadmap() {
  const totalTasks = getTotalTaskCount();

  const { data, refetch } = trpc.roadmap.getChecked.useQuery(undefined, {
    staleTime: 30_000,
  });

  const toggleMutation = trpc.roadmap.toggle.useMutation({
    onError: () => toast.error("Failed to save — please try again"),
  });

  const bulkToggleMutation = trpc.roadmap.bulkToggle.useMutation({
    onError: () => toast.error("Failed to save — please try again"),
  });

  const checkedIds = useMemo(
    () => new Set<string>(data?.checkedIds ?? []),
    [data]
  );

  const totalDone = checkedIds.size;
  const overallPct = totalTasks === 0 ? 0 : Math.round((totalDone / totalTasks) * 100);

  const handleToggle = (taskId: string, checked: boolean) => {
    // Optimistic update via refetch after mutation
    toggleMutation.mutate({ taskId, checked }, { onSuccess: () => refetch() });
  };

  const handleBulkToggle = (taskIds: string[], checked: boolean) => {
    bulkToggleMutation.mutate({ taskIds, checked }, { onSuccess: () => refetch() });
  };

  // Filter state
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  const filteredPhases = useMemo(() => {
    if (filter === "all") return ROADMAP_PHASES;
    return ROADMAP_PHASES.map(phase => ({
      ...phase,
      days: phase.days
        .map(day => ({
          ...day,
          tasks: day.tasks.filter(t =>
            filter === "done" ? checkedIds.has(t.id) : !checkedIds.has(t.id)
          ),
        }))
        .filter(day => day.tasks.length > 0),
    })).filter(phase => phase.days.length > 0);
  }, [filter, checkedIds]);

  return (
    <div className="min-h-screen bg-[oklch(0.13_0.02_240)] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Tent size={28} className="text-amber-400" />
            <h1 className="text-3xl font-bold tracking-tight">Journey Roadmap</h1>
          </div>
          <p className="text-white/50 text-sm ml-10">
            Working Man's Waters — Day-by-day plan from launch to the Root River finish line
          </p>
        </div>

        {/* Overall progress */}
        <div className="rounded-2xl border border-white/10 bg-white/4 p-5 mb-6">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Overall Progress</p>
              <p className="text-4xl font-bold text-white">{overallPct}%</p>
              <p className="text-sm text-white/50 mt-1">
                {totalDone} of {totalTasks} tasks complete
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 mb-1">Phases</p>
              <p className="text-2xl font-bold text-amber-400">{ROADMAP_PHASES.length}</p>
              <p className="text-xs text-white/40 mt-1">
                {ROADMAP_PHASES.reduce((s, p) => s + p.days.length, 0)} days planned
              </p>
            </div>
          </div>
          <ProgressBar value={totalDone} max={totalTasks} color="oklch(0.65 0.18 50)" />

          {/* Phase mini-bars */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {ROADMAP_PHASES.map(phase => {
              const ids = phase.days.flatMap(d => d.tasks.map(t => t.id));
              const done = ids.filter(id => checkedIds.has(id)).length;
              const pct = ids.length === 0 ? 0 : Math.round((done / ids.length) * 100);
              return (
                <div key={phase.phaseId} className="text-center">
                  <p className="text-lg mb-1">{phase.icon}</p>
                  <ProgressBar value={done} max={ids.length} color={phase.color} />
                  <p className="text-[10px] text-white/35 mt-1">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {(["all", "pending", "done"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-teal-500/25 text-teal-300 border border-teal-400/40"
                  : "text-white/40 hover:text-white/70 border border-white/10"
              }`}
            >
              {f === "all" ? `All (${totalTasks})` : f === "pending" ? `Pending (${totalTasks - totalDone})` : `Done (${totalDone})`}
            </button>
          ))}
        </div>

        {/* Phase list */}
        <div className="space-y-4">
          {filteredPhases.map(phase => (
            <PhaseAccordion
              key={phase.phaseId}
              phase={phase}
              checkedIds={checkedIds}
              onToggle={handleToggle}
              onBulkToggle={handleBulkToggle}
            />
          ))}
        </div>

        {totalDone === totalTasks && totalTasks > 0 && (
          <div className="mt-8 text-center py-8 rounded-2xl border border-amber-400/30 bg-amber-400/5">
            <p className="text-4xl mb-2">🏆</p>
            <p className="text-xl font-bold text-amber-400">Journey Complete!</p>
            <p className="text-white/50 text-sm mt-1">124 trips. All of Minnesota. You did it, Gabe.</p>
          </div>
        )}
      </div>
    </div>
  );
}
