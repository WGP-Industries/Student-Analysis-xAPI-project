import { useState } from "react";
import toast from "react-hot-toast";
import api from "../configs/api";

const Label = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="text-[0.72rem] font-medium tracking-[0.09em] uppercase text-[#7b8399]"
  >
    {children}
  </label>
);

const ChangePassword = ({ onClose }) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputCls = (name) =>
    `w-full bg-white/3 border rounded-lg px-4 py-3 text-sm text-[#e8eaf0] outline-none transition-all duration-200 placeholder:text-[#7b8399] ${
      focused === name
        ? "border-gold shadow-[0_0_0_3px_var(--gold-dim)]"
        : "border-white/8 hover:border-white/[0.14]"
    }`;

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await api.patch("/api/user/me/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password updated");
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 shadow-xl"
        style={{ animation: "fadeUp 0.2s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[0.65rem] font-medium tracking-[0.12em] uppercase text-[#7b8399]">
              Account
            </p>
            <h3 className="text-base font-display text-[#e8eaf0]">Change Password</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#7b8399] hover:text-[#e8eaf0] transition-colors mt-0.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              onFocus={() => setFocused("currentPassword")}
              onBlur={() => setFocused(null)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className={inputCls("currentPassword")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              onFocus={() => setFocused("newPassword")}
              onBlur={() => setFocused(null)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className={inputCls("newPassword")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              onFocus={() => setFocused("confirmPassword")}
              onBlur={() => setFocused(null)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className={inputCls("confirmPassword")}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gold text-navy text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-[#d4b05a] transition-all duration-200"
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-navy/25 border-t-navy rounded-full animate-spin" />
              )}
              {loading ? "Updating…" : "Update Password"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-[#7b8399] border border-white/8 rounded-lg hover:text-[#e8eaf0] transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
