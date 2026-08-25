import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginScreen } from './components/layout/LoginScreen';
import { useAuth } from './context/AuthContext';
import { AiAssistant } from './pages/AiAssistant';
import { Backup } from './pages/Backup';
import { CaseDetail } from './pages/CaseDetail';
import { CaseForm } from './pages/CaseForm';
import { CasesList } from './pages/CasesList';
import { CommercialAnalystView } from './pages/CommercialAnalystView';
import { Dashboard } from './pages/Dashboard';
import { GlobalSearch } from './pages/GlobalSearch';
import { KnowledgeArticleDetail } from './pages/KnowledgeArticleDetail';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { ProcessDetail } from './pages/ProcessDetail';
import { ProcessesLibrary } from './pages/ProcessesLibrary';
import { Reports } from './pages/Reports';

export function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />

        <Route path="/cases" element={<CasesList />} />
        <Route path="/cases/new" element={<CaseForm />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/cases/:id/edit" element={<CaseForm />} />

        <Route path="/knowledge" element={<KnowledgeBase />} />
        <Route path="/knowledge/new" element={<KnowledgeArticleDetail />} />
        <Route path="/knowledge/:id" element={<KnowledgeArticleDetail />} />

        <Route path="/processes" element={<ProcessesLibrary />} />
        <Route path="/processes/:id" element={<ProcessDetail />} />

        <Route path="/reports" element={<Reports />} />
        <Route path="/search" element={<GlobalSearch />} />
        <Route path="/commercial-analyst" element={<CommercialAnalystView />} />
        <Route path="/ai-assistant" element={<AiAssistant />} />
        <Route path="/backup" element={<Backup />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
