import { useCallback, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, X, Image, Video, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/quicktime", "video/webm"];

interface PendingFile {
  file: File;
  preview: string;
  caption: string;
  status: "pending" | "uploading" | "done" | "error";
}

interface MediaUploadModalProps {
  open: boolean;
  onClose: () => void;
  tripNumber: number;
  tripName: string;
  onUploaded: () => void;
}

export function MediaUploadModal({ open, onClose, tripNumber, tripName, onUploaded }: MediaUploadModalProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.media.upload.useMutation();

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.filter(f => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast.error(`${f.name}: unsupported file type`);
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name}: file too large (max 100MB)`);
        return false;
      }
      return true;
    });

    valid.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPendingFiles(prev => [
          ...prev,
          { file, preview: reader.result as string, caption: "", status: "pending" },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeFile = (idx: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const updateCaption = (idx: number, caption: string) => {
    setPendingFiles(prev => prev.map((f, i) => i === idx ? { ...f, caption } : f));
  };

  const uploadAll = async () => {
    let anyError = false;
    for (let i = 0; i < pendingFiles.length; i++) {
      const pf = pendingFiles[i];
      if (pf.status === "done") continue;

      setPendingFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "uploading" } : f));

      try {
        await uploadMutation.mutateAsync({
          tripNumber,
          fileName: pf.file.name,
          mimeType: pf.file.type,
          fileSize: pf.file.size,
          base64Data: pf.preview,
          caption: pf.caption || undefined,
        });
        setPendingFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "done" } : f));
      } catch {
        anyError = true;
        setPendingFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "error" } : f));
      }
    }

    if (!anyError) {
      toast.success("All media uploaded successfully!");
      onUploaded();
      handleClose();
    } else {
      toast.error("Some files failed to upload. Please retry.");
    }
  };

  const handleClose = () => {
    setPendingFiles([]);
    onClose();
  };

  const isUploading = pendingFiles.some(f => f.status === "uploading");
  const hasPending = pendingFiles.some(f => f.status === "pending" || f.status === "error");

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: "oklch(0.17 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "oklch(0.92 0.005 200)", fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}>
            UPLOAD MEDIA — TRIP #{tripNumber}
          </DialogTitle>
          <p className="text-sm" style={{ color: "oklch(0.45 0.01 200)" }}>{tripName}</p>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border-2 border-dashed cursor-pointer flex flex-col items-center justify-center py-10 gap-3 transition-all"
          style={{
            borderColor: isDragging ? "oklch(0.65 0.18 200)" : "oklch(1 0 0 / 15%)",
            background: isDragging ? "oklch(0.65 0.18 200 / 8%)" : "oklch(0.13 0.01 240)",
          }}
        >
          <Upload size={32} style={{ color: "oklch(0.65 0.18 200)" }} />
          <div className="text-center">
            <p className="font-medium" style={{ color: "oklch(0.92 0.005 200)" }}>Drop photos & videos here</p>
            <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.01 200)" }}>or click to browse · JPG, PNG, WebP, GIF, MP4, MOV, WebM · max 100MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={e => e.target.files && addFiles(e.target.files)}
          />
        </div>

        {/* File Previews */}
        {pendingFiles.length > 0 && (
          <div className="space-y-3 mt-2">
            {pendingFiles.map((pf, idx) => {
              const isVideo = pf.file.type.startsWith("video/");
              return (
                <div
                  key={idx}
                  className="flex gap-3 rounded-lg p-3"
                  style={{
                    background: "oklch(0.13 0.01 240)",
                    border: `1px solid ${pf.status === "error" ? "#EF4444" : pf.status === "done" ? "#22C55E" : "oklch(1 0 0 / 8%)"}`,
                  }}
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ background: "oklch(0.2 0.01 240)" }}>
                    {isVideo ? (
                      <Video size={28} style={{ color: "oklch(0.65 0.18 200)" }} />
                    ) : (
                      <img src={pf.preview} alt={pf.file.name} className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Info + Caption */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "oklch(0.92 0.005 200)" }}>{pf.file.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.01 200)" }}>
                          {isVideo ? <Video size={10} className="inline mr-1" /> : <Image size={10} className="inline mr-1" />}
                          {(pf.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {pf.status === "uploading" && <Loader2 size={16} className="animate-spin" style={{ color: "oklch(0.65 0.18 200)" }} />}
                        {pf.status === "done" && <span className="text-xs font-medium" style={{ color: "#22C55E" }}>✓ Done</span>}
                        {pf.status === "error" && <span className="text-xs font-medium" style={{ color: "#EF4444" }}>✗ Failed</span>}
                        {pf.status !== "uploading" && pf.status !== "done" && (
                          <button onClick={() => removeFile(idx)} className="rounded p-0.5 hover:bg-white/10">
                            <X size={14} style={{ color: "oklch(0.45 0.01 200)" }} />
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Add a caption (optional)..."
                      value={pf.caption}
                      onChange={e => updateCaption(idx, e.target.value)}
                      disabled={pf.status === "uploading" || pf.status === "done"}
                      className="mt-2 w-full text-sm rounded px-2 py-1 outline-none"
                      style={{
                        background: "oklch(0.2 0.01 240)",
                        border: "1px solid oklch(1 0 0 / 10%)",
                        color: "oklch(0.92 0.005 200)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}
            style={{ borderColor: "oklch(1 0 0 / 15%)", color: "oklch(0.92 0.005 200)" }}>
            Cancel
          </Button>
          <Button
            onClick={uploadAll}
            disabled={!hasPending || isUploading}
            style={{ background: "oklch(0.65 0.18 200)", color: "#fff" }}
          >
            {isUploading ? (
              <><Loader2 size={14} className="animate-spin mr-2" /> Uploading...</>
            ) : (
              <><Upload size={14} className="mr-2" /> Upload {pendingFiles.filter(f => f.status !== "done").length} File{pendingFiles.filter(f => f.status !== "done").length !== 1 ? "s" : ""}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
