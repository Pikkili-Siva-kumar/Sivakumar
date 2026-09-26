import { useContext } from 'react';
import { SiteSettingsContext } from './siteSettingsInstance';

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}

export default useSiteSettings;
