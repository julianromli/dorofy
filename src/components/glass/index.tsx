import * as SheetPrimitive from '@radix-ui/react-dialog';
import { BadgeGlass, ButtonGlass as VendorButtonGlass, GlassCard as VendorGlassCard, InputGlass as VendorInputGlass, ModalGlass, ProgressGlass as VendorProgressGlass, TabsGlass as VendorTabsGlass } from '@yhooi2/shadcn-glass-ui/components';
import LiquidGlass from '@nkzw/liquid-glass';
import { LucideIcon, X } from 'lucide-react';
import React, { forwardRef, useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';

import { useBrowserCapabilities } from '@/lib/browser-capabilities';
import { cn } from '@/lib/utils';

type SurfaceVariant = 'default' | 'elevated' | 'hero' | 'danger' | 'active' | 'dense';
type ActionVariant = SurfaceVariant | 'ghost';

const buttonVariantMap: Record<ActionVariant, 'primary' | 'secondary' | 'ghost' | 'destructive'> = {
  default: 'secondary',
  elevated: 'secondary',
  hero: 'primary',
  danger: 'destructive',
  active: 'primary',
  dense: 'secondary',
  ghost: 'ghost',
};

const surfaceClassMap: Record<SurfaceVariant, string> = {
  default: 'glass-panel',
  elevated: 'glass-panel glass-panel-elevated',
  hero: 'glass-panel glass-panel-elevated glass-panel-hero',
  danger: 'glass-panel glass-panel-danger',
  active: 'glass-panel glass-panel-active',
  dense: 'glass-panel glass-panel-dense',
};

export interface GlassButtonProps extends Omit<ComponentPropsWithoutRef<typeof VendorButtonGlass>, 'variant' | 'icon'> {
  variant?: ActionVariant;
  icon?: LucideIcon;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'default', size = 'md', icon, children, ...props }, ref) => (
    <VendorButtonGlass
      ref={ref}
      variant="ghost"
      size={size}
      icon={icon}
      className={cn(
        'transition-all duration-300 flex items-center justify-center font-medium',
        variant !== 'dense' && 'min-h-11 rounded-[1.25rem]',
        (variant === 'hero' || variant === 'active') && 'border glass-mode-accent text-white hover:opacity-90',
        variant === 'danger' && 'border glass-panel-danger text-destructive-foreground hover:opacity-90',
        variant === 'default' && 'border glass-fallback text-foreground hover:bg-white/10',
        variant === 'elevated' && 'border glass-panel-elevated text-foreground hover:bg-white/10',
        variant === 'ghost' && 'bg-transparent border-transparent shadow-none hover:bg-white/10',
        variant === 'dense' && 'min-h-9 px-3 rounded-full text-xs border glass-fallback text-foreground hover:bg-white/10',
        className,
      )}
      style={{
        boxShadow: variant === 'ghost' ? undefined :
          variant === 'hero' || variant === 'active' || variant === 'danger' ? 'var(--glow-primary), var(--glass-stroke)' :
          variant === 'elevated' ? 'var(--glass-shadow-strong), var(--glass-stroke)' :
          'var(--glass-shadow), var(--glass-stroke)'
      }}
      {...props}
    >
      {children}
    </VendorButtonGlass>
  ),
);
GlassButton.displayName = 'GlassButton';

export interface GlassCardProps extends Omit<ComponentPropsWithoutRef<typeof VendorGlassCard>, 'padding'> {
  variant?: SurfaceVariant;
  padding?: 'none' | 'compact' | 'default' | 'featured';
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', padding = 'default', children, ...props }, ref) => (
    <VendorGlassCard
      ref={ref}
      intensity={variant === 'dense' ? 'subtle' : variant === 'hero' ? 'strong' : 'medium'}
      padding={padding}
      className={cn(surfaceClassMap[variant], 'rounded-[1.75rem]', className)}
      {...props}
    >
      {children}
    </VendorGlassCard>
  ),
);
GlassCard.displayName = 'GlassCard';

export interface LiquidGlassSurfaceProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  variant?: SurfaceVariant;
  mouseContainer?: React.RefObject<HTMLElement | null>;
  padding?: string;
}

export function LiquidGlassSurface({
  children,
  className,
  innerClassName,
  variant = 'hero',
  mouseContainer,
  padding = '24px',
}: LiquidGlassSurfaceProps) {
  const capabilities = useBrowserCapabilities();
  const shellRef = useRef<HTMLDivElement>(null);
  const effectiveMouseContainer = mouseContainer ?? shellRef;

  if (!capabilities.supportsDisplacementGlass || capabilities.prefersReducedMotion || capabilities.prefersReducedTransparency) {
    return (
      <GlassCard className={cn(surfaceClassMap[variant], 'liquid-glass-shell glass-fallback', className)} variant={variant}>
        <div className={innerClassName}>{children}</div>
      </GlassCard>
    );
  }

  return (
    <div ref={shellRef} className={cn('liquid-glass-shell', className)}>
      <div aria-hidden="true" className="liquid-glass-backdrop">
        <LiquidGlass
          aberrationIntensity={1.8}
          blurAmount={0.12}
          borderRadius={36}
          displacementScale={84}
          elasticity={0.16}
          mode="prominent"
          mouseContainer={effectiveMouseContainer}
          padding="0px"
          saturation={136}
          className="liquid-glass-backdrop-frame"
        >
          <div className="h-full w-full rounded-[inherit]" />
        </LiquidGlass>
      </div>
      <div className={cn('liquid-glass-content', innerClassName)} style={{ padding }}>
        {children}
      </div>
    </div>
  );
}

