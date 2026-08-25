// Tipos espelhando o domínio do backend (backend/src/types/domain.ts).

export type CaseType =
  | 'EXPORT_BRAZIL'
  | 'DIRECT_SHIPMENT'
  | 'CUSTOMER_SERVICE'
  | 'LOGISTICS'
  | 'CERTIFICATE_ORIGIN'
  | 'CERTIFICATE_QUALITY'
  | 'PROFORMA_INVOICE'
  | 'COMMERCIAL_INVOICE'
  | 'FINANCIAL'
  | 'COMPLAINT'
  | 'OTHER';

export type CaseStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'WAITING_CUSTOMER'
  | 'WAITING_EXPORT'
  | 'WAITING_FACTORY'
  | 'WAITING_FINANCIAL'
  | 'RESOLVED'
  | 'CLOSED';

export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  EXPORT_BRAZIL: 'Exportação Brasil',
  DIRECT_SHIPMENT: 'Direct Shipment',
  CUSTOMER_SERVICE: 'Customer Service',
  LOGISTICS: 'Logística',
  CERTIFICATE_ORIGIN: 'Certificado de Origem',
  CERTIFICATE_QUALITY: 'Certificado de Qualidade',
  PROFORMA_INVOICE: 'Proforma Invoice',
  COMMERCIAL_INVOICE: 'Commercial Invoice',
  FINANCIAL: 'Financeiro',
  COMPLAINT: 'Reclamação',
  OTHER: 'Outro',
};

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  NEW: 'Novo',
  IN_PROGRESS: 'Em andamento',
  WAITING_CUSTOMER: 'Aguardando cliente',
  WAITING_EXPORT: 'Aguardando exportação',
  WAITING_FACTORY: 'Aguardando fábrica',
  WAITING_FINANCIAL: 'Aguardando financeiro',
  RESOLVED: 'Resolvido',
  CLOSED: 'Encerrado',
};

export const CASE_PRIORITY_LABELS: Record<CasePriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  customerId?: string | null;
  customerName?: string | null;
  country?: string | null;
  region?: string | null;
  salesOwner?: string | null;
  type: CaseType;
  origin?: string | null;
  status: CaseStatus;
  priority: CasePriority;
  comments?: string | null;

  customerGroup?: string | null;
  salesOrder?: string | null;
  purchaseOrder?: string | null;
  material?: string | null;
  partNumber?: string | null;
  shipFrom?: string | null;
  shipTo?: string | null;
  incoterm?: string | null;
  shipDate?: string | null;
  tracking?: string | null;
  internalOwner?: string | null;
  managerOwner?: string | null;

  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId?: string | null;
  ownerName?: string | null;
  tags: string[];
}

export interface TimelineEntry {
  id: string;
  caseId: string;
  userName?: string | null;
  note: string;
  statusChange?: CaseStatus | null;
  createdAt: string;
}

export interface Attachment {
  id: string;
  caseId: string;
  fileName: string;
  fileType: string;
  url: string;
  createdAt: string;
}

export interface EmailLink {
  id: string;
  caseId: string;
  subject: string;
  sender: string;
  receivedAt: string;
  outlookLink?: string | null;
}

export interface LessonLearned {
  id?: string;
  caseId?: string;
  problem: string;
  rootCause: string;
  resolution: string;
  teamsInvolved: string[];
  documentsUsed: string[];
  processFollowed?: string | null;
  risksIdentified?: string | null;
  futureRecommendations?: string | null;
  finalComments?: string | null;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  contentMarkdown: string;
  category: string;
  tags: string[];
  authorName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessDoc {
  id: string;
  title: string;
  category: string;
  objective: string;
  flowchart?: string | null;
  responsible: string[];
  requiredDocuments: string[];
  stepByStep: string;
  commonErrors?: string | null;
  faq?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  totalCases: number;
  openCases: number;
  overdue: number;
  byStatus: Record<string, number>;
  byCountry: Record<string, number>;
  byClient: Record<string, number>;
  byType: Record<string, number>;
  recentUpdates: { id: string; caseNumber: string; title: string; status: CaseStatus; updatedAt: string }[];
}

export interface AiSuggestion {
  summary: string;
  similarCasesCount: number;
  similarCaseNumbers: string[];
  relatedDocuments: string[];
  averageResolutionDays: number | null;
  teamsInvolved: string[];
}
