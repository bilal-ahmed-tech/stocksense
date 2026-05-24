import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useLogin } from "@/hooks/useLogin";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError("");
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setErrors({});
    login(
      { email, password },
      {
        onSuccess: () => navigate("/dashboard"),
        onError: (err) => {
          setServerError(
            axios.isAxiosError(err)
              ? (err.response?.data as { error: string })?.error ??
                  "Invalid email or password"
              : "Something went wrong"
          );
        },
      }
    );
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#09090b" }}
    >
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between p-10 w-105 shrink-0"
        style={{
          background: "#0c0c0f",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#4f46e5,#6d28d9)",
              boxShadow: "0 0 20px rgba(79,70,229,0.3)",
            }}
          >
            <TrendingUp size={15} strokeWidth={2.5} className="text-white" aria-hidden="true" />
          </div>
          <span className="font-bold text-[15px] text-white tracking-tight">
            StockSense
          </span>
        </div>

        <div className="space-y-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.12)" }}
          >
            <TrendingUp size={22} strokeWidth={1.5} style={{ color: "#818cf8" }} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
              Master the market without the risk
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
              Trade with $100,000 in virtual funds. Real prices, real charts,
              real experience — zero risk.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Starting Balance", value: "$100K" },
              { label: "Live Data", value: "Real-time" },
              { label: "Price Alerts", value: "Email" },
              { label: "Always", value: "Free" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl p-3"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-xs font-bold text-white">{value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          © 2026 StockSense. For educational use only.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#4f46e5,#6d28d9)" }}
            >
              <TrendingUp size={13} strokeWidth={2.5} className="text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-sm text-white">StockSense</span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
            Sign in to your account to continue
          </p>

          {/* Server error */}
          {serverError && (
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5 text-sm"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
              }}
              role="alert"
            >
              <span aria-hidden="true">⚠</span>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: errors.email
                    ? "1px solid rgba(239,68,68,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={(e) => {
                  if (!errors.email)
                    e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }}
                onBlur={(e) => {
                  if (!errors.email)
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              />
              {errors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="text-xs"
                  style={{ color: "#f87171" }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: errors.password
                      ? "1px solid rgba(239,68,68,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => {
                    if (!errors.password)
                      e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  }}
                  onBlur={(e) => {
                    if (!errors.password)
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute text-black right-3 top-1/2 -translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500 rounded"
                >
                  {showPassword
                    ? <EyeOff size={15} strokeWidth={1.5} aria-hidden="true" />
                    : <Eye size={15} strokeWidth={1.5} aria-hidden="true" />
                  }
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="text-xs"
                  style={{ color: "#f87171" }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl transition-all active:scale-95 disabled:active:scale-100 disabled:opacity-60 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 mt-2"
              style={{ background: "#4f46e5" }}
            >
              {isPending ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "rgba(255,255,255,0.4)", borderTopColor: "transparent" }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: "rgba(255,255,255,0.35)" }}>
            No account?{" "}
            <Link
              to="/register"
              className="font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500 rounded"
              style={{ color: "#818cf8" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#a5b4fc";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#818cf8";
              }}
            >
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}