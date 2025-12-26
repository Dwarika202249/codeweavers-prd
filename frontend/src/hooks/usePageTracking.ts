import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/analytics';

/**
 * Hook to track page views on route changes
 * Uses the page title from document.title (set by SEO component)
 */
export function usePageTracking(): void {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip tracking on first render (handled by initGA)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Still track the initial page view
      trackPageView(location.pathname);
      return;
    }

    // Track page view on route change
    // Small delay to ensure SEO component has updated the title
    const timeoutId = setTimeout(() => {
      trackPageView(location.pathname, document.title);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
}
