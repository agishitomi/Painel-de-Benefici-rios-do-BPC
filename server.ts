import Fastify from 'fastify';
import cors from '@fastify/cors';
import middie from '@fastify/middie';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { registerApiRoutes } from './server/routes.js';
import { initDbConnection } from './server/db.js';

async function startServer() {
  const fastify = Fastify({
    logger: false
  });

  // CORS support
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // Register API endpoints
  await registerApiRoutes(fastify);

  // Attempt connection to MySQL (or fallback gracefully to memory)
  initDbConnection().catch(err => {
    console.warn('[MySQL Initialization]', err);
  });

  // Dev mode vs Production static hosting
  if (process.env.NODE_ENV !== 'production') {
    await fastify.register(middie);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    fastify.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    await fastify.register(fastifyStatic, {
      root: distPath,
      prefix: '/'
    });
    fastify.setNotFoundHandler((request, reply) => {
      reply.sendFile('index.html');
    });
  }

  const PORT = 3000;
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[Fastify Server] Servidor BPC Recife ativo em http://0.0.0.0:${PORT}`);
}

startServer().catch(err => {
  console.error('Erro fatal ao iniciar servidor Fastify:', err);
  process.exit(1);
});
