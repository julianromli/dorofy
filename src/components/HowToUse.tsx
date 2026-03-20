import React from 'react';

import { GlassBadge, GlassDialog } from '@/components/glass';

interface HowToUseProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToUse: React.FC<HowToUseProps> = ({ isOpen, onClose }) => (
  <GlassDialog
    open={isOpen}
    onOpenChange={(open) => {
      if (!open) onClose();
    }}
    title="How to use Dorofy"
    description="A calm Pomodoro flow for focused work, intentional breaks, and lightweight task tracking."
    size="lg"
  >
    <div className="space-y-6 text-sm text-muted-foreground">
      <section className="space-y-3">
        <GlassBadge variant="outline">Pomodoro flow</GlassBadge>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Choose one task to focus on.</li>
          <li>Start a 25 or 50 minute focus block.</li>
          <li>Stay on that task until the timer ends.</li>
          <li>Take a short break after each session.</li>
          <li>Use the long break after several completed focus rounds.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <GlassBadge variant="outline">Timer modes</GlassBadge>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Focus:</strong> your main work session.</li>
          <li><strong>Short Break:</strong> a quick reset between sessions.</li>
          <li><strong>Long Break:</strong> recovery time after sustained focus.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <GlassBadge variant="outline">Task handling</GlassBadge>
        <ul className="list-disc space-y-2 pl-5">
          <li>Add a task with an estimated number of pomodoros.</li>
          <li>Click a task to make it active for the current session.</li>
          <li>Drag unfinished tasks to reorder priority.</li>
          <li>Mark completed items to move them into the finished list.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <GlassBadge variant="outline">Best results</GlassBadge>
        <ul className="list-disc space-y-2 pl-5">
          <li>Break large work into smaller, finishable tasks.</li>
          <li>Use breaks to step away from the task, not switch context.</li>
          <li>Keep the active task visible so each session has one clear target.</li>
        </ul>
      </section>
    </div>
  </GlassDialog>
);

export default HowToUse;
