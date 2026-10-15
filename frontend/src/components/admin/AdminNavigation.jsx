import { NavLink, useLocation } from 'react-router-dom';

export default function AdminNavigation({ groups, collapsed = false, onNavigate }) {
    const { pathname } = useLocation();
    return <nav aria-label="Admin navigation" className="space-y-2">
        {groups.map((group) => {
            const active = group.items.some((item) => item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`));
            const GroupIcon = group.icon;
            if (collapsed) return <NavLink key={group.label} to={group.items[0].to} title={group.label} aria-label={group.label} onClick={onNavigate} className={`flex justify-center p-3 rounded-xl ${active ? 'bg-accent/10 text-accent' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}><GroupIcon className="h-5 w-5" /></NavLink>;
            return <details key={`${group.label}:${active}`} open={active || undefined} className="group rounded-xl">
                <summary className={`flex items-center gap-3 px-3 py-3 cursor-pointer rounded-xl text-sm font-bold list-none focus-visible:outline-accent ${active ? 'bg-accent/10 text-accent' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <GroupIcon className="h-5 w-5 shrink-0" /><span className="flex-1">{group.label}</span><span aria-hidden="true" className="group-open:rotate-90 transition-transform">›</span>
                </summary>
                <div className="pl-8 py-1 space-y-1">{group.items.map((item) => <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? 'text-accent font-bold bg-accent/5' : 'text-gray-500 dark:text-gray-400 hover:text-accent'}`}>{item.label}</NavLink>)}</div>
            </details>;
        })}
    </nav>;
}
