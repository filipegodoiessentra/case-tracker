// Middleware de autenticação.
// - AUTH_MODE=mock (padrão): não exige token, injeta um usuário demo — permite
//   rodar e demonstrar o app completo sem Azure AD configurado.
// - AUTH_MODE=entra: valida o token JWT emitido pelo Microsoft Entra ID (Azure AD)
//   usando as chaves públicas (JWKS) do tenant configurado.
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { config } from '../config';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const MOCK_USER: AuthenticatedUser = {
  id: 'u1',
  name: 'Filipe Godoi',
  email: 'filipe.godoi@essentra.com',
  roles: ['Analyst', 'CommercialAnalyst'],
};

const jwks = config.azureAd.tenantId
  ? jwksClient({
      jwksUri: `https://login.microsoftonline.com/${config.azureAd.tenantId}/discovery/v2.0/keys`,
    })
  : null;

function getSigningKey(kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!jwks) return reject(new Error('Entra ID não configurado (AZURE_AD_TENANT_ID ausente).'));
    jwks.getSigningKey(kid, (err, key) => {
      if (err || !key) return reject(err ?? new Error('Chave de assinatura não encontrada.'));
      resolve(key.getPublicKey());
    });
  });
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (config.authMode === 'mock') {
    req.user = MOCK_USER;
    return next();
  }

  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação ausente.' });
    }
    const token = header.substring('Bearer '.length);
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || typeof decodedHeader === 'string') {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    const signingKey = await getSigningKey(decodedHeader.header.kid ?? '');
    const payload = jwt.verify(token, signingKey, {
      audience: config.azureAd.clientId,
      issuer: `https://login.microsoftonline.com/${config.azureAd.tenantId}/v2.0`,
    }) as jwt.JwtPayload;

    req.user = {
      id: payload.oid ?? payload.sub ?? 'unknown',
      name: payload.name ?? 'Usuário Entra ID',
      email: payload.preferred_username ?? payload.email ?? '',
      roles: (payload.roles as string[]) ?? [],
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Falha na validação do token Entra ID.', details: (err as Error).message });
  }
}
