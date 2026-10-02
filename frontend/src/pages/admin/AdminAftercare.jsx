import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import RenewalsTab from '../../components/admin/aftercare/RenewalsTab';
import MaintenanceTab from '../../components/admin/aftercare/MaintenanceTab';
import TestimonialsTab from '../../components/admin/aftercare/TestimonialsTab';
import ReferralsTab from '../../components/admin/aftercare/ReferralsTab';
import MonitorsTab from '../../components/admin/aftercare/MonitorsTab';

// ─── AdminAftercare ───────────────────────────────────────
// Admin OS Phase 5 — Offboarding / Retention hub (blueprint
// §47–§49, §54–§55): Renewals, Maintenance, Testimonials,
// Referrals and Website Monitoring. Handover lives on the
// project detail page (§51) where the work actually happens.
// Supports ?tab= deep links (monitor alerts link straight in).

const TABS = [
  { id: 'renewals', label: 'Renewals' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'referrals', label: 'Referrals' },
  { id: 'monitors', label: 'Monitoring' },
];

const AdminAftercare = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === searchParams.get('tab')) ? searchParams.get('tab') : 'renewals';

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/clients').then((res) => {
      if (res.ok && Array.isArray(res.data)) setClients(res.data);
    });
    api.get('/client-projects').then((res) => {
      if (res.ok && Array.isArray(res.data)) setProjects(res.data);
    });
  }, []);

  return (
    <div className="flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white font-heading">
            Aftercare
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-1">
            Retention — renewals, maintenance, testimonials, referrals and site monitoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setSearchParams(t.id === 'renewals' ? {} : { tab: t.id })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors font-body ${
                tab === t.id
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'renewals' && <RenewalsTab clients={clients} projects={projects} />}
        {tab === 'maintenance' && <MaintenanceTab clients={clients} projects={projects} />}
        {tab === 'testimonials' && <TestimonialsTab clients={clients} projects={projects} />}
        {tab === 'referrals' && <ReferralsTab clients={clients} />}
        {tab === 'monitors' && <MonitorsTab clients={clients} projects={projects} />}
      </div>
    </div>
  );
};

export default AdminAftercare;
