// Google Analytics 4 Integration
// Replace GA_MEASUREMENT_ID with your actual Google Analytics 4 Measurement ID

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Check if analytics is enabled (production only by default)
const isAnalyticsEnabled = (): boolean => {
  return import.meta.env.PROD && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';
};

// Initialize Google Analytics
export function initGA(): void {
  if (!isAnalyticsEnabled()) {
    console.log('[Analytics] Disabled in development or GA_MEASUREMENT_ID not set');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    send_page_view: false, // We'll handle this manually for SPA
  });

  // Make gtag globally available
  window.gtag = gtag;
}

// Track page views (call on route change)
export function trackPageView(path: string, title?: string): void {
  if (!isAnalyticsEnabled() || !window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}

// Track custom events
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (!isAnalyticsEnabled() || !window.gtag) return;
  
  window.gtag('event', eventName, params);
}

// Predefined events for common actions
export const analytics = {
  // Form events
  formStart: (formName: string) => trackEvent('form_start', { form_name: formName }),
  formSubmit: (formName: string) => trackEvent('form_submit', { form_name: formName }),
  formError: (formName: string, error: string) => trackEvent('form_error', { form_name: formName, error_message: error }),
  
  // Course events
  courseView: (courseSlug: string, courseName: string) => trackEvent('course_view', { course_slug: courseSlug, course_name: courseName }),
  courseEnrollClick: (courseSlug: string) => trackEvent('enroll_click', { course_slug: courseSlug }),
  
  // CTA events
  ctaClick: (ctaName: string, location: string) => trackEvent('cta_click', { cta_name: ctaName, location }),
  
  // Download events
  cvDownload: () => trackEvent('file_download', { file_name: 'cv', file_type: 'txt' }),
  
  // Contact events
  contactFormSubmit: (inquiryType: string) => trackEvent('contact_submit', { inquiry_type: inquiryType }),
  
  // Blog events
  blogView: (postSlug: string, postTitle: string) => trackEvent('blog_view', { post_slug: postSlug, post_title: postTitle }),
  
  // Engagement events
  scrollDepth: (percentage: number) => trackEvent('scroll', { percent_scrolled: percentage }),
  timeOnPage: (seconds: number) => trackEvent('engagement_time', { seconds }),
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
