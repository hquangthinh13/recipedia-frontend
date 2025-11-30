import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Loader2, ThumbsUp, MessageCircle } from 'lucide-react';

export default function AnalyticsCard({ className, type }) {
  const { user } = useAuth();
  const [value, setValue] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const res = await api.get(`/users/${user.id}/interactions-summary`);
      const rows = res.data?.data ?? [];

      let total = 0;

      if (type === 'like') {
        total = rows.reduce((acc, r) => acc + (r.likes || 0), 0);
      }

      if (type === 'comment') {
        total = rows.reduce((acc, r) => acc + (r.comments || 0), 0);
      }

      setValue(total);
    } catch (err) {
      console.error('Error fetching interactions summary:', err);
    } finally {
      setLoading(false);
    }
  }, [user, type]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const label = type === 'like' ? 'Total likes' : 'Total comments';

  const Icon = type === 'like' ? ThumbsUp : MessageCircle;

  return (
    <Card className={`flex flex-col flex-1 h-fit ${className ?? ''}`}>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin w-5 h-5" />
            <span className="text-sm text-muted-foreground">Loading…</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Icon + label */} <div className="text-sm text-muted-foreground">{label}</div>
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2 bg-primary/10">
                <Icon className="text-primary" />
              </div>{' '}
              <div className="text-3xl font-bold leading-tight">{value}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
