import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SearchBar } from '../common/SearchBar';

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex-1">
        <SearchBar placeholder="Buscar casos, artigos, processos..." onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)} />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name}</p>
          <p className="text-xs text-slate-400">{user?.roles?.join(', ')}</p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