export interface GlassInputProps extends ComponentPropsWithoutRef<typeof VendorInputGlass> {
  variant?: SurfaceVariant;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <VendorInputGlass
      ref={ref}
      className={cn('glass-input-shell rounded-[1.25rem]', variant === 'dense' && 'min-h-11 text-sm', className)}
      {...props}
    />
  ),
);
GlassInput.displayName = 'GlassInput';

export interface GlassBadgeProps extends ComponentPropsWithoutRef<typeof BadgeGlass> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
}

export const GlassBadge = forwardRef<HTMLSpanElement, GlassBadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <BadgeGlass
      ref={ref}
      variant={variant === 'danger' ? 'destructive' : variant}
      className={cn('glass-chip rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.14em]', className)}
      {...props}
    />
  ),
);
GlassBadge.displayName = 'GlassBadge';

export interface GlassProgressProps extends ComponentPropsWithoutRef<typeof VendorProgressGlass> {
  variant?: SurfaceVariant;
  tint?: 'blue' | 'rose' | 'emerald';
}

export const GlassProgress = forwardRef<HTMLDivElement, GlassProgressProps>(
  ({ className, variant = 'default', tint = 'blue', ...props }, ref) => (
    <VendorProgressGlass
      ref={ref}
      gradient={tint === 'rose' ? 'rose' : tint === 'emerald' ? 'emerald' : 'blue'}
      className={cn(surfaceClassMap[variant], 'rounded-full px-1 py-1', className)}
      {...props}
    />
  ),
);
GlassProgress.displayName = 'GlassProgress';

export const GlassTabs = {
  Root: ({ className, ...props }: React.ComponentProps<typeof VendorTabsGlass.Root>) => (
    <VendorTabsGlass.Root className={cn('space-y-4', className)} {...props} />
  ),
  List: forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof VendorTabsGlass.List>>(({ className, ...props }, ref) => (
    <VendorTabsGlass.List ref={ref} className={cn('glass-panel glass-panel-dense rounded-[1.4rem] p-1', className)} {...props} />
  )),
  Trigger: forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof VendorTabsGlass.Trigger>>(({ className, ...props }, ref) => (
    <VendorTabsGlass.Trigger ref={ref} className={cn('rounded-[1rem] text-sm', className)} {...props} />
  )),
  Content: ({ className, ...props }: React.ComponentProps<typeof VendorTabsGlass.Content>) => (
    <VendorTabsGlass.Content className={cn('outline-none', className)} {...props} />
  ),
};
GlassTabs.List.displayName = 'GlassTabsList';
GlassTabs.Trigger.displayName = 'GlassTabsTrigger';

interface GlassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function GlassDialog({ open, onOpenChange, title, description, children, footer, size = 'md' }: GlassDialogProps) {
  return (
    <ModalGlass.Root open={open} onOpenChange={onOpenChange} size={size}>
      <ModalGlass.Overlay className="bg-black/44 backdrop-blur-md" />
      <ModalGlass.Content className="glass-panel glass-panel-elevated rounded-[2rem] border-white/20">
        <ModalGlass.Header className="border-b border-white/10 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <ModalGlass.Title className="text-xl font-semibold text-foreground">{title}</ModalGlass.Title>
              {description ? <ModalGlass.Description className="text-sm text-muted-foreground">{description}</ModalGlass.Description> : null}
            </div>
            <ModalGlass.Close className="glass-floating-button flex h-11 w-11 items-center justify-center rounded-full">
              <X className="h-4 w-4" />
            </ModalGlass.Close>
          </div>
        </ModalGlass.Header>
        <ModalGlass.Body className="pt-6">{children}</ModalGlass.Body>
        {footer ? <ModalGlass.Footer className="border-t border-white/10 pt-6">{footer}</ModalGlass.Footer> : null}
      </ModalGlass.Content>
    </ModalGlass.Root>
  );
}

const GlassSheetRoot = SheetPrimitive.Root;
const GlassSheetTrigger = SheetPrimitive.Trigger;
const GlassSheetClose = SheetPrimitive.Close;

const GlassSheetOverlay = forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/40 backdrop-blur-md data-[state=open]:animate-fade-in', className)}
    {...props}
  />
));
GlassSheetOverlay.displayName = 'GlassSheetOverlay';

const GlassSheetContent = forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & { side?: 'right' | 'left' | 'top' | 'bottom' }
>(({ className, children, side = 'right', ...props }, ref) => (
  <SheetPrimitive.Portal>
    <GlassSheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        'glass-sidebar glass-panel z-50 flex h-[calc(100vh-2rem)] flex-col p-0 data-[state=open]:animate-fade-in',
        side === 'right' && 'right-4 left-auto',
        side === 'left' && 'left-4',
        side === 'top' && 'inset-x-4 top-4 bottom-auto h-auto max-h-[70vh] w-auto',
        side === 'bottom' && 'inset-x-4 bottom-4 top-auto h-auto max-h-[70vh] w-auto',
        className,
      )}
      {...props}
    >
      {children}
      <GlassSheetClose className="glass-floating-button absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </GlassSheetClose>
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));
GlassSheetContent.displayName = 'GlassSheetContent';

const GlassSheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-2 border-b border-white/10 px-6 py-5 text-left', className)} {...props} />
);

const GlassSheetTitle = forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn('text-xl font-semibold text-foreground', className)} {...props} />
));
GlassSheetTitle.displayName = 'GlassSheetTitle';

const GlassSheetDescription = forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
GlassSheetDescription.displayName = 'GlassSheetDescription';

const GlassSheetBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-6', className)} {...props} />
);

export const GlassSheet = {
  Root: GlassSheetRoot,
  Trigger: GlassSheetTrigger,
  Close: GlassSheetClose,
  Content: GlassSheetContent,
  Header: GlassSheetHeader,
  Title: GlassSheetTitle,
  Description: GlassSheetDescription,
  Body: GlassSheetBody,
};
