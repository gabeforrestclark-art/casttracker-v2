import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Image, Video, Trash2, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface TripMediaGalleryProps {
  tripNumber: number;
}

export function TripMediaGallery({ tripNumber }: TripMediaGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const { data: media = [], refetch } = trpc.media.getByTrip.useQuery({ tripNumber });
  const deleteMutation = trpc.media.delete.useMutation({
    onSuccess: () => {
      toast.success("Media deleted");
      refetch();
      if (lightboxIdx !== null && lightboxIdx >= media.length - 1) {
        setLightboxIdx(null);
      }
    },
    onError: () => toast.error("Failed to delete media"),
  });

  if (media.length === 0) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 rounded-lg text-sm" style={{ background: "oklch(0.13 0.01 240)", color: "oklch(0.45 0.01 200)" }}>
        <Image size={14} />
        <span>No photos or videos yet. Click "Add Media" to upload.</span>
      </div>
    );
  }

  const currentItem = lightboxIdx !== null ? media[lightboxIdx] : null;

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-4 gap-2">
        {media.map((item, idx) => {
          const isVideo = item.mimeType.startsWith("video/");
          return (
            <div
              key={item.id}
              className="relative group rounded-lg overflow-hidden cursor-pointer"
              style={{ background: "oklch(0.2 0.01 240)", aspectRatio: "1" }}
              onClick={() => setLightboxIdx(idx)}
            >
              {isVideo ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <Video size={24} style={{ color: "oklch(0.65 0.18 200)" }} />
                  <span className="text-xs" style={{ color: "oklch(0.45 0.01 200)" }}>Video</span>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.fileName}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                style={{ background: "oklch(0 0 0 / 60%)" }}>
                <ZoomIn size={16} style={{ color: "#fff" }} />
              </div>

              {/* Delete button */}
              <button
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5"
                style={{ background: "oklch(0 0 0 / 70%)" }}
                onClick={e => {
                  e.stopPropagation();
                  deleteMutation.mutate({ id: item.id });
                }}
              >
                <Trash2 size={12} style={{ color: "#EF4444" }} />
              </button>

              {/* Caption indicator */}
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 text-xs truncate"
                  style={{ background: "oklch(0 0 0 / 70%)", color: "#fff" }}>
                  {item.caption}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && currentItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "oklch(0 0 0 / 90%)" }}
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative max-w-4xl w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              className="absolute -top-10 right-0 p-1 rounded"
              style={{ color: "#fff" }}
              onClick={() => setLightboxIdx(null)}
            >
              <X size={24} />
            </button>

            {/* Media */}
            <div className="rounded-xl overflow-hidden" style={{ background: "oklch(0.1 0.01 240)" }}>
              {currentItem.mimeType.startsWith("video/") ? (
                <video
                  src={currentItem.url}
                  controls
                  className="w-full max-h-[70vh] object-contain"
                />
              ) : (
                <img
                  src={currentItem.url}
                  alt={currentItem.fileName}
                  className="w-full max-h-[70vh] object-contain"
                />
              )}
            </div>

            {/* Caption + info */}
            <div className="mt-3 px-2 flex items-center justify-between">
              <div>
                {currentItem.caption && (
                  <p className="text-sm" style={{ color: "oklch(0.92 0.005 200)" }}>{currentItem.caption}</p>
                )}
                <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.01 200)" }}>
                  {currentItem.fileName} · {(currentItem.fileSize / 1024 / 1024).toFixed(1)} MB · {new Date(currentItem.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "oklch(0.45 0.01 200)" }}>{lightboxIdx + 1} / {media.length}</span>
                <button
                  className="p-1 rounded hover:bg-white/10"
                  style={{ color: "#fff" }}
                  onClick={() => setLightboxIdx(Math.max(0, lightboxIdx - 1))}
                  disabled={lightboxIdx === 0}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="p-1 rounded hover:bg-white/10"
                  style={{ color: "#fff" }}
                  onClick={() => setLightboxIdx(Math.min(media.length - 1, lightboxIdx + 1))}
                  disabled={lightboxIdx === media.length - 1}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
