import jwt from 'jsonwebtoken';
import { FastifyRequest, FastifyReply } from 'fastify';

const JWT_SECRET = process.env.JWT_SECRET || 'bpc-recife-seguranca-jwt-2025-chave-mestra-recife-pe';
const JWT_EXPIRES_IN = '12h';

export interface AuthUserPayload {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  papeis: { id: number; nome: string }[];
  permissoes: string[];
}

export function generateJwtToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwtToken(token: string): AuthUserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}

export async function authenticateJwt(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({
      success: false,
      error: 'Acesso não autorizado. Cabeçalho Authorization com Bearer JWT é obrigatório.'
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  const decoded = verifyJwtToken(token);

  if (!decoded) {
    reply.status(401).send({
      success: false,
      error: 'Token JWT inválido, expirado ou corrompido. Faça login novamente.'
    });
    return;
  }

  if (!decoded.ativo) {
    reply.status(403).send({
      success: false,
      error: 'Conta de usuário desativada.'
    });
    return;
  }

  // Attach decoded user to the request object
  (request as any).user = decoded;
}
