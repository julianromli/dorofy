
import { Flame, ListChecks, TimerReset, Zap } from 'lucide-react';

import { GlassBadge, GlassCard } from '@/components/glass';
import type { AnalyticsSummary } from '@/features/analytics/types';

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary;
  filterLabel: string;
}

const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({ summary, filterLabel }) => {
  const cards = [
    { label: `Focus time · ${filterLabel}`, value: `${summary.focusMinutes}m`, icon: TimerReset, accent: 'default' as const },
    { label: `Sessions · ${filterLabel}`, value: `${summary.sessionsCount}`, icon: Zap, accent: 'outline' as const },
    { label: `Tasks done · ${filterLabel}`, value: `${summary.tasksCompleted}`, icon: ListChecks, accent: 'success' as const },
    { label: 'Current streak', value: `${summary.streak}d`, icon: Flame, accent: 'warning' as const },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <GlassCard key={card.label} variant={index === 0 ? 'elevated' : 'default'} className="min-h-32">
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-3 text-4xl font-bold tracking-tight text-foreground">{card.value}</p>
                </div>
                <div className="glass-floating-button flex h-11 w-11 items-center justify-center rounded-[1.15rem]">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
              </div>
              <GlassBadge variant={card.accent}>{card.label}</GlassBadge>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};

export default AnalyticsSummaryCards;
