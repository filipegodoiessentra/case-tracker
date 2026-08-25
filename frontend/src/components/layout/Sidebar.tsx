import clsx from 'clsx';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/cases', label: 'Casos', icon: '🗂️' },
  { to: '/knowledge', label: 'Base de Conhecimento', icon: '📚' },
  { to: '/processes', label: 'Processos', icon: '🧭' },
  { to: '/reports', label: 'Relatórios', icon: '📈' },
  { to: '/search', label: 'Busca Global', icon: '🔎' },
  { to: '/commercial-analyst', label: 'Analista Comercial', icon: '💼' },
  { to: '/ai-assistant', label: 'Assistente de IA', icon: '🤖' },
  { to: '/backup', label: 'Backup de Dados', icon: '💾' },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5 dark:border-slate-700">
        <span className="text-lg font-bold text-brand-600">Essentra</span>
        <span className="text-sm text-slate-400">Case Tracker</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
