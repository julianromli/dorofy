import React, { useState } from 'react';
import { Coffee } from 'lucide-react';

import { GlassButton, GlassDialog } from '@/components/glass';

const DonationButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="glass-floating-button fixed bottom-4 left-4 z-[10000] flex h-12 w-12 translate-y-[-120px] items-center justify-center rounded-full"
        aria-label="Support the author"
      >
        <Coffee className="h-5 w-5 text-foreground" />
      </button>

      <GlassDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Support the author"
        description="If Dorofy helps your daily focus rhythm, you can support ongoing maintenance and design work."
        footer={
          <div className="flex w-full flex-wrap justify-end gap-2">
            <GlassButton onClick={() => setIsOpen(false)} variant="ghost">
              Cancel
            </GlassButton>
            <GlassButton
              onClick={() => {
                window.open('https://saweria.co/faizintifada', '_blank');
                setIsOpen(false);
              }}
              variant="hero"
              icon={Coffee}
            >
              Buy me a coffee
            </GlassButton>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Your support helps keep Dorofy polished, maintained, and improving over time.
        </p>
      </GlassDialog>
    </>
  );
};

export default DonationButton;
