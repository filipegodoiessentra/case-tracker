import { useAuth } from '../../context/AuthContext';

export function LoginScreen() {
  const { login } = useAuth();
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-brand-600">Essentra Case Tracker</h1>
        <p className="mt-2 text-sm text-slate-500">Entre com sua conta corporativa (Microsoft Entra ID).</p>
        <button
          onClick={login}
          className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Entrar
        </button>
        <p className="mt-3 text-xs text-slate-400">Modo demonstração: login instantâneo, sem Azure AD configurado.</p>
      </div>
    </div>
  );
}
