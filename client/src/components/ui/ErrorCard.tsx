import { AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

interface ErrorCardProps {
  message?: string;
  refetch?: () => void;
}

export default function ErrorCard({
  message = "Something went wrong.",
  refetch,
}: ErrorCardProps) {
  const [spinning, setSpinning] = useState(false);

  function handleRetry() {
    if (!refetch) return;
    setSpinning(true);
    refetch();
    setTimeout(() => setSpinning(false), 1000);
  }

  return (
    <div
      style={{ background: "#0e0e10", border: "1px solid rgba(239,68,68,0.2)" }}
      className="rounded-xl p-6 flex flex-col items-center gap-3 text-center"
    >
      <div
        style={{ background: "rgba(239,68,68,0.1)" }}
        className="rounded-full p-3"
      >
        <AlertCircle
          size={22}
          strokeWidth={1.5}
          style={{ color: "#ef4444" }}
          aria-hidden="true"
        />
      </div>

      <p style={{ color: "rgba(255,255,255,0.6)" }} className="text-sm">
        {message}
      </p>

      {refetch && (
        <button
          onClick={handleRetry}
          style={{
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                     hover:bg-white/10 active:scale-95 transition-all
                     focus-visible:outline focus-visible:outline-indigo-500"
        >
          <RefreshCw
            size={14}
            strokeWidth={1.5}
            aria-hidden="true"
            className={spinning ? "animate-spin" : ""}
          />
          Try again
        </button>
      )}
    </div>
  );
}