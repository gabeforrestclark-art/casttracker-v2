import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CheckCircle2, Circle, FileText, Share2, Trash2,
  Instagram, Youtube, Facebook, Send, Clock, AlertCircle, Loader2
} from "lucide-react";
import type { RoadmapTask } from "@/lib/roadmapData";

const CATEGORY_COLORS: Record<string, string> = {
  gear: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  media: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  fundraising: "bg-green-500/20 text-green-300 border-green-500/30",
  fishing: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  business: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  admin: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const PLATFORM_OPTIONS = [
  { id: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-400" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-400" },
  { id: "tiktok", label: "TikTok", icon: Send, color: "text-cyan-400" },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "text-red-400" },
];

interface TaskDetailDrawerProps {
  task: RoadmapTask | null;
  isChecked: boolean;
  onClose: () => void;
  onToggle: (taskId: string) => void;
}

export function TaskDetailDrawer({ task, isChecked, onClose, onToggle }: TaskDetailDrawerProps) {
  const [notes, setNotes] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "facebook"]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [showComposer, setShowComposer] = useState(false);

  // Fetch existing note for this task
  const { data: noteData } = trpc.social.getNote.useQuery(
    { taskId: task?.id ?? "" },
    { enabled: !!task?.id }
  );

  // Fetch existing posts for this task
  const { data: posts, refetch: refetchPosts } = trpc.social.listByTask.useQuery(
    { taskId: task?.id ?? "" },
    { enabled: !!task?.id }
  );

  const saveNoteMutation = trpc.social.saveNote.useMutation({
    onSuccess: () => {
      setNotesDirty(false);
      toast.success("Notes saved");
    },
  });

  const publishNewMutation = trpc.social.publishNew.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.status === "published" ? "Published to socials!" : "Post queued for scheduled time!");
        setCaption("");
        setScheduledAt("");
        setShowComposer(false);
        refetchPosts();
      } else {
        toast.error(`Publish failed: ${result.error}`);
      }
    },
    onError: () => toast.error("Failed to publish post"),
  });

  const deletePostMutation = trpc.social.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      refetchPosts();
    },
  });

  // Sync note data when task changes
  useEffect(() => {
    if (noteData) {
      setNotes(noteData.notes ?? "");
    } else {
      setNotes("");
    }
    setNotesDirty(false);
    setCaption("");
    setShowComposer(false);
  }, [task?.id, noteData]);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePublish = () => {
    if (!task || !caption.trim()) return;
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform");
      return;
    }
    publishNewMutation.mutate({
      taskId: task.id,
      caption: caption.trim(),
      platforms: selectedPlatforms,
      scheduledAt: scheduledAt || undefined,
    });
  };

  const isMediaTask = task?.category === "media";

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      draft: { label: "Draft", className: "bg-slate-500/20 text-slate-300" },
      queued: { label: "Scheduled", className: "bg-amber-500/20 text-amber-300" },
      published: { label: "Published", className: "bg-green-500/20 text-green-300" },
      failed: { label: "Failed", className: "bg-red-500/20 text-red-300" },
    };
    const s = map[status] ?? map.draft;
    return <Badge className={`text-xs border-0 ${s.className}`}>{s.label}</Badge>;
  };

  return (
    <Sheet open={!!task} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-[#0f1923] border-l border-slate-700/50 text-white overflow-y-auto"
      >
        {task && (
          <>
            <SheetHeader className="pt-2 pb-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggle(task.id)}
                  className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                >
                  {isChecked
                    ? <CheckCircle2 className="w-6 h-6 text-teal-400" />
                    : <Circle className="w-6 h-6 text-slate-500 hover:text-teal-400" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-white text-base leading-snug font-semibold">
                    {task.label}
                  </SheetTitle>
                  {task.detail && (
                    <SheetDescription className="text-slate-400 text-sm mt-1">
                      {task.detail}
                    </SheetDescription>
                  )}
                  <Badge
                    className={`mt-2 text-xs border capitalize ${CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.admin}`}
                  >
                    {task.category}
                  </Badge>
                </div>
              </div>
            </SheetHeader>

            <Separator className="bg-slate-700/50 mb-4" />

            {/* Notes Section */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Notes</span>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setNotesDirty(true); }}
                placeholder="Add prep notes, reminders, or observations for this task..."
                className="bg-slate-800/60 border-slate-600/50 text-white placeholder:text-slate-500 text-sm resize-none min-h-[90px] focus:border-teal-500/50"
              />
              {notesDirty && (
                <Button
                  size="sm"
                  onClick={() => saveNoteMutation.mutate({ taskId: task.id, notes })}
                  disabled={saveNoteMutation.isPending}
                  className="mt-2 bg-teal-600 hover:bg-teal-500 text-white text-xs h-7"
                >
                  {saveNoteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  Save Notes
                </Button>
              )}
            </div>

            {/* Social Publish Section — only for media tasks */}
            {isMediaTask && (
              <>
                <Separator className="bg-slate-700/50 mb-4" />
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-slate-300">Publish to Socials</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowComposer(!showComposer)}
                      className="text-xs h-7 border-purple-500/40 text-purple-300 hover:bg-purple-500/10 bg-transparent"
                    >
                      {showComposer ? "Cancel" : "+ New Post"}
                    </Button>
                  </div>

                  {/* Composer */}
                  {showComposer && (
                    <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-600/40 mb-4">
                      <Textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={`Write your post caption...\n\n#WorkingMansWaters #MNFishing #KayakFishing`}
                        className="bg-slate-900/60 border-slate-600/50 text-white placeholder:text-slate-500 text-sm resize-none min-h-[100px] mb-3 focus:border-purple-500/50"
                      />

                      {/* Platform selector */}
                      <div className="mb-3">
                        <p className="text-xs text-slate-400 mb-2">Platforms</p>
                        <div className="flex flex-wrap gap-2">
                          {PLATFORM_OPTIONS.map(({ id, label, icon: Icon, color }) => (
                            <button
                              key={id}
                              onClick={() => togglePlatform(id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all ${
                                selectedPlatforms.includes(id)
                                  ? "border-purple-500/60 bg-purple-500/20 text-white"
                                  : "border-slate-600/40 bg-slate-800/40 text-slate-400 hover:border-slate-500"
                              }`}
                            >
                              <Icon className={`w-3 h-3 ${selectedPlatforms.includes(id) ? color : ""}`} />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Schedule picker */}
                      <div className="mb-3">
                        <p className="text-xs text-slate-400 mb-1">Schedule (optional — leave blank to post now)</p>
                        <input
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(e) => setScheduledAt(e.target.value)}
                          className="w-full bg-slate-900/60 border border-slate-600/50 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                        />
                      </div>

                      <Button
                        onClick={handlePublish}
                        disabled={!caption.trim() || selectedPlatforms.length === 0 || publishNewMutation.isPending}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm"
                      >
                        {publishNewMutation.isPending
                          ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Publishing...</>
                          : scheduledAt
                            ? <><Clock className="w-4 h-4 mr-2" />Schedule Post</>
                            : <><Send className="w-4 h-4 mr-2" />Publish Now</>
                        }
                      </Button>
                    </div>
                  )}

                  {/* Existing posts list */}
                  {posts && posts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Published Posts</p>
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/40"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex flex-wrap gap-1">
                              {post.platforms.split(",").map(p => (
                                <span key={p} className="text-xs text-slate-400 capitalize">{p}</span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {statusBadge(post.status)}
                              <button
                                onClick={() => deletePostMutation.mutate({ postId: post.id })}
                                className="text-slate-600 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-2">{post.caption}</p>
                          {post.status === "failed" && post.errorMessage && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3 text-red-400" />
                              <p className="text-xs text-red-400">{post.errorMessage}</p>
                            </div>
                          )}
                          {post.scheduledAt && post.status === "queued" && (
                            <p className="text-xs text-amber-400 mt-1">
                              Scheduled: {new Date(post.scheduledAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mark complete button */}
            <Separator className="bg-slate-700/50 mb-4" />
            <Button
              onClick={() => { onToggle(task.id); onClose(); }}
              className={`w-full ${isChecked
                ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                : "bg-teal-600 hover:bg-teal-500 text-white"
              }`}
            >
              {isChecked
                ? <><Circle className="w-4 h-4 mr-2" />Mark Incomplete</>
                : <><CheckCircle2 className="w-4 h-4 mr-2" />Mark Complete</>
              }
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
