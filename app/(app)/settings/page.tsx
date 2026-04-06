"use client";

import { useState, useCallback } from "react";
import {
  User,
  Bell,
  Shield,
  Trash2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccountSettings {
  username: string;
  email: string;
  bio: string;
}

interface NotificationSettings {
  matchInvites: boolean;
  tournamentUpdates: boolean;
  chatMessages: boolean;
  promotional: boolean;
}

interface PrivacySettings {
  showOnlineStatus: boolean;
  showWinRate: boolean;
  allowMatchInvites: boolean;
}

interface FormState {
  account: AccountSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
  id: string;
}

function Toggle({ checked, onChange, label, description, id }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <label
          htmlFor={id}
          className="text-sm font-medium text-[#f1f5f9] cursor-pointer select-none"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-[#64748b] mt-0.5">{description}</p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14]",
          checked ? "bg-[#a855f7]" : "bg-[#2a2a4e]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm",
            "transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#16213e] border border-[#2a2a4e] text-[#a855f7]">
          {icon}
        </span>
        <h2
          id={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}
          className="text-base font-semibold text-[#f1f5f9]"
        >
          {title}
        </h2>
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-[#2a2a4e]">{children}</div>
      </Card>
    </section>
  );
}

function SectionRow({ children }: { children: React.ReactNode }) {
  return <div className="px-4">{children}</div>;
}

function SectionPad({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-4">{children}</div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const INITIAL_STATE: FormState = {
  account: {
    username: "GhostSniper",
    email: "ghostsniper@example.com",
    bio: "Competitive gamer from Lagos 🇳🇬",
  },
  notifications: {
    matchInvites: true,
    tournamentUpdates: true,
    chatMessages: false,
    promotional: false,
  },
  privacy: {
    showOnlineStatus: true,
    showWinRate: true,
    allowMatchInvites: true,
  },
};

const BIO_MAX = 150;

export default function SettingsPage() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const setAccount = useCallback(
    (patch: Partial<AccountSettings>) =>
      setForm((prev) => ({ ...prev, account: { ...prev.account, ...patch } })),
    []
  );

  const setNotif = useCallback(
    (patch: Partial<NotificationSettings>) =>
      setForm((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, ...patch },
      })),
    []
  );

  const setPrivacy = useCallback(
    (patch: Partial<PrivacySettings>) =>
      setForm((prev) => ({ ...prev, privacy: { ...prev.privacy, ...patch } })),
    []
  );

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  }, []);

  const bioLen = form.account.bio.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Settings</h1>
        <p className="text-sm text-[#64748b] mt-1">
          Manage your account preferences
        </p>
      </div>

      {/* ── Account ──────────────────────────────────────────────── */}
      <Section icon={<User className="w-4 h-4" />} title="Account">
        <SectionPad>
          <Input
            label="Username"
            value={form.account.username}
            onChange={(e) => setAccount({ username: e.target.value })}
            placeholder="Your username"
            maxLength={32}
          />
        </SectionPad>

        <SectionPad>
          <Input
            label="Email"
            value={form.account.email}
            disabled
            hint="Contact support to change your email address."
          />
        </SectionPad>

        <SectionPad>
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#f1f5f9]">Bio</label>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  bioLen > BIO_MAX ? "text-[#ef4444]" : "text-[#64748b]"
                )}
              >
                {bioLen}/{BIO_MAX}
              </span>
            </div>
            <textarea
              value={form.account.bio}
              onChange={(e) => setAccount({ bio: e.target.value })}
              maxLength={BIO_MAX}
              rows={3}
              placeholder="Tell the arena about yourself…"
              className={cn(
                "w-full rounded-xl px-3 py-2.5 text-sm text-[#f1f5f9]",
                "bg-[#0d0d14] border border-[#2a2a4e]",
                "placeholder:text-[#64748b] resize-none",
                "outline-none transition-colors duration-150",
                "focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/30",
                "hover:border-[#3a3a6e]"
              )}
            />
          </div>
        </SectionPad>
      </Section>

      {/* ── Notifications ─────────────────────────────────────────── */}
      <Section icon={<Bell className="w-4 h-4" />} title="Notifications">
        <SectionRow>
          <Toggle
            id="notif-match"
            label="Match Invites"
            description="Get notified when someone challenges you"
            checked={form.notifications.matchInvites}
            onChange={(v) => setNotif({ matchInvites: v })}
          />
        </SectionRow>
        <SectionRow>
          <Toggle
            id="notif-tournament"
            label="Tournament Updates"
            description="Reminders and results for tournaments you joined"
            checked={form.notifications.tournamentUpdates}
            onChange={(v) => setNotif({ tournamentUpdates: v })}
          />
        </SectionRow>
        <SectionRow>
          <Toggle
            id="notif-chat"
            label="Chat Messages"
            description="Push notifications for new chat messages"
            checked={form.notifications.chatMessages}
            onChange={(v) => setNotif({ chatMessages: v })}
          />
        </SectionRow>
        <SectionRow>
          <Toggle
            id="notif-promo"
            label="Promotional"
            description="News, offers, and platform announcements"
            checked={form.notifications.promotional}
            onChange={(v) => setNotif({ promotional: v })}
          />
        </SectionRow>
      </Section>

      {/* ── Privacy ───────────────────────────────────────────────── */}
      <Section icon={<Shield className="w-4 h-4" />} title="Privacy">
        <SectionRow>
          <Toggle
            id="priv-online"
            label="Show Online Status"
            description="Let other players see when you're active"
            checked={form.privacy.showOnlineStatus}
            onChange={(v) => setPrivacy({ showOnlineStatus: v })}
          />
        </SectionRow>
        <SectionRow>
          <Toggle
            id="priv-winrate"
            label="Show Win Rate Publicly"
            description="Display your win rate on your public profile"
            checked={form.privacy.showWinRate}
            onChange={(v) => setPrivacy({ showWinRate: v })}
          />
        </SectionRow>
        <SectionRow>
          <Toggle
            id="priv-invites"
            label="Allow Match Invites from Anyone"
            description="Disable to receive invites only from friends"
            checked={form.privacy.allowMatchInvites}
            onChange={(v) => setPrivacy({ allowMatchInvites: v })}
          />
        </SectionRow>
      </Section>

      {/* ── Danger Zone ───────────────────────────────────────────── */}
      <Section icon={<AlertTriangle className="w-4 h-4" />} title="Danger Zone">
        <SectionPad>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#f1f5f9]">
                Delete Account
              </p>
              <p className="text-xs text-[#64748b] mt-0.5">
                Permanently remove your account and all associated data.{" "}
                <span className="text-[#94a3b8]">Contact support to proceed.</span>
              </p>
            </div>
            <div title="Contact support to delete your account">
              <Button variant="danger" size="sm" disabled>
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                Delete Account
              </Button>
            </div>
          </div>
        </SectionPad>
      </Section>

      {/* ── Save button ───────────────────────────────────────────── */}
      <div className="flex justify-end pb-4">
        <Button
          variant="primary"
          size="md"
          isLoading={isSaving}
          onClick={handleSave}
          className={cn(
            "min-w-32 transition-colors duration-200",
            saved && "bg-[#22c55e] border-[#22c55e] hover:bg-[#22c55e]"
          )}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" aria-hidden="true" />
              Saved!
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
