import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  Lock,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Upload,
  Shield,
} from "lucide-react";
import { api } from "@/lib/axios";
import { updateUser, clearCredentials } from "@/features/auth/authSlice";
import { queryClient } from "@/lib/queryClient";
import { disconnectSocket } from "@/lib/socket";
import { useNavigate } from "react-router-dom";
import AvatarUploadModal from "@/components/ui/AvatarUploadModal";
import { formatUSD } from "@/lib/formatters";
import type { RootState, AppDispatch } from "@/app/store";

export default function Settings() {
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dangerLoading, setDangerLoading] = useState(false);

  async function handleNameUpdate() {
    setNameError("");
    setNameSuccess(false);
    if (!name.trim() || name.trim() === user?.name) return;
    setNameLoading(true);
    try {
      const res = await api.patch<{ data: { name: string } }>("/auth/me", {
        name: name.trim(),
      });
      dispatch(updateUser({ name: res.data.data.name }));
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch {
      setNameError("Failed to update name");
    } finally {
      setNameLoading(false);
    }
  }

  async function handlePasswordChange() {
    setPasswordError("");
    setPasswordSuccess(false);
    if (!currentPassword || !newPassword || !confirmPassword)
      return setPasswordError("All fields are required");
    if (newPassword.length < 8)
      return setPasswordError("New password must be at least 8 characters");
    if (newPassword !== confirmPassword)
      return setPasswordError("Passwords do not match");
    setPasswordLoading(true);
    try {
      await api.patch("/auth/me/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleResetBalance() {
    setDangerLoading(true);
    try {
      await api.post("/auth/me/reset-balance");
      dispatch(updateUser({ virtualBalance: 100000 }));
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setShowResetConfirm(false);
    } catch {
      // silent
    } finally {
      setDangerLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDangerLoading(true);
    try {
      await api.delete("/auth/me");
      dispatch(clearCredentials());
      queryClient.clear();
      disconnectSocket();
      navigate("/");
    } catch {
      // silent
    } finally {
      setDangerLoading(false);
    }
  }

  return (
    <main className="space-y-5 max-w-4xl lg:mx-auto">
      <title>Settings — StockSense</title>

      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          Manage your account preferences
        </p>
      </header>

      {/* Profile card */}
      <section
        aria-label="Profile settings"
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#0e0e10",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          className="px-5 py-4 flex items-center gap-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
          >
            <User size={14} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h2 className="text-sm font-semibold text-white">Profile</h2>
        </div>

        <div className="p-5 space-y-5">
          {/* Avatar row */}
          <AvatarUpload />

          {/* Name field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="settings-name"
              className="text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Display Name
            </label>
            <div className="flex gap-2">
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(99,102,241,0.5)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              />
              <button
                onClick={handleNameUpdate}
                disabled={nameLoading || name.trim() === user?.name}
                className="px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                style={{ background: "#4f46e5" }}
              >
                {nameLoading ? "Saving..." : "Save"}
              </button>
            </div>
            {nameSuccess && (
              <p className="text-xs" style={{ color: "#10b981" }}>
                Name updated successfully
              </p>
            )}
            {nameError && (
              <p role="alert" className="text-xs" style={{ color: "#f87171" }}>
                {nameError}
              </p>
            )}
          </div>

          {/* Email (read only) */}
          <div className="flex flex-col gap-1.5">
            <span
              className="text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Email
            </span>
            <div
              className="px-4 py-2.5 rounded-xl text-sm font-mono"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {user?.email}
            </div>
          </div>

          {/* Virtual balance (read only) */}
          <div className="flex flex-col gap-1.5">
            <span
              className="text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Virtual Balance
            </span>
            <div
              className="px-4 py-2.5 rounded-xl text-sm font-mono font-semibold"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#a5b4fc",
              }}
            >
              {formatUSD(user?.virtualBalance ?? 0)}
            </div>
          </div>
        </div>
      </section>

      {/* Password card */}
      <section
        aria-label="Change password"
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#0e0e10",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          className="px-5 py-4 flex items-center gap-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
          >
            <Lock size={14} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h2 className="text-sm font-semibold text-white">Change Password</h2>
        </div>

        <div className="p-5 space-y-3">
          {[
            {
              id: "current-password",
              label: "Current Password",
              value: currentPassword,
              onChange: setCurrentPassword,
              autoComplete: "current-password",
            },
            {
              id: "new-password",
              label: "New Password",
              value: newPassword,
              onChange: setNewPassword,
              autoComplete: "new-password",
            },
            {
              id: "confirm-password",
              label: "Confirm New Password",
              value: confirmPassword,
              onChange: setConfirmPassword,
              autoComplete: "new-password",
            },
          ].map(({ id, label, value, onChange, autoComplete }) => (
            <div key={id} className="flex flex-col gap-1.5">
              <label
                htmlFor={id}
                className="text-xs font-medium"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {label}
              </label>
              <input
                id={id}
                type="password"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete={autoComplete}
                className="px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(99,102,241,0.5)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              />
            </div>
          ))}

          {passwordError && (
            <p role="alert" className="text-xs" style={{ color: "#f87171" }}>
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p className="text-xs" style={{ color: "#10b981" }}>
              Password changed successfully
            </p>
          )}

          <button
            onClick={handlePasswordChange}
            disabled={passwordLoading}
            className="mt-1 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            style={{ background: "#4f46e5" }}
          >
            {passwordLoading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </section>

      {/* Security info */}
      <section
        aria-label="Security information"
        className="rounded-2xl p-5 flex items-start gap-3"
        style={{
          background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.15)",
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
        >
          <Shield size={14} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white mb-1">
            Your session is secure
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            Access tokens expire every 15 minutes and are stored in memory only.
            Refresh tokens are stored in httpOnly cookies and cannot be accessed
            by JavaScript.
          </p>
        </div>
      </section>

      {/* Danger zone */}
      <section
        aria-label="Danger zone"
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#0e0e10",
          border: "1px solid rgba(239,68,68,0.2)",
        }}
      >
        <div
          className="px-5 py-4 flex items-center gap-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
          >
            <AlertTriangle size={14} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h2 className="text-sm font-semibold" style={{ color: "#f87171" }}>
            Danger Zone
          </h2>
        </div>

        <div className="p-5 space-y-0">
          {/* Reset balance */}
          <div
            className="flex items-center justify-between py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div>
              <p className="text-sm font-semibold text-white">
                Reset Virtual Balance
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Resets to $100,000 and clears all holdings and transactions
              </p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ml-4 shrink-0"
              style={{
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.color = "#f87171";
                el.style.border = "1px solid rgba(239,68,68,0.3)";
                el.style.background = "rgba(239,68,68,0.06)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.color = "rgba(255,255,255,0.5)";
                el.style.border = "1px solid rgba(255,255,255,0.1)";
                el.style.background = "transparent";
              }}
            >
              <RefreshCw size={12} strokeWidth={2} aria-hidden="true" />
              Reset
            </button>
          </div>

          {/* Delete account */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-semibold text-white">Delete Account</p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Permanently delete your account and all associated data
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ml-4 shrink-0"
              style={{
                color: "#f87171",
                border: "1px solid rgba(239,68,68,0.25)",
                background: "rgba(239,68,68,0.06)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "rgba(239,68,68,0.15)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "rgba(239,68,68,0.06)";
              }}
            >
              <Trash2 size={12} strokeWidth={2} aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
      </section>

      {/* Confirm modals */}
      {showResetConfirm && (
        <ConfirmModal
          title="Reset Virtual Balance?"
          message="This will reset your balance to $100,000 and permanently remove all holdings and transactions. This cannot be undone."
          confirmLabel="Reset Balance"
          onConfirm={handleResetBalance}
          onCancel={() => setShowResetConfirm(false)}
          loading={dangerLoading}
        />
      )}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Account?"
          message="This will permanently delete your account and all associated data. You will not be able to recover it. This cannot be undone."
          confirmLabel="Delete Account"
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={dangerLoading}
        />
      )}
    </main>
  );
}

