import { useState } from "react";
import { useSelector } from "react-redux";
import { Mail, X } from "lucide-react";
import { toast } from "sonner";
import type { RootState } from "@/app/store";
import { useResendVerification } from "@/hooks/useResendVerification";

export default function EmailVerificationBanner() {
  const user = useSelector((s: RootState) => s.auth.user);
  const [dismissed, setDismissed] = useState(false);
  const { mutate: resend, isPending } = useResendVerification();

  if (!user || user.emailVerified !== false || user.authProvider === "google" || dismissed) {
    return null;
  }

  function handleResend() {
    resend(undefined, {
      onSuccess: () => toast.success("Verification email sent"),
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : "Failed to send verification email";
        toast.error(message);
      },
    });
  }

  return (
    <div
      role="status"
      className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl px-4 py-3"
      style={{
        background: "rgba(99,102,241,0.08)",
        border: "1px solid rgba(99,102,241,0.2)",
      }}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Mail size={16} className="text-indigo-300 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">Verify your email</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
            Check your inbox to verify <span className="font-medium">{user.email}</span>.
            Email verification is required to create price alerts.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: "#4f46e5" }}
        >
          {isPending ? "Sending..." : "Resend email"}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
          aria-label="Dismiss verification reminder"
        >
          <X size={14} className="text-white/50" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
