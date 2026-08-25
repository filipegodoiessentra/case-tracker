import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dashboardApi } from '../api/dashboardApi';
import { Card, StatCard } from '../components/common/Card';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { StatusBadge } from '../components/common/StatusBadge';
import { CASE_STATUS_LABELS, type CaseStatus, type DashboardData } from '../types/domain';

const COLORS = ['#2f5fff', '#5285ff', '#84acff', '#1e42db', '#182c85', '#b3ccff', '#16266a', '#d9e6ff'];

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .get()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <LoadingSkeleton rows={6} />;
  }

  const statusData = Object.entries(data.byStatus).map(([status, count]) => ({
    name: CASE_STATUS_LABELS[status as CaseStatus] ?? status,
    value: count,
  }));
  const countryData = Object.entries(data.byCountry).map(([country, count]) => ({ name: country, value: count }));
  const clientData = Object.entries(data.byClient).map(([client, count]) => ({ name: client, value: count }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de casos" value={data.totalCases} />
        <StatCard label="Casos abertos" value={data.openCases} />
        <StatCard label="Casos atrasados" value={data.overdue} tone={data.overdue > 0 ? 'danger' : 'success'} />
        <StatCard label="Clientes com caso ativo" value={Object.keys(data.byClient).length} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Casos por status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {statusData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Casos por país</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={countryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2f5fff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Casos por cliente</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={clientData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#5285ff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Atualizações recentes</h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.recentUpdates.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                <Link to={`/cases/${c.id}`} className="font-medium text-brand-600 hover:underline">
                  {c.caseNumber} — {c.title}
                </Link>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
