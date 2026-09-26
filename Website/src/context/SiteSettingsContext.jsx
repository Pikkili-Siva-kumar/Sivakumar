import React, { useState, useEffect, useCallback } from 'react';
import { SiteSettingsContext, DEFAULT_SETTINGS } from './siteSettingsInstance';
import { siteSettingsApi } from '../services/api';

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [, setIsLoading] = useState(true);

  const fetchSettings = useCallback(() => {
    return siteSettingsApi
      .getSettings()
      .then((res) => {
        if (res && res.settings) {
          setSettings((prev) => ({
            ...prev,
            ...res.settings,
            maintenance_mode: Boolean(res.settings.maintenance_mode),
          }));
        }
      })
      .catch(() => {
        // Fallback silently to safe defaults if network or backend unavailable
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const value = {
    settings,
    refreshSettings: fetchSettings,
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export default SiteSettingsProvider;
