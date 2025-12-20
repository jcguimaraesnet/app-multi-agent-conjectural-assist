"use client";

import { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import Toggle from '@/components/ui/Toggle';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Settings {
  require_brief_description: boolean;
  batch_mode: boolean;
  quantity_req_batch: number;
}

const defaultSettings: Settings = {
  require_brief_description: true,
  batch_mode: true,
  quantity_req_batch: 5,
};

export default function SettingsPanel() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  // Load settings from Supabase
  useEffect(() => {
    async function loadSettings() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading settings:', error);
      } else if (data) {
        setSettings({
          require_brief_description: data.require_brief_description,
          batch_mode: data.batch_mode,
          quantity_req_batch: data.quantity_req_batch,
        });
      }
      setIsLoading(false);
    }

    loadSettings();
  }, [user, supabase]);

  // Save settings to Supabase
  const saveSettings = useCallback(async (newSettings: Settings) => {
    if (!user) return;

    const { error } = await supabase
      .from('settings')
      .upsert({
        user_id: user.id,
        ...newSettings,
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error saving settings:', error);
    }
  }, [user, supabase]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const incrementQuantity = () => {
    const newValue = Math.min(settings.quantity_req_batch + 1, 50);
    updateSetting('quantity_req_batch', newValue);
  };

  const decrementQuantity = () => {
    const newValue = Math.max(settings.quantity_req_batch - 1, 1);
    updateSetting('quantity_req_batch', newValue);
  };

  if (isLoading) {
    return (
      <Card noPadding>
        <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
          Loading settings...
        </div>
      </Card>
    );
  }

  return (
    <Card noPadding>
      
      {/* Setting 1: Require Description */}
      <div className="px-6 py-5 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Require brief description to generate requirement
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              When enabled, a description must be provided before generating requirements
            </p>
          </div>
          <Toggle
            checked={settings.require_brief_description}
            onChange={(value) => updateSetting('require_brief_description', value)}
          />
        </div>
      </div>

      {/* Setting 2: Generation Mode */}
      <div className="px-6 py-5 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Generation mode
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose between batch or interactive requirement generation
            </p>
          </div>
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => updateSetting('batch_mode', true)}
              className={`px-3 py-2.5 text-xs font-medium rounded-md transition-colors ${
                settings.batch_mode
                  ? 'bg-primary text-white dark:text-black'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Batch
            </button>
            <button
              onClick={() => updateSetting('batch_mode', false)}
              className={`px-3 py-2.5 text-xs font-medium rounded-md transition-colors ${
                !settings.batch_mode
                  ? 'bg-primary text-white dark:text-black'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Interactive
            </button>
          </div>
        </div>
      </div>

      {/* Setting 3: Batch Quantity */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Quantity of requirements for batch generation
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Number of requirements to generate in batch mode
            </p>
          </div>
          <div className="flex items-center">
            <div className="flex items-center border border-border-light dark:border-gray-600 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white min-w-[50px] text-center">
                {settings.quantity_req_batch}
              </div>
              <div className="flex flex-col border-l border-border-light dark:border-gray-600">
                <button
                  onClick={incrementQuantity}
                  disabled={!settings.batch_mode}
                  className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-3 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={decrementQuantity}
                  disabled={!settings.batch_mode}
                  className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-border-light dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-3 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </Card>
  );
}
