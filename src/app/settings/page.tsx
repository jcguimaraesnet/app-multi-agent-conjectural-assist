"use client";

import AppLayout from '@/components/layout/AppLayout';
import PageTitle from '@/components/ui/PageTitle';
import SettingsPanel from '@/components/settings/SettingsPanel';

export default function SettingsPage() {
  return (
    <AppLayout maxWidth="3xl">
      <PageTitle title="Settings" />

      <SettingsPanel />
    </AppLayout>
  );
}
