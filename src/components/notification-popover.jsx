import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/formatDate';
import Spinner from '@/components/spinner';

const PAGE_SIZE = 5;

export function NotificationPopover() {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [marking, setMarking] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const scrollContainerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.isRead === false).length;

  const fetchNotifications = useCallback(
    async ({ append = false } = {}) => {
      if (!user || !token) return;
      try {
        if (append) setIsLoadingMore(true);
        else setLoading(true);

        const qs = new URLSearchParams();
        qs.set('limit', String(PAGE_SIZE));
        qs.set('page', String(page));

        const { data } = await api.get(`/users/notifications?${qs.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const batch = data || [];
        setHasMore(batch.length === PAGE_SIZE);

        if (append) {
          setNotifications((prev) => [...prev, ...batch]);
        } else {
          setNotifications(batch);
        }

        console.log('Fetched notifications page', page, batch);
      } catch (e) {
        console.error('Failed to fetch notifications:', e);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [user, token, page],
  );

  // Reset pagination when user/token changes
  useEffect(() => {
    if (!user || !token) return;
    setPage(1);
    setHasMore(true);
    setNotifications([]);
  }, [user, token]);

  // Fetch whenever page changes (like HomePage recipes)
  useEffect(() => {
    if (!user || !token) return;
    fetchNotifications({ append: page > 1 });
  }, [user, token, page, fetchNotifications]);

  // Infinite scroll inside the popover scroll container
  useEffect(() => {
    if (!open) return;
    if (!scrollContainerRef.current || !loadMoreRef.current) return;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoadingMore && !loading && hasMore) {
          setPage((p) => p + 1);
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '0px',
        threshold: 0.1,
      },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [open, hasMore, isLoadingMore, loading]);

  // Mark all as read when the popover opens (same behavior as before)
  const markAllRead = useCallback(async () => {
    if (!token || marking || unreadCount === 0) return;
    try {
      setMarking(true);
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      await api.patch(
        'users/notifications/mark-all-read',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (e) {
      console.error('Failed to mark all as read:', e);
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
        <div className="border-b px-4 py-2 text-sm font-semibold">Notifications</div>

        {loading && page === 1 ? (
          <div className="flex items-center justify-center py-4">
            <Spinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          <div ref={scrollContainerRef} className="max-h-64 divide-y overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`flex flex-row gap-2 items-center p-3 text-sm hover:bg-secondary ${
                  n.isRead ? 'text-muted-foreground' : 'bg-secondary'
                }`}
              >
                <Avatar className="h-8 w-8 align-middle">
                  <AvatarImage
                    src={
                      n.sender?.avatar ||
                      'https://api.dicebear.com/9.x/micah/svg?randomizeIds=false&flip=true&baseColor=FFE6CC&backgroundColor=c0aede&hair=mrClean&hairColor=f4d150&eyes=eyesShadow&mouth=nervous&shirt=collared&shirtColor=ffeba4&eyebrows=up&eyebrowsColor=000000&eyeShadowColor=ffeba4&nose=curve&facialHairProbability=0&glassesProbability=0'
                    }
                  />
                </Avatar>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col">
                    <span>
                      <span className="text-foreground font-medium">
                        {n.sender?.name || 'Mysterious Chef'}{' '}
                      </span>
                      {n.type === 'like'
                        ? 'liked your recipe'
                        : n.type === 'comment'
                          ? 'commented:'
                          : n.type === 'follow'
                            ? 'started following you.'
                            : ''}
                    </span>
                    {n.type === 'like' && n.recipe?.title && (
                      <span className="block italic text-xs text-muted-foreground">
                        {n.recipe.title}
                      </span>
                    )}
                    {n.type === 'comment' && n.commentText && (
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

            {/* Sentinel for infinite scroll */}
            <div ref={loadMoreRef} className="h-3" />

            {isLoadingMore && (
              <div className="flex items-center justify-center py-2">
                <Spinner />
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
