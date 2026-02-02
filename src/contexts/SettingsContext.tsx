'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { createClient } from '@/lib/supabase/client';

export interface UserSettings {
  require_brief_description: boolean;
  batch_mode: boolean;
  quantity_req_batch: number;
}

interface SettingsContextType {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: UserSettings = {
  require_brief_description: true,
  batch_mode: true,
  quantity_req_batch: 5,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Module-level state to persist between navigations
let cachedSettings: UserSettings | null = null;
let cachedUserId: string | null = null;

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [supabase] = useState(() => createClient());

  // Check if we have cached settings for this user
  const hasCachedSettings = user?.id && user.id === cachedUserId && cachedSettings !== null;

  const [settings, setSettings] = useState<UserSettings>(
    hasCachedSettings ? cachedSettings! : defaultSettings
  );
  // Only show loading if we don't have cached settings
  const [isLoading, setIsLoading] = useState(!hasCachedSettings);
  const [error, setError] = useState<string | null>(null);

  // Track if we've already fetched for this user
  const fetchedForUser = useRef<string | null>(
    hasCachedSettings ? user?.id ?? null : null
  );

  const fetchSettings = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setSettings(defaultSettings);
      setIsLoading(false);
      return;
    }

    // Skip if already fetched for this user (unless forcing refresh)
    if (!forceRefresh && fetchedForUser.current === user.id) {
      setIsLoading(false);
      return;
    }

    // Only set loading true if we don't have cached data
    if (!cachedSettings || cachedUserId !== user.id) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      const loadedSettings: UserSettings = data
        ? {
            require_brief_description: data.require_brief_description,
            batch_mode: data.batch_mode,
            quantity_req_batch: data.quantity_req_batch,
          }
        : defaultSettings;

      // Update module-level cache
      cachedSettings = loadedSettings;
      cachedUserId = user.id;
      fetchedForUser.current = user.id;

      setSettings(loadedSettings);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, supabase]);

  // Fetch settings when user changes
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Save settings to Supabase
  const saveSettings = useCallback(async (newSettings: UserSettings) => {
    if (!user?.id) return;

    try {
      const { error: saveError } = await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          ...newSettings,
        }, {
          onConflict: 'user_id',
        });

      if (saveError) {
        throw saveError;
      }

      // Update cache
      cachedSettings = newSettings;
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    }
  }, [user?.id, supabase]);

  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    const mergedSettings = { ...settings, ...newSettings };
    setSettings(mergedSettings);
    saveSettings(mergedSettings);
  }, [settings, saveSettings]);

  const refreshSettings = useCallback(async () => {
    await fetchSettings(true);
  }, [fetchSettings]);

  const value: SettingsContextType = {
    settings,
    isLoading,
    error,
    updateSetting,
    updateSettings,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
