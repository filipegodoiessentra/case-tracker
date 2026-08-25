// Stub de integração com Microsoft Graph API — hoje apenas retorna os
// e-mails mockados vinculados ao caso (ver src/data/mockData.ts). Para
// ativar a integração real:
//   1. Registrar a aplicação no Entra ID com permissão Mail.Read (delegada ou app).
//   2. Obter um access token do Graph (via MSAL, reaproveitando o AUTH_MODE=entra).
//   3. Substituir a função abaixo por uma chamada a
//      GET https://graph.microsoft.com/v1.0/me/messages?$search="{assunto}"
import { db } from '../store/db';

export async function findRelatedEmails(caseId: string) {
  // Em produção: buscar e-mails reais via Graph API filtrando pelo número do caso/assunto.
  return db.listEmailLinks(caseId);
}
