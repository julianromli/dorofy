import { useEffect, useState } from 'react';

export interface BrowserCapabilities {
  supportsBackdropFilter: boolean;
  supportsDisplacementGlass: boolean;
  prefersReducedTransparency: boolean;
  prefersReducedMotion: boolean;
}

const DEFAULT_CAPABILITIES: BrowserCapabilities = {
  supportsBackdropFilter: false,
  supportsDisplacementGlass: false,
  prefersReducedTransparency: false,
  prefersReducedMotion: false,
};

const isChromiumBrowser = (userAgent: string) =>
  /(Chrome|Chromium|Edg|OPR|Brave|CriOS)/i.test(userAgent) &&
  !/(Firefox|FxiOS)/i.test(userAgent);

export function getBrowserCapabilities(): BrowserCapabilities {
  if (typeof window === 'undefined') {
    return DEFAULT_CAPABILITIES;
  }

  const cssSupports =
    typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
      ? CSS.supports.bind(CSS)
      : (() => false);

  const supportsBackdropFilter =
    cssSupports('backdrop-filter: blur(1px)') ||
    cssSupports('-webkit-backdrop-filter: blur(1px)');
  const prefersReducedTransparency = window.matchMedia?.('(prefers-reduced-transparency: reduce)').matches ?? false;
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const supportsDisplacementGlass =
    supportsBackdropFilter &&
    isChromiumBrowser(window.navigator.userAgent) &&
    cssSupports('filter', 'url(#liquid-glass-filter)');

  return {
    supportsBackdropFilter,
    supportsDisplacementGlass,
    prefersReducedTransparency,
    prefersReducedMotion,
  };
}

export function useBrowserCapabilities() {
  const [capabilities, setCapabilities] = useState<BrowserCapabilities>(() => getBrowserCapabilities());

  useEffect(() => {
    const transparencyQuery = window.matchMedia?.('(prefers-reduced-transparency: reduce)');
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () => setCapabilities(getBrowserCapabilities());

    update();

    transparencyQuery?.addEventListener('change', update);
    motionQuery?.addEventListener('change', update);

    return () => {
      transparencyQuery?.removeEventListener('change', update);
      motionQuery?.removeEventListener('change', update);
    };
  }, []);

  return capabilities;
}
