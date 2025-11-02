import React, { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "../lib/formatDate";
export function NotificationPopover() {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const unreadCount = notifications.filter((n) => n.isRead === false).length;

  // 1) Fetch notifications when user or token changes
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !token) return;
      try {
        setLoading(true);
        const { data } = await api.get("users/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(data || []);
        console.log("Fetched notifications:", data);
      } catch (e) {
        console.error("Failed to fetch notifications:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, token]);

  // 2) Mark all as read when the popover opens
  const markAllRead = useCallback(async () => {
    if (!token || marking || unreadCount === 0) return;
    try {
      setMarking(true);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await api.patch(
        "users/notifications/mark-all-read",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      //
      const { data } = await api.get("users/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(data || []);
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    } finally {
      setMarking(false);
    }
  }, [token, marking, unreadCount]);

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (nextOpen) {
      void markAllRead();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer relative">
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-2 text-sm font-semibold">
          Notifications
        </div>

        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="max-h-64 divide-y overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`flex flex-row gap-2 items-center cursor-pointer p-3 text-sm hover:bg-secondary ${
                  n.isRead ? "text-muted-foreground" : "bg-secondary"
                }`}
              >
                <Avatar className="h-8 w-8 align-middle">
                  <AvatarImage src={n.sender?.avatar || ""} />
                </Avatar>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col">
                    <span className="">
                      <span className="text-foreground font-medium">
                        {n.sender?.name || "Someone"}{" "}
                      </span>{" "}
                      {n.type === "like"
                        ? "liked your recipe"
                        : n.type === "comment"
                        ? "commented:"
                        : n.type === "follow"
                        ? "started following you."
                        : ""}
                    </span>
                    {n.type === "like" && n.recipe?.title && (
                      <span className="block italic text-xs text-muted-foreground">
                        {n.recipe.title}
                      </span>
                    )}
                    {n.type === "comment" && n.commentText && (
                      <span className="block italic text-xs text-muted-foreground">
                        {n.commentText}
                      </span>
                    )}
                  </div>
                  <span className="block text-xs text-muted-foreground">
                    {formatDate(new Date(n.createdAt))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
