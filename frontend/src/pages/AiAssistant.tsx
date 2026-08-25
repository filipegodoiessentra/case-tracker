import { useState } from 'react';
import { aiApi, type AiSuggestionResponse } from '../api/miscApi';
import { Card } from '../components/common/Card';
import { SearchBar } from '../components/common/SearchBar';

// Assistente de IA — hoje consulta heurísticas sobre os dados mock
// (backend/src/services/aiService.ts). Pronto para ser substituído por uma
// chamada real a um modelo de linguagem sem mudar o contrato da API.
export function AiAssistant() {
  const [result, setResult] = useState<AiSuggestionResponse | null>(null);
  const [lastQuery, setLastQuery] = useState('');

  async function handleSearch(query: string) {
    setLastQuery(query);
    const r = await aiApi.suggest(query);
    setResult(r);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Assistente de IA</h1>
      <Card>
        <p className="mb-3 text-sm text-slate-500">
          Ex.: "Cliente México solicitando COO" — o assistente busca casos semelhantes, tempo médio de resolução e times
          envolvidos.
        </p>
        <SearchBar placeholder="Descreva a situação..." onSearch={handleSearch} />
      </Card>

      {result && (
        <Card className="space-y-3">
          <p className="text-sm text-slate-700 dark:text-slate-200">{result.summary}</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Casos semelhantes" value={result.similarCasesCount} />
            <Stat label="Tempo médio de resolução" value={result.averageResolutionDays ? `${result.averageResolutionDays}d` : 'N/A'} />
            <Stat label="Times envolvidos" value={result.teamsInvolved.length} />
            <Stat label="Documentos relacionados" value={result.relatedDocuments.length} />
          </div>
          {result.similarCaseNumbers.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Casos: {lastQuery}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{result.similarCaseNumbers.join(', ')}</p>
            </div>
          )}
          {result.relatedDocuments.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Documentos</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{result.relatedDocuments.join(', ')}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800">
      <p className="text-lg font-semibold text-brand-600">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
