import clsx from 'clsx';
import type { CasePriority } from '../../types/domain';
import { CASE_PRIORITY_LABELS } from '../../types/domain';

const STYLES: Record<CasePriority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export function PriorityBadge({ priority }: { priority: CasePriority }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STYLES[priority])}>
      {CASE_PRIORITY_LABELS[priority]}
    </span>
  );
}
