"use client";

import { useRouter } from "next/navigation";
import {
  INK,
  KRAFT,
  KRAFT_LIGHT,
  OCHRE,
  PAPER,
  RUST,
  TEAL,
} from "@/src/lib/constants/materials";
import type { Notification } from "@/src/hooks/useNotifications";

// ---------- helpers ----------

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const mono = "'IBM Plex Mono', monospace";

// ---------- props ----------

type Props = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  isPreview: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
};

// ---------- component ----------

export function NotificationsPanel({
  notifications,
  unreadCount,
  loading,
  isPreview,
  onMarkRead,
  onMarkAllRead,
}: Props) {
  const router = useRouter();

  function handleClick(n: Notification) {
    if (!n.read) onMarkRead(n.id);

    if (n.type === "INTEREST_RECEIVED" && n.data?.listingId) {
      router.push(`/dashboard/personal`);
    }
  }

  return (
    <section
      className="rounded-md border p-6"
      style={{ borderColor: KRAFT_LIGHT, background: PAPER }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.24em]"
            style={{ color: OCHRE, fontFamily: mono }}
          >
            Notifications
          </p>
          {unreadCount > 0 ? (
            <span
              className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
              style={{ background: RUST, fontFamily: mono }}
            >
              {unreadCount}
            </span>
          ) : null}
        </div>
        {notifications.length > 0 && unreadCount > 0 ? (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-[11px] font-semibold uppercase tracking-[0.08em] underline-offset-2 hover:underline"
            style={{ color: KRAFT, fontFamily: mono }}
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {/* Body */}
      {isPreview ? (
        <p className="mt-4 text-sm leading-6" style={{ color: "#5B5B54" }}>
          Sign in to see your notifications.
        </p>
      ) : loading ? (
        <p className="mt-4 text-sm" style={{ color: "#5B5B54" }}>
          Loading...
        </p>
      ) : notifications.length === 0 ? (
        <div
          className="mt-3 rounded-sm border border-dashed p-5 text-center"
          style={{ borderColor: KRAFT_LIGHT }}
        >
          <p
            className="text-sm font-semibold uppercase tracking-[0.1em]"
            style={{ color: KRAFT, fontFamily: mono }}
          >
            All clear
          </p>
          <p className="mt-2 text-sm leading-6" style={{ color: "#5B5B54" }}>
            No notifications yet.
          </p>
        </div>
      ) : (
        <ul className="mt-3 space-y-2" role="list">
          {notifications.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => handleClick(n)}
                className="w-full rounded-sm border px-3 py-3 text-left transition hover:opacity-80"
                style={{
                  borderColor: n.read ? KRAFT_LIGHT : TEAL,
                  background: n.read ? "transparent" : "#EAF3F1",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="text-sm leading-snug"
                    style={{
                      color: INK,
                      fontWeight: n.read ? 400 : 600,
                    }}
                  >
                    {n.title}
                  </p>
                  <span
                    className="shrink-0 text-[10px]"
                    style={{ color: KRAFT, fontFamily: mono }}
                  >
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <p
                  className="mt-1 text-[12px] leading-5"
                  style={{ color: "#5B5B54" }}
                >
                  {n.body}
                </p>
                {/* Seller phone — shown on INTEREST_ACCEPTED */}
                {n.type === "INTEREST_ACCEPTED" && n.data?.sellerPhone ? (
                  <p
                    className="mt-2 text-[11px] font-semibold"
                    style={{ color: TEAL, fontFamily: mono }}
                  >
                    Seller: {n.data.sellerPhone}
                  </p>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
