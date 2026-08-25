// Tipos compartilhados do domínio — usados pelo store em memória e pelas rotas.
// Espelham os modelos do prisma/schema.prisma.

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

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Customer {
  id: string;
  name: string;
  group?: string | null;
  country?: string | null;
}

export interface TimelineEntry {
  id: string;
  caseId: string;
  userId?: string | null;
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
  uploadedBy?: string | null;
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
  id: string;
  caseId: string;
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

export interface CaseRelation {
  caseId: string;
  relatedCaseId: string;
  note?: string | null;
}

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

  // Modo Analista Comercial
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
