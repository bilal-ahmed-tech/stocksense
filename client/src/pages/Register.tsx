import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { useRegister } from "@/hooks/useRegister";
import axios from "axios";

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair", color: "#f59e0b" };
  if (score <= 3) return { score, label: "Good", color: "#10b981" };
  return { score, label: "Strong", color: "#10b981" };
}

export default function Register() {
  const navigate = useNavigate();
  const { mutate: register, isPending } = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState("");

  const strength = getPasswordStrength(password);

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Name is required";
    else if (name.trim().length < 2)
      e.name = "Name must be at least 2 characters";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (!confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError("");
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setErrors({});
    register(
      { name, email, password },
      {
        onSuccess: () => navigate("/dashboard"),
        onError: (err) => {
          setServerError(
            axios.isAxiosError(err)
              ? ((err.response?.data as { error: string })?.error ??
                  "Registration failed")
              : "Something went wrong",
          );
        },
      },
    );
  }

  return (
    <div
      className="min-h-screen flex relative"
      style={{ background: "#09090b" }}>
      {/* Left panel */}
      <title>Get Started — StockSense</title>

      <div
        className="hidden lg:flex flex-col justify-between p-10 w-105 shrink-0"
        style={{
          background: "#0c0c0f",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#4f46e5,#6d28d9)",
              boxShadow: "0 0 20px rgba(79,70,229,0.3)",
            }}>
            <TrendingUp
              size={15}
              strokeWidth={2.5}
              className="text-white"
              aria-hidden="true"
            />
          </div>
          <span className="font-bold text-[15px] text-white tracking-tight">
            StockSense
          </span>
        </div>

        <div className="space-y-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.12)" }}>
            <TrendingUp
              size={22}
              strokeWidth={1.5}
              style={{ color: "#818cf8" }}
              aria-hidden="true"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
              Start trading in seconds
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              Create your free account and get instant access to $100,000 in
              virtual funds to practice trading with real market data.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              "Live stock prices and charts",
              "Virtual trading with $100,000",
              "Price alerts via email",
              "Portfolio analytics and P&L",
              "Completely free — no card needed",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(16,185,129,0.15)",
                    color: "#10b981",
                  }}>
                  <Check size={11} strokeWidth={2.5} aria-hidden="true" />
                </div>
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.5)" }}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          © 2026 StockSense. For educational use only.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#4f46e5,#6d28d9)" }}>
              <TrendingUp
                size={13}
                strokeWidth={2.5}
                className="text-white"
                aria-hidden="true"
              />
            </div>
            <span className="font-bold text-sm text-white">StockSense</span>
          </div>
          <Link
            to="/"
            className="mb-4 flex items-center gap-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-lg"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color =
                "rgba(255,255,255,0.4)";
            }}>
            <ArrowLeft size={15} strokeWidth={1.5} aria-hidden="true" />
            Back to home
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Create your account
          </h1>
          <p
            className="text-sm mb-8"
            style={{ color: "rgba(255,255,255,0.4)" }}>
            Get started with $100,000 in virtual funds
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
              role="alert">
              <span aria-hidden="true">⚠</span>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.5)" }}>
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name)
                    setErrors((p) => ({ ...p, name: undefined }));
                }}
                autoComplete="name"
                placeholder="Bilal Ahmed"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                className="px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: errors.name
                    ? "1px solid rgba(239,68,68,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={(e) => {
                  if (!errors.name)
                    e.currentTarget.style.border =
                      "1px solid rgba(99,102,241,0.5)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }}
                onBlur={(e) => {
                  if (!errors.name)
                    e.currentTarget.style.border =
                      "1px solid rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              />
              {errors.name && (
                <p
                  id="name-error"
                  role="alert"
                  className="text-xs"
                  style={{ color: "#f87171" }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reg-email"
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.5)" }}>
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((p) => ({ ...p, email: undefined }));
                }}
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "reg-email-error" : undefined}
                className="px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: errors.email
                    ? "1px solid rgba(239,68,68,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={(e) => {
                  if (!errors.email)
                    e.currentTarget.style.border =
                      "1px solid rgba(99,102,241,0.5)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }}
                onBlur={(e) => {
                  if (!errors.email)
                    e.currentTarget.style.border =
                      "1px solid rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              />
              {errors.email && (
                <p
                  id="reg-email-error"
                  role="alert"
                  className="text-xs"
                  style={{ color: "#f87171" }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reg-password"
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.5)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  aria-invalid={!!errors.password}
                  aria-describedby="password-strength"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: errors.password
                      ? "1px solid rgba(239,68,68,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => {
                    if (!errors.password)
                      e.currentTarget.style.border =
                        "1px solid rgba(99,102,241,0.5)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  }}
                  onBlur={(e) => {
                    if (!errors.password)
                      e.currentTarget.style.border =
                        "1px solid rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-1 text-gray-200 focus-visible:outline-indigo-500 rounded">
                  {showPassword ? (
                    <EyeOff size={15} strokeWidth={1.5} aria-hidden="true" />
                  ) : (
                    <Eye size={15} strokeWidth={1.5} aria-hidden="true" />
                  )}
                </button>
              </div>

              {/* Password strength */}
              {password && (
                <div id="password-strength" aria-live="polite">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background:
                            i <= strength.score
                              ? strength.color
                              : "rgba(255,255,255,0.08)",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strength.color }}>
                    {strength.label} password
                  </p>
                </div>
              )}

              {errors.password && (
                <p
                  role="alert"
                  className="text-xs"
                  style={{ color: "#f87171" }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirm-password"
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.5)" }}>
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((p) => ({ ...p, confirmPassword: undefined }));
                  }}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={
                    errors.confirmPassword ? "confirm-error" : undefined
                  }
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: errors.confirmPassword
                      ? "1px solid rgba(239,68,68,0.5)"
                      : confirmPassword && confirmPassword === password
                        ? "1px solid rgba(16,185,129,0.4)"
                        : "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => {
                    if (
                      !errors.confirmPassword &&
                      !(confirmPassword && confirmPassword === password)
                    )
                      e.currentTarget.style.border =
                        "1px solid rgba(99,102,241,0.5)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  }}
                  onBlur={(e) => {
                    if (!errors.confirmPassword)
                      e.currentTarget.style.border =
                        confirmPassword && confirmPassword === password
                          ? "1px solid rgba(16,185,129,0.4)"
                          : "1px solid rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500 rounded"
                  style={{ color: "rgba(255,255,255,0.3)" }}>
                  {showConfirm ? (
                    <EyeOff size={15} strokeWidth={1.5} aria-hidden="true" />
                  ) : (
                    <Eye size={15} strokeWidth={1.5} aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p
                  id="confirm-error"
                  role="alert"
                  className="text-xs"
                  style={{ color: "#f87171" }}>
                  {errors.confirmPassword}
                </p>
              )}
              {confirmPassword &&
                confirmPassword === password &&
                !errors.confirmPassword && (
                  <p
                    className="text-xs flex items-center gap-1"
                    style={{ color: "#10b981" }}>
                    <Check size={11} strokeWidth={2.5} aria-hidden="true" />
                    Passwords match
                  </p>
                )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl transition-all active:scale-95 disabled:active:scale-100 disabled:opacity-60 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 mt-2"
              style={{ background: "#4f46e5" }}>
              {isPending ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{
                      borderColor: "rgba(255,255,255,0.4)",
                      borderTopColor: "transparent",
                    }}
                  />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p
            className="text-sm text-center mt-6"
            style={{ color: "rgba(255,255,255,0.35)" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500 rounded"
              style={{ color: "#818cf8" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#a5b4fc";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#818cf8";
              }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
