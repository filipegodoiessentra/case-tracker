# Essentra Case Tracker

Aplicação para centralizar casos comerciais, exportação, customer service e logística (hoje espalhados entre Outlook, CE, SAP e pastas de rede).

**App 100% estático:** roda inteiramente no navegador, sem backend/servidor/banco de dados. Os dados ficam salvos em `localStorage` e podem ser exportados/importados como backup em JSON, além de exportação de relatórios em CSV/Excel.

## Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS + React Router + Recharts
- **"Banco de dados":** JSON em memória (`src/data/mockData.ts`), persistido no navegador via `localStorage` (`src/store/localStore.ts`) — sem servidor
- **Exportação:** CSV e Excel (SheetJS/`xlsx`) para relatórios e listas de casos; backup/restauração completa em JSON
- **Autenticação:** modo mock por padrão (login instantâneo, sem Azure AD); estrutura pronta para Microsoft Entra ID via MSAL (client-side, sem precisar de backend)
- **Deploy:** por ser um app estático, roda em qualquer hospedagem de arquivos estáticos — GitHub Pages, Azure Static Web Apps, Vercel, Netlify etc.

> Existe também uma pasta `backend/` (Express + Prisma) com uma versão anterior, full-stack, do projeto — não é mais necessária para rodar o app, mas fica disponível caso no futuro seja preciso um backend real com PostgreSQL/Entra ID de verdade.

## Estrutura

```
Case Tracker/
  frontend/           app React (única parte necessária para rodar)
    src/
      data/           dados de demonstração (JSON inicial)
      store/          localStore.ts — "banco de dados" em memória + localStorage
      api/            mesma assinatura de antes, agora chamando o localStore (sem rede)
      utils/          exportUtils.ts — exportação CSV/Excel (SheetJS)
      components/     layout + componentes reutilizáveis
      pages/          telas (Dashboard, Casos, KB, Processos, Relatórios, Backup, IA...)
      context/        AuthContext (mock / pronto para MSAL)
      types/
      App.tsx / main.tsx
  backend/            (legado/opcional) API Express + Prisma, não usada por padrão
```

## Como rodar

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev        # http://localhost:5173
```

Não é necessário backend, banco de dados ou Azure AD. Ao abrir, clique em "Entrar" (login mock instantâneo) e o app já carrega com dados de demonstração.

## Persistência e backup

- Toda edição (casos, artigos, processos etc.) é salva automaticamente no `localStorage` do navegador.
- Use a página **Backup de Dados** no menu lateral para:
  - Exportar um snapshot completo em JSON (recomendado antes de limpar o cache do navegador ou trocar de máquina).
  - Importar um backup JSON anteriormente exportado.
  - Resetar para os dados de demonstração originais.

## Exportação de relatórios

As páginas **Relatórios** e **Casos** têm botões para exportar os dados filtrados em **CSV** ou **Excel (.xlsx)**, gerados diretamente no navegador (biblioteca SheetJS).

## Publicar em GitHub Pages (automático, via GitHub Actions)

Não é necessário ter Node.js instalado localmente — o build roda na nuvem, no runner do GitHub Actions.

1. Crie um repositório no GitHub e envie o conteúdo desta pasta (`Case Tracker/`) para a branch `main`.
2. No GitHub, vá em **Settings → Pages** e em "Build and deployment" selecione **Source: GitHub Actions**.
3. O workflow `.github/workflows/deploy-pages.yml` (já incluso) builda `frontend/` e publica automaticamente a cada push em `main`. Ele já define `VITE_BASE_PATH=/<nome-do-repositório>/` automaticamente.
4. Após o primeiro push, acompanhe em **Actions**; ao concluir, o site fica em `https://<usuario>.github.io/<nome-do-repositório>/`.

O app já está preparado para rodar em subcaminho (roteamento do React Router com `basename`, e um `public/404.html` que redireciona rotas profundas de volta para o `index.html`, já que o GitHub Pages não tem rewrite de servidor).

## Publicar manualmente (GitHub Pages / Azure Static Web Apps / qualquer host estático)

Requer Node.js instalado apenas para gerar o build (não para rodar o app publicado):

```powershell
cd frontend
$env:VITE_BASE_PATH="/case-tracker/"   # opcional, só se for publicar em subcaminho
npm install
npm run build       # gera frontend/dist
```

Publique o conteúdo de `frontend/dist` em qualquer hospedagem de arquivos estáticos.

## Como ligar ao Microsoft Entra ID real (opcional)

1. Registre a aplicação no Entra ID (App registration) como SPA.
2. Preencha `VITE_AZURE_AD_CLIENT_ID` e `VITE_AZURE_AD_TENANT_ID` no `.env` do frontend.
3. Defina `VITE_AUTH_MODE=entra`.
4. Implemente o fluxo MSAL (`@azure/msal-browser`, já incluído nas dependências) em `src/context/AuthContext.tsx` no lugar do login mock.

## Roadmap preparado (não implementado ainda)

- Integração real com Microsoft Graph API (e-mails do Outlook vinculados ao caso).
- Integração SAP / SharePoint / Teams.
- Assistente de IA real — hoje `localStore.suggestSolutions` é uma heurística sobre os dados locais, pronta para ser substituída por uma chamada a um modelo de linguagem.
- Caso volte a ser necessário um backend real com PostgreSQL, a pasta `backend/` já contém uma API Express + Prisma completa como ponto de partida.