// ─── Avatar Upload ─────────────────────────────────────────────────────────────

function AvatarUpload() {
  const user = useSelector((s: RootState) => s.auth.user);
  const [showModal, setShowModal] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowModal(true)}
          aria-label="Update avatar"
          className="relative group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-full"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden transition-all"
            style={{
              border: "2px solid rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.border =
                "2px solid rgba(99,102,241,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.border =
                "2px solid rgba(255,255,255,0.08)";
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name ?? "Avatar"}
                className="w-16 h-16 object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-lg font-bold"
                style={{
                  background:
                    "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)",
                  color: "#fff",
                }}
              >
                {initials}
              </div>
            )}
          </div>
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <Upload
              size={16}
              strokeWidth={1.5}
              className="text-white"
              aria-hidden="true"
            />
          </div>
        </button>

        <div>
          <p className="text-sm font-semibold text-white">{user?.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {user?.email}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs mt-1.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500 rounded"
            style={{ color: "#818cf8" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#a5b4fc";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#818cf8";
            }}
          >
            Change photo
          </button>
        </div>
      </div>

      {showModal && (
        <AvatarUploadModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

// ─── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        aria-hidden="true"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-sm rounded-2xl p-6 space-y-4"
          style={{
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
            >
              <AlertTriangle size={18} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-white">{title}</h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            {message}
          </p>
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
              style={{
                color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-all active:scale-95 disabled:active:scale-100 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 hover:opacity-90"
              style={{ background: "#dc2626" }}
            >
              {loading ? "Processing..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}