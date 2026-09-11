import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle2, XCircle, TrendingUp, Loader2 } from "lucide-react";
import { useVerifyEmail } from "@/hooks/useVerifyEmail";
import type { RootState } from "@/app/store";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const { mutate: verify, isPending, isSuccess, isError, error } = useVerifyEmail();
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!token || attempted) return;
    setAttempted(true);
    verify(token);
  }, [token, verify, attempted]);

  const errorMessage =
    error instanceof Error ? error.message : "Verification link is invalid or expired";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "#09090b" }}
    >
      <title>Verify Email — StockSense</title>

      <div
        className="w-full max-w-md rounded-2xl p-8 text-center"
        style={{
          background: "#0e0e10",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#4f46e5,#6d28d9)",
            }}
          >
            <TrendingUp size={15} strokeWidth={2.5} className="text-white" aria-hidden="true" />
          </div>
          <span className="font-bold text-[15px] text-white">StockSense</span>
        </div>

        {isPending && (
          <div className="space-y-4">
            <Loader2
              size={40}
              className="mx-auto animate-spin text-indigo-400"
              aria-hidden="true"
            />
            <p className="text-white font-medium">Verifying your email...</p>
          </div>
        )}

        {!token && !isPending && (
          <div className="space-y-4">
            <XCircle size={40} className="mx-auto text-red-400" aria-hidden="true" />
            <h1 className="text-xl font-bold text-white">Invalid verification link</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              This link is missing a verification token. Check your email for the latest link.
            </p>
          </div>
        )}

        {token && isSuccess && (
          <div className="space-y-4">
            <CheckCircle2 size={40} className="mx-auto text-emerald-400" aria-hidden="true" />
            <h1 className="text-xl font-bold text-white">Email verified</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Your email is confirmed. You can now create price alerts and receive notifications.
            </p>
            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
              className="w-full mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#4f46e5" }}
            >
              {isAuthenticated ? "Go to dashboard" : "Sign in"}
            </button>
          </div>
        )}

        {token && isError && !isPending && (
          <div className="space-y-4">
            <XCircle size={40} className="mx-auto text-red-400" aria-hidden="true" />
            <h1 className="text-xl font-bold text-white">Verification failed</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              {errorMessage}
            </p>
            <Link
              to={isAuthenticated ? "/settings" : "/login"}
              className="inline-block w-full mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#4f46e5" }}
            >
              {isAuthenticated ? "Go to settings" : "Back to sign in"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
