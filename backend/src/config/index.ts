import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  dataSource: (process.env.DATA_SOURCE ?? 'memory') as 'memory' | 'prisma',
  authMode: (process.env.AUTH_MODE ?? 'mock') as 'mock' | 'entra',
  azureAd: {
    tenantId: process.env.AZURE_AD_TENANT_ID ?? '',
    clientId: process.env.AZURE_AD_CLIENT_ID ?? '',
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? '',
  },
  uploadsDir: process.env.UPLOADS_DIR ?? 'uploads',
};
