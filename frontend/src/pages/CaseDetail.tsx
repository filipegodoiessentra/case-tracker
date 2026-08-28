import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { casesApi } from '../api/casesApi';
import { Card } from '../components/common/Card';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { TagPill } from '../components/common/Tag';
import { ExportFolderPanel } from '../components/exportdocs/ExportFolderPanel';
import { ExportDocumentsPanel } from '../components/exportdocs/ExportDocumentsPanel';
import { CASE_TYPE_LABELS, type Attachment, type Case, type EmailLink, type LessonLearned, type TimelineEntry } from '../types/domain';

type Tab = 'overview' | 'timeline' | 'attachments' | 'exportFolder' | 'exportDocs' | 'emails' | 'related' | 'lesson';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Visão geral' },
  { key: 'timeline', label: 'Histórico' },
  { key: 'attachments', label: 'Anexos' },
  { key: 'exportFolder', label: 'Pasta de Exportação' },
  { key: 'exportDocs', label: 'Proforma/Invoice/Packing' },
  { key: 'emails', label: 'E-mails' },
  { key: 'related', label: 'Casos relacionados' },
  { key: 'lesson', label: 'Lição aprendida' },
];

export function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [emails, setEmails] = useState<EmailLink[]>([]);
  const [related, setRelated] = useState<Case[]>([]);
  const [lesson, setLesson] = useState<LessonLearned | null>(null);
  const [newNote, setNewNote] = useState('');

  function reload() {
    if (!id) return;
    casesApi.get(id).then(setCaseData);
    casesApi.listTimeline(id).then(setTimeline);
    casesApi.listAttachments(id).then(setAttachments);
    casesApi.listEmails(id).then(setEmails);
    casesApi.listRelated(id).then(setRelated);
    casesApi.getLessonLearned(id).then(setLesson);
  }

  useEffect(reload, [id]);

  if (!caseData) return <LoadingSkeleton rows={6} />;

  async function addNote() {
    if (!id || !newNote.trim()) return;
    await casesApi.addTimelineEntry(id, newNote.trim());
    setNewNote('');
    reload();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!id || !e.target.files?.[0]) return;
    await casesApi.uploadAttachment(id, e.target.files[0]);
    reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            <Link to="/cases" className="hover:underline">
              Casos
            </Link>{' '}
            / {caseData.caseNumber}
          </p>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{caseData.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={caseData.status} />
          <PriorityBadge priority={caseData.priority} />
          <Link
            to={`/cases/${id}/edit`}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Editar
          </Link>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium ${
              tab === t.key ? 'border-b-2 border-brand-600 text-brand-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Info label="Cliente" value={caseData.customerName} />
          <Info label="País" value={caseData.country} />
          <Info label="Tipo" value={CASE_TYPE_LABELS[caseData.type]} />
          <Info label="Origem" value={caseData.origin} />
          <Info label="Responsável" value={caseData.ownerName} />
          <Info label="Prazo" value={caseData.dueDate?.substring(0, 10)} />
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase text-slate-400">Tags</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {caseData.tags.map((t) => (
                <TagPill key={t} label={t} />
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase text-slate-400">Comentários</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{caseData.comments || '—'}</p>
          </div>
        </Card>
      )}

      {tab === 'timeline' && (
        <Card className="space-y-4">
          <div className="flex gap-2">
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Adicionar nota ao histórico..."
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            />
            <button onClick={addNote} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">
              Adicionar
            </button>
          </div>
          <ul className="space-y-3 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
            {timeline.map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500" />
                <p className="text-sm text-slate-700 dark:text-slate-200">{entry.note}</p>
                <p className="text-xs text-slate-400">
                  {entry.userName ?? 'Sistema'} · {new Date(entry.createdAt).toLocaleString('pt-BR')}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'attachments' && (
        <Card className="space-y-3">
          <input type="file" onChange={handleUpload} className="text-sm" />
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {attachments.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                <a href={a.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                  {a.fileName}
                </a>
                <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleDateString('pt-BR')}</span>
              </li>
            ))}
            {attachments.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Nenhum anexo.</p>}
          </ul>
        </Card>
      )}

      {tab === 'exportFolder' && id && <ExportFolderPanel caseId={id} />}

      {tab === 'exportDocs' && <ExportDocumentsPanel caseData={caseData} />}

      {tab === 'emails' && (
        <Card>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {emails.map((e) => (
              <li key={e.id} className="py-2 text-sm">
                <a href={e.outlookLink ?? '#'} target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:underline">
                  {e.subject}
                </a>
                <p className="text-xs text-slate-400">
                  {e.sender} · {new Date(e.receivedAt).toLocaleString('pt-BR')}
                </p>
              </li>
            ))}
            {emails.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Nenhum e-mail vinculado.</p>}
          </ul>
        </Card>
      )}

      {tab === 'related' && (
        <Card>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {related.map((c) => (
              <li key={c.id} className="py-2 text-sm">
                <Link to={`/cases/${c.id}`} className="font-medium text-brand-600 hover:underline">
                  {c.caseNumber} — {c.title}
                </Link>
              </li>
            ))}
            {related.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Nenhum caso relacionado.</p>}
          </ul>
        </Card>
      )}

      {tab === 'lesson' && (
        <Card className="space-y-2 text-sm">
          {lesson ? (
            <>
              <Info label="Problema" value={lesson.problem} />
              <Info label="Causa raiz" value={lesson.rootCause} />
              <Info label="Resolução" value={lesson.resolution} />
              <Info label="Times envolvidos" value={lesson.teamsInvolved.join(', ')} />
              <Info label="Documentos utilizados" value={lesson.documentsUsed.join(', ')} />
            </>
          ) : (
            <p className="text-slate-400">Nenhuma lição aprendida registrada para este caso.</p>
          )}
        </Card>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-200">{value || '—'}</p>
    </div>
  );
}
