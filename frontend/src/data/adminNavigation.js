import { NavIcon as Icon } from './adminIcons.jsx';

export const workspaces = [
    { id: 'software', label: 'Software', icon: Icon.Code },
    { id: 'survey', label: 'Survey', icon: Icon.Satellite },
    { id: 'drone', label: 'Drone', icon: Icon.Plane },
];

export function navigationGroups(workspace) {
    const projects = workspace === 'survey' ? '/admin/survey/projects' : workspace === 'drone' ? '/admin/drone/missions' : '/admin/projects';
    const portfolio = workspace === 'software' ? '/admin/portfolio' : `/admin/${workspace}/portfolio`;
    return [
        { label: 'Today', icon: Icon.Dashboard, items: [{ to: '/admin', label: 'Overview', end: true }, { to: '/admin/tasks', label: 'Tasks' }] },
        { label: 'Enquiries', icon: Icon.Kanban, items: [{ to: '/admin/crm', label: 'Pipeline' }, { to: '/admin/quotations', label: 'Quotations' }, ...(workspace === 'software' ? [] : [{ to: `/admin/${workspace}/bookings`, label: 'Bookings' }])] },
        { label: 'Clients & Projects', icon: Icon.Users, items: [{ to: '/admin/clients', label: 'Clients' }, { to: projects, label: workspace === 'drone' ? 'Flight missions' : 'Projects' }, { to: '/admin/contracts', label: 'Contracts' }, { to: '/admin/aftercare', label: 'Aftercare' }, { to: '/admin/templates', label: 'Forms & intake' }] },
        { label: 'Money', icon: Icon.Payments, items: [{ to: '/admin/invoices', label: 'Invoices' }, { to: '/admin/payments', label: 'Payment proofs' }, { to: '/admin/expenses', label: 'Expenses' }] },
        { label: 'Inbox', icon: Icon.Bell, items: [{ to: '/admin/inbox', label: 'Messages' }] },
        { label: 'Portfolio', icon: Icon.FileText, items: [{ to: portfolio, label: 'Published work' }] },
        { label: 'Settings', icon: Icon.Settings, items: [{ to: '/admin/settings', label: 'Preferences' }, { to: '/admin/security/2fa', label: 'Security' }, { to: '/admin/logs', label: 'Activity history' }, { to: '/admin/help', label: 'Help' }] },
        { label: 'Tools', icon: Icon.BarChart, items: [{ to: '/admin/outreach', label: 'Outreach' }, { to: '/admin/reports', label: 'Reports' }, { to: '/admin/email-templates', label: 'Email templates' }] },
    ];
}
