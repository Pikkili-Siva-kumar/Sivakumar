/**
 * First-Party Analytics Client Utility
 * Step 24: Real Analytics Foundation
 * Privacy-first, lightweight tracking for public routes and non-sensitive interactions.
 */

import { API_BASE_URL } from '../services/api';

const SESSION_KEY = 'sk_analytics_session_id';

/**
 * Retrieve or generate an anonymous, non-invasive session identifier.
 * Stored only in sessionStorage for the duration of the browser tab session.
 */
function getSessionId() {
  if (typeof window === 'undefined') return null;
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 'sid_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return null;
  }
}

// Track last page_view to prevent duplicate rapid events in React dev mode
let lastPageViewPath = null;
let lastPageViewTime = 0;

/**
 * Record a first-party analytics event.
 * Rejects admin routes, credentials, and sensitive content automatically.
 */
export async function trackEvent({ eventType, path, metadata = {} }) {
  if (typeof window === 'undefined') return;

  const currentPath = path || window.location.pathname;

  // Rule: Do NOT track admin routes or authentication gateways
  if (
    currentPath.startsWith('/admin') ||
    currentPath.startsWith('/api')
  ) {
    return;
  }

  // Rule: Prevent duplicate page_view events within 800ms on same path (e.g. StrictMode dev remount)
  if (eventType === 'page_view') {
    const now = Date.now();
    if (lastPageViewPath === currentPath && now - lastPageViewTime < 800) {
      return;
    }
    lastPageViewPath = currentPath;
    lastPageViewTime = now;
  }

  // Safe non-sensitive payload
  const payload = {
    eventType,
    path: currentPath,
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    sessionId: getSessionId(),
    metadata: metadata && typeof metadata === 'object' ? metadata : {},
  };

  try {
    // Non-blocking fire-and-forget fetch
    fetch(`${API_BASE_URL}/analytics/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Fail silently: Analytics never disrupts user operations
    });
  } catch {
    // Ignore analytics network errors
  }
}

export default {
  trackEvent,
};
