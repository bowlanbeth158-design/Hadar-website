'use client';

import { useState } from 'react';
import { Users as UsersIcon, ShieldCheck, Star } from 'lucide-react';
import { AdminUsersListLive } from '@/components/admin/AdminUsersListLive';
import { AdminVerificationsListLive } from '@/components/admin/AdminVerificationsListLive';
import { StarManagementTab } from '@/components/admin/StarManagementTab';
import { useI18n } from '@/lib/i18n/provider';

type Tab = 'list' | 'verifications' | 'stars';

export default function Page() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('list');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">
          {t('users.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestion des utilisateurs en direct depuis le backend.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 mb-5 border-b border-gray-200">
        {(
          [
            { id: 'list', icon: UsersIcon, labelKey: 'admin.users.tab.list' },
            { id: 'verifications', icon: ShieldCheck, labelKey: 'admin.users.tab.verif' },
            { id: 'stars', icon: Star, labelKey: 'admin.users.tab.stars' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={isActive}
              className={
                isActive
                  ? 'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-blue border-b-2 border-brand-blue -mb-px'
                  : 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-brand-navy border-b-2 border-transparent -mb-px'
              }
            >
              <Icon className="h-4 w-4" aria-hidden />
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {activeTab === 'list' && <AdminUsersListLive />}
      {activeTab === 'verifications' && <AdminVerificationsListLive />}
      {activeTab === 'stars' && <StarManagementTab />}
    </div>
  );
}
