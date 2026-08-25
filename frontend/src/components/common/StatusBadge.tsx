import clsx from 'clsx';
import type { CaseStatus } from '../../types/domain';
import { CASE_STATUS_LABELS } from '../../types/domain';

const STYLES: Record<CaseStatus, string> = {
  NEW: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  WAITING_CUSTOMER: 'bg-amber-100 text-amber-700',
  WAITING_EXPORT: 'bg-purple-100 text-purple-700',
  WAITING_FACTORY: 'bg-orange-100 text-orange-700',
  WAITING_FINANCIAL: 'bg-pink-100 text-pink-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-gray-200 text-gray-600',
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STYLES[status])}>
      {CASE_STATUS_LABELS[status]}
    </span>
  );
}
