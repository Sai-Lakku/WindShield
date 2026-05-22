import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, AlertCircle, BarChart3, Target } from "lucide-react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
  type NotificationRow,
  type NotificationType,
} from "@/lib/notifications";

function formatTimeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 45) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function TypeIcon({ type }: { type: NotificationType }) {
  if (type === "urgent") return <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />;
  if (type === "plan") return <BarChart3 className="h-4 w-4 text-amber-400 shrink-0" />;
  return <Target className="h-4 w-4 text-emerald-400 shrink-0" />;
}

export function NotificationBell() {
  const [, navigate] = useLocation();
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [filter, setFilter] = useState<"all" | NotificationType>("all");
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const rows = await getNotifications(userId);
    setItems(rows);
  }, [userId]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setUserId(data.user?.id ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    void refresh();
  }, [userId, refresh]);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) return;
    const supabase = getSupabase();
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((n) => n.type === filter);
  }, [items, filter]);

  const unreadCount = useMemo(() => items.filter((n) => !n.is_read).length, [items]);

  if (!isSupabaseConfigured() || !userId) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 border border-white/10">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-h-[18px] min-w-[18px] rounded-full bg-red-500 px-1 text-[10px] font-bold leading-[18px] text-white text-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0 border-white/10 bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
          <p className="text-sm font-semibold text-white">Notifications</p>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={async () => {
              await markAllAsRead(userId);
              await refresh();
            }}
          >
            Mark all read
          </Button>
        </div>
        <div className="px-3 pt-2">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="grid w-full grid-cols-4 h-9">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="urgent" className="text-xs">
                Urgent
              </TabsTrigger>
              <TabsTrigger value="plan" className="text-xs">
                Plan
              </TabsTrigger>
              <TabsTrigger value="goals" className="text-xs">
                Goals
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <ScrollArea className="h-[320px]">
          <div className="flex flex-col gap-1 p-2">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground px-2 py-6 text-center">No notifications yet.</p>
            )}
            {filtered.map((n) => (
              <button
                key={n.id}
                type="button"
                className={cn(
                  "flex w-full gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-white/5",
                  !n.is_read && "bg-primary/5",
                )}
                onClick={async () => {
                  if (!n.is_read) {
                    await markAsRead(n.id);
                    await refresh();
                  }
                  if (n.action_url) {
                    setOpen(false);
                    navigate(n.action_url);
                  }
                }}
              >
                <TypeIcon type={n.type} />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start gap-2">
                    <p className="text-sm font-medium text-white leading-snug">{n.title}</p>
                    {!n.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-400" aria-hidden />}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground/80">{formatTimeAgo(n.created_at)}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
