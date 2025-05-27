import { logAnalyticsEvent } from './config';

// Page view tracking
export const trackPageView = (pagePath, pageTitle) => {
  logAnalyticsEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: window.location.href
  });
};

// User actions
export const trackUserLogin = (method) => {
  logAnalyticsEvent('login', { method });
};

export const trackUserSignup = (method) => {
  logAnalyticsEvent('sign_up', { method });
};

// Feature usage
export const trackFeatureUsage = (featureName, additionalParams = {}) => {
  logAnalyticsEvent('feature_use', {
    feature_name: featureName,
    ...additionalParams
  });
};

// Kitty related events
export const trackKittyCreated = (kittyId, kittyName) => {
  logAnalyticsEvent('kitty_created', {
    kitty_id: kittyId,
    kitty_name: kittyName
  });
};

export const trackExpenseAdded = (kittyId, amount, category) => {
  logAnalyticsEvent('expense_added', {
    kitty_id: kittyId,
    amount: amount,
    category: category
  });
};

export const trackMemberAdded = (kittyId) => {
  logAnalyticsEvent('member_added', {
    kitty_id: kittyId
  });
};

export const trackSettlement = (kittyId, amount) => {
  logAnalyticsEvent('settlement_completed', {
    kitty_id: kittyId,
    amount: amount
  });
};

// Custom events
export const trackCustomEvent = (eventName, eventParams = {}) => {
  logAnalyticsEvent(eventName, eventParams);
}; 