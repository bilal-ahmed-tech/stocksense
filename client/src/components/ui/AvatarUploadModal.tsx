import { useState, useCallback, useRef } from "react";
import { X, Upload, ZoomIn, ZoomOut, Check, Trash2, TrendingUp } from "lucide-react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { useUploadAvatar } from "@/hooks/useUploadAvatar";
import { useDeleteAvatar } from "@/hooks/useDeleteAvatar";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

interface Props {
  onClose: () => void;
}

async function getCroppedImage(imageSrc: string, croppedAreaPixels: Area): Promise<File> {
  const image = await createImageBitmap(await fetch(imageSrc).then((r) => r.blob()));
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0, 0, 400, 400
  );
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(new File([blob!], "avatar.jpg", { type: "image/jpeg" })),
      "image/jpeg",
      0.92
    );
  });
}

export default function AvatarUploadModal({ onClose }: Props) {
  const user = useSelector((s: RootState) => s.auth.user);
  const { mutate: uploadAvatar, isPending: uploading } = useUploadAvatar();
  const { mutate: deleteAvatar, isPending: deleting } = useDeleteAvatar();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImageSrc(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  async function handleUpload() {
    if (!imageSrc || !croppedAreaPixels) return;
    const file = await getCroppedImage(imageSrc, croppedAreaPixels);
    uploadAvatar(file, { onSuccess: () => onClose() });
  }

  function handleReset() {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const isPending = uploading || deleting;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Update avatar"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
              >
                <TrendingUp size={13} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h2 className="text-sm font-bold text-white">
                {imageSrc ? "Position your photo" : "Update Avatar"}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)";
              }}
            >
              <X size={15} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          {imageSrc ? (
            <>
              {/* Cropper */}
              <div className="relative" style={{ height: 280, background: "#000" }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              {/* Zoom */}
              <div className="px-5 py-4 space-y-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                    aria-label="Zoom out"
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500"
                    style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
                  >
                    <ZoomOut size={14} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    aria-label="Zoom level"
                    className="flex-1"
                    style={{ accentColor: "#4f46e5" }}
                  />
                  <button
                    onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                    aria-label="Zoom in"
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500"
                    style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
                  >
                    <ZoomIn size={14} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </div>
                <p className="text-[10px] text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Drag to reposition · Scroll or slider to zoom
                </p>
              </div>
            </>
          ) : (
            <div className="px-5 py-5 space-y-4">
              {/* Current avatar */}
              <div className="flex justify-center">
                <div
                  className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ border: "2px solid rgba(255,255,255,0.1)" }}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Current avatar"
                      className="w-20 h-20 object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-xl font-bold"
                      style={{
                        background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                        color: "#fff",
                      }}
                    >
                      {initials}
                    </div>
                  )}
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Upload image — click or drag and drop"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                }}
                className="flex flex-col items-center gap-3 py-8 rounded-xl cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                style={{
                  border: dragOver
                    ? "2px dashed rgba(99,102,241,0.6)"
                    : "2px dashed rgba(255,255,255,0.1)",
                  background: dragOver ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)",
                }}
                onMouseEnter={(e) => {
                  if (!dragOver) {
                    (e.currentTarget as HTMLDivElement).style.border = "2px dashed rgba(255,255,255,0.2)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!dragOver) {
                    (e.currentTarget as HTMLDivElement).style.border = "2px dashed rgba(255,255,255,0.1)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)";
                  }
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
                >
                  <Upload size={18} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">
                    Click or drag image here
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                  aria-hidden="true"
                />
              </div>

              {/* Delete button */}
              {user?.avatar && (
                <button
                  onClick={() => deleteAvatar(undefined, { onSuccess: () => onClose() })}
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-40"
                  style={{
                    color: "#f87171",
                    border: "1px solid rgba(239,68,68,0.2)",
                    background: "rgba(239,68,68,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)";
                  }}
                >
                  <Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />
                  {deleting ? "Removing..." : "Remove current photo"}
                </button>
              )}
            </div>
          )}

          {/* Footer */}
          <div
            className="px-5 pb-5 flex gap-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16 }}
          >
            {imageSrc ? (
              <>
                <button
                  onClick={handleReset}
                  disabled={isPending}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-40"
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  Choose different
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl transition-all active:scale-95 disabled:active:scale-100 disabled:opacity-40 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  style={{ background: "#4f46e5" }}
                >
                  {uploading ? (
                    <>
                      <div
                        className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: "rgba(255,255,255,0.4)", borderTopColor: "transparent" }}
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check size={14} strokeWidth={2} aria-hidden="true" />
                      Save photo
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                disabled={isPending}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-40"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}