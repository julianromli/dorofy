import { Clock, Timer, Link, Unlink, MinusCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

import { GlassCard, GlassBadge } from '@/components/glass';
import type { AnalyticsRecentSession } from '@/features/analytics/types';

interface AnalyticsRecentSessionsProps {
  sessions: AnalyticsRecentSession[];
}

const AnalyticsRecentSessions: React.FC<AnalyticsRecentSessionsProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return (
      <GlassCard variant="dense" className="flex min-h-[300px] flex-1 items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">No recent sessions found.</p>
      </GlassCard>
    );
  }

  return (
    <div className="flex h-[300px] w-full flex-col gap-3 overflow-y-auto pr-2">
      {sessions.map((session) => {
        const endTime = new Date(session.completedAt);
        const startTime = new Date(session.completedAt - session.durationSeconds * 1000);
        
        let badgeVariant: 'outline' | 'default' | 'danger' = 'outline';
        if (session.taskLinkStatus === 'linked') badgeVariant = 'default';
        if (session.taskLinkStatus === 'orphaned') badgeVariant = 'danger';

        return (
          <GlassCard key={session.id} variant="dense" className="shrink-0 rounded-[1.4rem]">
            <div className="flex items-start gap-3">
              <div className="glass-floating-button mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem]">
                <Timer className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground">
                    {session.durationMinutes}m Session
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(session.completedAt, { addSuffix: true })}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <GlassBadge variant={badgeVariant} className="truncate max-w-[200px] flex items-center gap-1.5">
                    {session.taskLinkStatus === 'linked' && <Link className="h-3 w-3" />}
                    {session.taskLinkStatus === 'none' && <MinusCircle className="h-3 w-3" />}
                    {session.taskLinkStatus === 'orphaned' && <Unlink className="h-3 w-3" />}
                    <span className="truncate">{session.taskTitle}</span>
                  </GlassBadge>
                </div>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};

export default AnalyticsRecentSessions;
