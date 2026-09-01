import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  ativo: boolean;
  data_criacao: string;
  data_atualizacao: string;
  papeis?: number[];
  papeis_nomes?: string[];
}

export interface Papel {
  id: number;
  nome: string;
  descricao: string;
  data_criacao: string;
  data_atualizacao: string;
  permissoes?: number[];
  permissoes_nomes?: string[];
  total_usuarios?: number;
}

export interface Permissao {
  id: number;
  nome: string;
  descricao: string;
  data_criacao: string;
  data_atualizacao: string;
}

export interface BeneficiarioBPC {
  id: number;
  numero_beneficio: string;
  nis: string;
  nome_beneficiario: string;
  cpf_mascarado: string;
  tipo_beneficio: 'BPC_IDOSO' | 'BPC_PCD';
  bairro_recife: string;
  rpa_recife: string;
  valor_mensal: number;
  status_cadastral: 'REGULAR' | 'EM_REVISAO' | 'BLOQUEADO' | 'PENDENCIA_CADUNICO';
  cras_referencia: string;
  data_concessao: string;
  data_ultima_atualizacao: string;
}

// SQL DDL statements for MySQL
export const MYSQL_SCHEMA_DDL = `
-- ==========================================================
-- Banco de Dados: Painel de Beneficiário BPC do Recife
-- Entidades: usuarios, papeis, permissoes, usuario_papel, papel_permissao
-- ==========================================================

-- 1. Tabela: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela: papeis
CREATE TABLE IF NOT EXISTS papeis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela: permissoes
CREATE TABLE IF NOT EXISTS permissoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabela associativa: usuario_papel
CREATE TABLE IF NOT EXISTS usuario_papel (
  usuario_id INT NOT NULL,
  papel_id INT NOT NULL,
  PRIMARY KEY (usuario_id, papel_id),
  CONSTRAINT fk_up_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_up_papel FOREIGN KEY (papel_id) REFERENCES papeis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabela associativa: papel_permissao
CREATE TABLE IF NOT EXISTS papel_permissao (
  papel_id INT NOT NULL,
  permissao_id INT NOT NULL,
  PRIMARY KEY (papel_id, permissao_id),
  CONSTRAINT fk_pp_papel FOREIGN KEY (papel_id) REFERENCES papeis(id) ON DELETE CASCADE,
  CONSTRAINT fk_pp_permissao FOREIGN KEY (permissao_id) REFERENCES permissoes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabela de Beneficiários BPC do Recife (Dados do Sistema)
CREATE TABLE IF NOT EXISTS beneficiarios_bpc (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_beneficio VARCHAR(30) NOT NULL UNIQUE,
  nis VARCHAR(20) NOT NULL,
  nome_beneficiario VARCHAR(255) NOT NULL,
  cpf_mascarado VARCHAR(20) NOT NULL,
  tipo_beneficio ENUM('BPC_IDOSO', 'BPC_PCD') NOT NULL,
  bairro_recife VARCHAR(100) NOT NULL,
  rpa_recife VARCHAR(20) NOT NULL,
  valor_mensal DECIMAL(10,2) NOT NULL DEFAULT 1412.00,
  status_cadastral ENUM('REGULAR', 'EM_REVISAO', 'BLOQUEADO', 'PENDENCIA_CADUNICO') DEFAULT 'REGULAR',
  cras_referencia VARCHAR(150) NOT NULL,
  data_concessao DATE NOT NULL,
  data_ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// In-Memory dataset with Recife seed data
let memoryUsuarios: Usuario[] = [
  {
    id: 1,
    nome: 'Alberto Barbieri',
    email: 'alberto.barbieri@recife.pe.gov.br',
    senha: '$2a$10$X8m1ZsqJpXp9q8n6G3XFqeqj6GfR2v5yH7sU8rK9k0l1m2n3o4p5q', // hash for 'admin123'
    ativo: true,
    data_criacao: '2025-01-10 08:30:00',
    data_atualizacao: '2025-01-10 08:30:00',
    papeis: [1, 2],
    papeis_nomes: ['Administrador Geral', 'Gestor Municipal BPC']
  },
  {
    id: 2,
    nome: 'Dra. Maria Luiza Santos',
    email: 'maria.santos@recife.pe.gov.br',
    senha: '$2a$10$X8m1ZsqJpXp9q8n6G3XFqeqj6GfR2v5yH7sU8rK9k0l1m2n3o4p5q',
    ativo: true,
    data_criacao: '2025-01-15 09:15:00',
    data_atualizacao: '2025-01-15 09:15:00',
    papeis: [2],
    papeis_nomes: ['Gestor Municipal BPC']
  },
  {
    id: 3,
    nome: 'Carlos Eduardo Ferreira (CRAS Santo Amaro)',
    email: 'carlos.ferreira@recife.pe.gov.br',
    senha: '$2a$10$X8m1ZsqJpXp9q8n6G3XFqeqj6GfR2v5yH7sU8rK9k0l1m2n3o4p5q',
    ativo: true,
    data_criacao: '2025-02-01 10:00:00',
    data_atualizacao: '2025-02-01 10:00:00',
    papeis: [3],
    papeis_nomes: ['Assistente Social / CRAS']
  },
  {
    id: 4,
    nome: 'Juliana Mendes de Oliveira (Auditoria)',
    email: 'juliana.oliveira@recife.pe.gov.br',
    senha: '$2a$10$X8m1ZsqJpXp9q8n6G3XFqeqj6GfR2v5yH7sU8rK9k0l1m2n3o4p5q',
    ativo: true,
    data_criacao: '2025-02-12 14:20:00',
    data_atualizacao: '2025-02-12 14:20:00',
    papeis: [4],
    papeis_nomes: ['Auditor / Fiscal']
  },
  {
    id: 5,
    nome: 'Rafael Costa Albuquerque',
    email: 'rafael.albuquerque@recife.pe.gov.br',
    senha: '$2a$10$X8m1ZsqJpXp9q8n6G3XFqeqj6GfR2v5yH7sU8rK9k0l1m2n3o4p5q',
    ativo: false,
    data_criacao: '2025-03-01 11:45:00',
    data_atualizacao: '2025-04-10 16:30:00',
    papeis: [5],
    papeis_nomes: ['Consulta Básica']
  }
];

let memoryPapeis: Papel[] = [
  {
    id: 1,
    nome: 'Administrador Geral',
    descricao: 'Acesso irrestrito a todas as funções, controle de usuários, papéis, permissões e configurações do sistema.',
    data_criacao: '2025-01-01 08:00:00',
    data_atualizacao: '2025-01-01 08:00:00',
    permissoes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    permissoes_nomes: ['bpc:visualizar', 'bpc:cadastrar', 'bpc:editar', 'bpc:excluir', 'bpc:exportar', 'usuarios:gerenciar', 'papeis:gerenciar', 'permissoes:gerenciar', 'auditoria:visualizar', 'relatorios:gerenciais']
  },
  {
    id: 2,
    nome: 'Gestor Municipal BPC',
    descricao: 'Gestão da coordenação do BPC na Secretaria de Desenvolvimento Social do Recife, relatórios e auditorias.',
    data_criacao: '2025-01-01 08:00:00',
    data_atualizacao: '2025-01-01 08:00:00',
    permissoes: [1, 2, 3, 5, 9, 10],
    permissoes_nomes: ['bpc:visualizar', 'bpc:cadastrar', 'bpc:editar', 'bpc:exportar', 'auditoria:visualizar', 'relatorios:gerenciais']
  },
  {
    id: 3,
    nome: 'Assistente Social / CRAS',
    descricao: 'Acompanhamento territorial de beneficiários nos CRAS das RPAs do Recife, atualização cadastral e encaminhamentos.',
    data_criacao: '2025-01-01 08:00:00',
    data_atualizacao: '2025-01-01 08:00:00',
    permissoes: [1, 2, 3],
    permissoes_nomes: ['bpc:visualizar', 'bpc:cadastrar', 'bpc:editar']
  },
  {
    id: 4,
    nome: 'Auditor / Fiscal',
    descricao: 'Fiscalização de conformidade, cruzamento com CadÚnico e geração de pareceres de revisão cadastral.',
    data_criacao: '2025-01-01 08:00:00',
    data_atualizacao: '2025-01-01 08:00:00',
    permissoes: [1, 5, 9, 10],
    permissoes_nomes: ['bpc:visualizar', 'bpc:exportar', 'auditoria:visualizar', 'relatorios:gerenciais']
  },
  {
    id: 5,
    nome: 'Consulta Básica',
    descricao: 'Apenas visualização e consulta individual de informações públicas de beneficiários do BPC.',
    data_criacao: '2025-01-01 08:00:00',
    data_atualizacao: '2025-01-01 08:00:00',
    permissoes: [1],
    permissoes_nomes: ['bpc:visualizar']
  }
];

let memoryPermissoes: Permissao[] = [
  { id: 1, nome: 'bpc:visualizar', descricao: 'Permite visualizar fichas e lista de beneficiários do BPC Recife', data_criacao: '2025-01-01 08:00:00', data_atualizacao: '2025-01-01 08:00:00' },
  { id: 2, nome: 'bpc:cadastrar', descricao: 'Permite cadastrar novo registro de beneficiário ou solicitação BPC', data_criacao: '2025-01-01 08:00:00', data_atualizacao: '2025-01-01 08:00:00' },
  { id: 3, nome: 'bpc:editar', descricao: 'Permite atualizar dados territoriais, telefone, endereço e CRAS', data_criacao: '2025-01-01 08:00:00', data_atualizacao: '2025-01-01 08:00:00' },
  { id: 4, nome: 'bpc:excluir', descricao: 'Permite cancelar ou arquivar cadastros de beneficiários', data_criacao: '2025-01-01 08:00:00', data_atualizacao: '2025-01-01 08:00:00' },
  { id: 5, nome: 'bpc:exportar', descricao: 'Permite exportar dados para CSV, Excel e relatórios da Prefeitura', data_criacao: '2025-01-01 08:00:00', data_atualizacao: '2025-01-01 08:00:00' },
  { id: 6, nome: 'usuarios:gerenciar', descricao: 'Permite criar, editar, ativar e excluir usuários do sistema', data_criacao: '2025-01-01 08:00:00', data_atualizacao: '2025-01-01 08:00:00' },
  { id: 7, nome: 'papeis:gerenciar', descricao: 'Permite cadastrar novos papéis e alterar atribuições', data_criacao: '2025-01-01 08:00:00', data_atualizacao: '2025-01-01 08:00:00' },
  { id: 8, nome: 'permissoes:gerenciar', descricao: 'Permite gerenciar o catálogo de permissões do sistema', data_criacao: '2025-01-01 08:00:00', data_atualizacao: '2025-01-01 08:00:00' },
  { id: 9, nome: 'auditoria:visualizar', descricao: 'Permite inspecionar logs de alteração e revisões CadÚnico', data_criacao: '2025-01-01 08:00:00', data_atualizacao: '2025-01-01 08:00:00' },
  { id: 10, nome: 'relatorios:gerenciais', descricao: 'Permite acesso aos gráficos e indicadores territoriais de Recife', data_criacao: '2025-01-01 08:00:00', data_atualizacao: '2025-01-01 08:00:00' }
];

let memoryUsuarioPapel: { usuario_id: number; papel_id: number }[] = [
  { usuario_id: 1, papel_id: 1 },
  { usuario_id: 1, papel_id: 2 },
  { usuario_id: 2, papel_id: 2 },
  { usuario_id: 3, papel_id: 3 },
  { usuario_id: 4, papel_id: 4 },
  { usuario_id: 5, papel_id: 5 }
];

let memoryPapelPermissao: { papel_id: number; permissao_id: number }[] = [
  { papel_id: 1, permissao_id: 1 },
  { papel_id: 1, permissao_id: 2 },
  { papel_id: 1, permissao_id: 3 },
  { papel_id: 1, permissao_id: 4 },
  { papel_id: 1, permissao_id: 5 },
  { papel_id: 1, permissao_id: 6 },
  { papel_id: 1, permissao_id: 7 },
  { papel_id: 1, permissao_id: 8 },
  { papel_id: 1, permissao_id: 9 },
  { papel_id: 1, permissao_id: 10 },
  { papel_id: 2, permissao_id: 1 },
  { papel_id: 2, permissao_id: 2 },
  { papel_id: 2, permissao_id: 3 },
  { papel_id: 2, permissao_id: 5 },
  { papel_id: 2, permissao_id: 9 },
  { papel_id: 2, permissao_id: 10 },
  { papel_id: 3, permissao_id: 1 },
  { papel_id: 3, permissao_id: 2 },
  { papel_id: 3, permissao_id: 3 },
  { papel_id: 4, permissao_id: 1 },
  { papel_id: 4, permissao_id: 5 },
  { papel_id: 4, permissao_id: 9 },
  { papel_id: 4, permissao_id: 10 },
  { papel_id: 5, permissao_id: 1 }
];

let memoryBeneficiarios: BeneficiarioBPC[] = [
  {
    id: 1,
    numero_beneficio: '870.192.831-2',
    nis: '128.94821.90-3',
    nome_beneficiario: 'Severina Maria de Jesus Cavalcanti',
    cpf_mascarado: '***.482.194-**',
    tipo_beneficio: 'BPC_IDOSO',
    bairro_recife: 'Casa Amarela',
    rpa_recife: 'RPA 3',
    valor_mensal: 1412.00,
    status_cadastral: 'REGULAR',
    cras_referencia: 'CRAS Alto do Mandu / Casa Amarela',
    data_concessao: '2018-04-12',
    data_ultima_atualizacao: '2025-02-10 10:14:00'
  },
  {
    id: 2,
    numero_beneficio: '870.928.110-8',
    nis: '160.33910.12-4',
    nome_beneficiario: 'José Manoel da Silva Filho',
    cpf_mascarado: '***.319.484-**',
    tipo_beneficio: 'BPC_PCD',
    bairro_recife: 'Ibura de Cima',
    rpa_recife: 'RPA 6',
    valor_mensal: 1412.00,
    status_cadastral: 'REGULAR',
    cras_referencia: 'CRAS Ibura (Cohab)',
    data_concessao: '2020-08-19',
    data_ultima_atualizacao: '2025-01-22 14:05:00'
  },
  {
    id: 3,
    numero_beneficio: '871.492.302-1',
    nis: '201.88412.09-8',
    nome_beneficiario: 'Maria das Graças Bezerra',
    cpf_mascarado: '***.892.304-**',
    tipo_beneficio: 'BPC_IDOSO',
    bairro_recife: 'Várzea',
    rpa_recife: 'RPA 4',
    valor_mensal: 1412.00,
    status_cadastral: 'EM_REVISAO',
    cras_referencia: 'CRAS Várzea / CDU',
    data_concessao: '2016-11-05',
    data_ultima_atualizacao: '2025-02-28 09:30:00'
  },
  {
    id: 4,
    numero_beneficio: '872.109.844-5',
    nis: '139.48201.99-2',
    nome_beneficiario: 'Antônio Francisco de Oliveira',
    cpf_mascarado: '***.194.204-**',
    tipo_beneficio: 'BPC_PCD',
    bairro_recife: 'Santo Amaro',
    rpa_recife: 'RPA 1',
    valor_mensal: 1412.00,
    status_cadastral: 'REGULAR',
    cras_referencia: 'CRAS Santo Amaro / Recife Antigo',
    data_concessao: '2021-02-14',
    data_ultima_atualizacao: '2025-03-01 11:20:00'
  },
  {
    id: 5,
    numero_beneficio: '873.819.201-9',
    nis: '172.93019.44-1',
    nome_beneficiario: 'Francisca Raimunda dos Anjos',
    cpf_mascarado: '***.671.024-**',
    tipo_beneficio: 'BPC_IDOSO',
    bairro_recife: 'Afogados',
    rpa_recife: 'RPA 5',
    valor_mensal: 1412.00,
    status_cadastral: 'PENDENCIA_CADUNICO',
    cras_referencia: 'CRAS Afogados / San Martin',
    data_concessao: '2019-07-22',
    data_ultima_atualizacao: '2025-02-15 16:45:00'
  },
  {
    id: 6,
    numero_beneficio: '874.552.190-3',
    nis: '180.99120.31-7',
    nome_beneficiario: 'Luiz Carlos de Albuquerque',
    cpf_mascarado: '***.551.904-**',
    tipo_beneficio: 'BPC_PCD',
    bairro_recife: 'Boa Viagem (Comunidade Entra Apulso)',
    rpa_recife: 'RPA 6',
    valor_mensal: 1412.00,
    status_cadastral: 'REGULAR',
    cras_referencia: 'CRAS Boa Viagem / Pina',
    data_concessao: '2022-05-10',
    data_ultima_atualizacao: '2025-01-30 15:10:00'
  },
  {
    id: 7,
    numero_beneficio: '875.120.941-6',
    nis: '194.20481.55-9',
    nome_beneficiario: 'Terezinha de Fátima Lima',
    cpf_mascarado: '***.204.814-**',
    tipo_beneficio: 'BPC_IDOSO',
    bairro_recife: 'Dois Irmãos',
    rpa_recife: 'RPA 3',
    valor_mensal: 1412.00,
    status_cadastral: 'REGULAR',
    cras_referencia: 'CRAS Dois Irmãos / Guabiraba',
    data_concessao: '2017-09-18',
    data_ultima_atualizacao: '2025-02-05 10:50:00'
  },
  {
    id: 8,
    numero_beneficio: '876.331.092-7',
    nis: '144.90128.77-3',
    nome_beneficiario: 'Marcio Rogério Souza',
    cpf_mascarado: '***.901.284-**',
    tipo_beneficio: 'BPC_PCD',
    bairro_recife: 'Água Fria',
    rpa_recife: 'RPA 2',
    valor_mensal: 1412.00,
    status_cadastral: 'BLOQUEADO',
    cras_referencia: 'CRAS Água Fria / Arruda',
    data_concessao: '2021-10-01',
    data_ultima_atualizacao: '2025-03-02 08:40:00'
  }
];

let nextUserId = 6;
let nextPapelId = 6;
let nextPermissaoId = 11;
let nextBeneficiarioId = 9;

// MySQL Pool setup (Lazy initialization)
let pool: mysql.Pool | null = null;
let isConnectedToMySQL = false;
let lastDbError: string | null = null;

export function getDbConfig() {
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'bpc_recife_db';
  const uri = process.env.DATABASE_URL || '';

  return { host, port, user, password, database, uri };
}

export async function initDbConnection() {
  const config = getDbConfig();
  
  try {
    if (config.uri) {
      pool = mysql.createPool(config.uri);
    } else if (process.env.MYSQL_HOST || process.env.MYSQL_DATABASE) {
      pool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 3000
      });
    }

    if (pool) {
      const connection = await pool.getConnection();
      isConnectedToMySQL = true;
      lastDbError = null;
      console.log(`[MySQL] Conexão estabelecida com sucesso no banco ${config.database}!`);
      
      // Auto create tables if connected to live MySQL
      try {
        const statements = MYSQL_SCHEMA_DDL
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (const sql of statements) {
          await connection.query(sql);
        }
        console.log('[MySQL] Tabelas verificadas/criadas com sucesso.');
      } catch (err: any) {
        console.warn('[MySQL] Aviso ao inicializar schema DDL:', err.message);
      } finally {
        connection.release();
      }
    } else {
      isConnectedToMySQL = false;
    }
  } catch (error: any) {
    isConnectedToMySQL = false;
    lastDbError = error.message || 'Falha ao conectar no servidor MySQL';
    console.warn(`[MySQL] Modo Standby / Fallback ativo: ${lastDbError}. Operando com motor SQL em memória com dados semente do Recife.`);
  }
}

export function getDbStatus() {
  const config = getDbConfig();
  return {
    connected: isConnectedToMySQL,
    mode: isConnectedToMySQL ? 'MYSQL_LIVE' : 'SQL_MEMORY_FALLBACK',
    engine: 'MySQL / Fastify Node.js',
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
    lastError: lastDbError,
    stats: {
      totalUsuarios: memoryUsuarios.length,
      totalPapeis: memoryPapeis.length,
      totalPermissoes: memoryPermissoes.length,
      totalBeneficiarios: memoryBeneficiarios.length
    }
  };
}

// ----------------------------------------------------
// ENTITY: USUARIOS
// ----------------------------------------------------
export async function getUsuarios(): Promise<Usuario[]> {
  if (isConnectedToMySQL && pool) {
    try {
      const [rows] = await pool.query<any[]>(`
        SELECT u.id, u.nome, u.email, u.ativo, u.data_criacao, u.data_atualizacao,
               GROUP_CONCAT(p.nome SEPARATOR ', ') as papeis_nomes_str,
               GROUP_CONCAT(p.id) as papeis_ids_str
        FROM usuarios u
        LEFT JOIN usuario_papel up ON u.id = up.usuario_id
        LEFT JOIN papeis p ON up.papel_id = p.id
        GROUP BY u.id
        ORDER BY u.id ASC
      `);
      return rows.map(r => ({
        id: r.id,
        nome: r.nome,
        email: r.email,
        ativo: Boolean(r.ativo),
        data_criacao: r.data_criacao ? new Date(r.data_criacao).toISOString().replace('T', ' ').substring(0, 19) : '',
        data_atualizacao: r.data_atualizacao ? new Date(r.data_atualizacao).toISOString().replace('T', ' ').substring(0, 19) : '',
        papeis: r.papeis_ids_str ? r.papeis_ids_str.split(',').map(Number) : [],
        papeis_nomes: r.papeis_nomes_str ? r.papeis_nomes_str.split(', ') : []
      }));
    } catch (err: any) {
      console.error('[MySQL Error] getUsuarios:', err.message);
    }
  }

  // Fallback to memory
  return memoryUsuarios.map(u => {
    const papeisIds = memoryUsuarioPapel.filter(up => up.usuario_id === u.id).map(up => up.papel_id);
    const papeisNomes = memoryPapeis.filter(p => papeisIds.includes(p.id)).map(p => p.nome);
    return {
      ...u,
      papeis: papeisIds,
      papeis_nomes: papeisNomes
    };
  });
}

export async function createUsuario(data: { nome: string; email: string; senha?: string; ativo?: boolean; papeis?: number[] }): Promise<Usuario> {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const hashedPassword = data.senha ? await bcrypt.hash(data.senha, 10) : await bcrypt.hash('Recife@2025', 10);
  const ativo = data.ativo !== undefined ? data.ativo : true;

  if (isConnectedToMySQL && pool) {
    try {
      const [res]: any = await pool.query(
        'INSERT INTO usuarios (nome, email, senha, ativo, data_criacao, data_atualizacao) VALUES (?, ?, ?, ?, ?, ?)',
        [data.nome, data.email, hashedPassword, ativo, now, now]
      );
      const newId = res.insertId;
      if (data.papeis && data.papeis.length > 0) {
        for (const papelId of data.papeis) {
          await pool.query('INSERT IGNORE INTO usuario_papel (usuario_id, papel_id) VALUES (?, ?)', [newId, papelId]);
        }
      }
      const users = await getUsuarios();
      return users.find(u => u.id === newId) || {
        id: newId,
        nome: data.nome,
        email: data.email,
        ativo,
        data_criacao: now,
        data_atualizacao: now,
        papeis: data.papeis || []
      };
    } catch (err: any) {
      console.error('[MySQL Error] createUsuario:', err.message);
      throw err;
    }
  }

  // Check email uniqueness in memory
  if (memoryUsuarios.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error(`Email "${data.email}" já está cadastrado no sistema.`);
  }

  const newUser: Usuario = {
    id: nextUserId++,
    nome: data.nome,
    email: data.email,
    senha: hashedPassword,
    ativo,
    data_criacao: now,
    data_atualizacao: now,
    papeis: data.papeis || []
  };

  memoryUsuarios.push(newUser);

  if (data.papeis && data.papeis.length > 0) {
    for (const papelId of data.papeis) {
      memoryUsuarioPapel.push({ usuario_id: newUser.id, papel_id: papelId });
    }
  }

  const papeisNomes = memoryPapeis.filter(p => (data.papeis || []).includes(p.id)).map(p => p.nome);
  newUser.papeis_nomes = papeisNomes;
  return newUser;
}

export async function updateUsuario(id: number, data: { nome?: string; email?: string; senha?: string; ativo?: boolean; papeis?: number[] }): Promise<Usuario> {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (isConnectedToMySQL && pool) {
    try {
      if (data.senha) {
        const hashedPassword = await bcrypt.hash(data.senha, 10);
        await pool.query('UPDATE usuarios SET nome = COALESCE(?, nome), email = COALESCE(?, email), senha = ?, ativo = COALESCE(?, ativo), data_atualizacao = ? WHERE id = ?', [
          data.nome ?? null,
          data.email ?? null,
          hashedPassword,
          data.ativo !== undefined ? data.ativo : null,
          now,
          id
        ]);
      } else {
        await pool.query('UPDATE usuarios SET nome = COALESCE(?, nome), email = COALESCE(?, email), ativo = COALESCE(?, ativo), data_atualizacao = ? WHERE id = ?', [
          data.nome ?? null,
          data.email ?? null,
          data.ativo !== undefined ? data.ativo : null,
          now,
          id
        ]);
      }

      if (data.papeis !== undefined) {
        await pool.query('DELETE FROM usuario_papel WHERE usuario_id = ?', [id]);
        for (const papelId of data.papeis) {
          await pool.query('INSERT INTO usuario_papel (usuario_id, papel_id) VALUES (?, ?)', [id, papelId]);
        }
      }

      const users = await getUsuarios();
      const user = users.find(u => u.id === id);
      if (!user) throw new Error(`Usuário ID ${id} não encontrado.`);
      return user;
    } catch (err: any) {
      console.error('[MySQL Error] updateUsuario:', err.message);
      throw err;
    }
  }

  // Memory update
  const user = memoryUsuarios.find(u => u.id === id);
  if (!user) throw new Error(`Usuário ID ${id} não encontrado.`);

  if (data.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
    if (memoryUsuarios.some(u => u.id !== id && u.email.toLowerCase() === data.email!.toLowerCase())) {
      throw new Error(`Email "${data.email}" já está em uso por outro usuário.`);
    }
    user.email = data.email;
  }

  if (data.nome !== undefined) user.nome = data.nome;
  if (data.ativo !== undefined) user.ativo = data.ativo;
  if (data.senha) user.senha = await bcrypt.hash(data.senha, 10);
  user.data_atualizacao = now;

  if (data.papeis !== undefined) {
    memoryUsuarioPapel = memoryUsuarioPapel.filter(up => up.usuario_id !== id);
    for (const papelId of data.papeis) {
      memoryUsuarioPapel.push({ usuario_id: id, papel_id: papelId });
    }
    user.papeis = data.papeis;
    user.papeis_nomes = memoryPapeis.filter(p => data.papeis!.includes(p.id)).map(p => p.nome);
  }

  return user;
}

export async function deleteUsuario(id: number): Promise<boolean> {
  if (isConnectedToMySQL && pool) {
    try {
      await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
      return true;
    } catch (err: any) {
      console.error('[MySQL Error] deleteUsuario:', err.message);
      throw err;
    }
  }

  const initialLen = memoryUsuarios.length;
  memoryUsuarios = memoryUsuarios.filter(u => u.id !== id);
  memoryUsuarioPapel = memoryUsuarioPapel.filter(up => up.usuario_id !== id);
  return memoryUsuarios.length < initialLen;
}

// ----------------------------------------------------
// ENTITY: PAPEIS & PERMISSOES
// ----------------------------------------------------
export async function getPapeis(): Promise<Papel[]> {
  if (isConnectedToMySQL && pool) {
    try {
      const [rows] = await pool.query<any[]>(`
        SELECT p.id, p.nome, p.descricao, p.data_criacao, p.data_atualizacao,
               GROUP_CONCAT(perm.nome SEPARATOR ', ') as permissoes_nomes_str,
               GROUP_CONCAT(perm.id) as permissoes_ids_str,
               (SELECT COUNT(DISTINCT up.usuario_id) FROM usuario_papel up WHERE up.papel_id = p.id) as total_usuarios
        FROM papeis p
        LEFT JOIN papel_permissao pp ON p.id = pp.papel_id
        LEFT JOIN permissoes perm ON pp.permissao_id = perm.id
        GROUP BY p.id
        ORDER BY p.id ASC
      `);
      return rows.map(r => ({
        id: r.id,
        nome: r.nome,
        descricao: r.descricao || '',
        data_criacao: r.data_criacao ? new Date(r.data_criacao).toISOString().replace('T', ' ').substring(0, 19) : '',
        data_atualizacao: r.data_atualizacao ? new Date(r.data_atualizacao).toISOString().replace('T', ' ').substring(0, 19) : '',
        permissoes: r.permissoes_ids_str ? r.permissoes_ids_str.split(',').map(Number) : [],
        permissoes_nomes: r.permissoes_nomes_str ? r.permissoes_nomes_str.split(', ') : [],
        total_usuarios: Number(r.total_usuarios || 0)
      }));
    } catch (err: any) {
      console.error('[MySQL Error] getPapeis:', err.message);
    }
  }

  return memoryPapeis.map(p => {
    const permIds = memoryPapelPermissao.filter(pp => pp.papel_id === p.id).map(pp => pp.permissao_id);
    const permNomes = memoryPermissoes.filter(perm => permIds.includes(perm.id)).map(perm => perm.nome);
    const totalUsers = memoryUsuarioPapel.filter(up => up.papel_id === p.id).length;
    return {
      ...p,
      permissoes: permIds,
      permissoes_nomes: permNomes,
      total_usuarios: totalUsers
    };
  });
}

export async function createPapel(data: { nome: string; descricao?: string; permissoes?: number[] }): Promise<Papel> {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (isConnectedToMySQL && pool) {
    try {
      const [res]: any = await pool.query(
        'INSERT INTO papeis (nome, descricao, data_criacao, data_atualizacao) VALUES (?, ?, ?, ?)',
        [data.nome, data.descricao || '', now, now]
      );
      const newId = res.insertId;
      if (data.permissoes && data.permissoes.length > 0) {
        for (const permId of data.permissoes) {
          await pool.query('INSERT IGNORE INTO papel_permissao (papel_id, permissao_id) VALUES (?, ?)', [newId, permId]);
        }
      }
      const papeis = await getPapeis();
      return papeis.find(p => p.id === newId) || {
        id: newId,
        nome: data.nome,
        descricao: data.descricao || '',
        data_criacao: now,
        data_atualizacao: now,
        permissoes: data.permissoes || []
      };
    } catch (err: any) {
      console.error('[MySQL Error] createPapel:', err.message);
      throw err;
    }
  }

  if (memoryPapeis.some(p => p.nome.toLowerCase() === data.nome.toLowerCase())) {
    throw new Error(`Papel com o nome "${data.nome}" já existe.`);
  }

  const newPapel: Papel = {
    id: nextPapelId++,
    nome: data.nome,
    descricao: data.descricao || '',
    data_criacao: now,
    data_atualizacao: now,
    permissoes: data.permissoes || []
  };

  memoryPapeis.push(newPapel);

  if (data.permissoes && data.permissoes.length > 0) {
    for (const permId of data.permissoes) {
      memoryPapelPermissao.push({ papel_id: newPapel.id, permissao_id: permId });
    }
  }

  newPapel.permissoes_nomes = memoryPermissoes.filter(perm => (data.permissoes || []).includes(perm.id)).map(perm => perm.nome);
  newPapel.total_usuarios = 0;
  return newPapel;
}

export async function updatePapel(id: number, data: { nome?: string; descricao?: string; permissoes?: number[] }): Promise<Papel> {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (isConnectedToMySQL && pool) {
    try {
      await pool.query('UPDATE papeis SET nome = COALESCE(?, nome), descricao = COALESCE(?, descricao), data_atualizacao = ? WHERE id = ?', [
        data.nome ?? null,
        data.descricao ?? null,
        now,
        id
      ]);

      if (data.permissoes !== undefined) {
        await pool.query('DELETE FROM papel_permissao WHERE papel_id = ?', [id]);
        for (const permId of data.permissoes) {
          await pool.query('INSERT INTO papel_permissao (papel_id, permissao_id) VALUES (?, ?)', [id, permId]);
        }
      }

      const papeis = await getPapeis();
      const papel = papeis.find(p => p.id === id);
      if (!papel) throw new Error(`Papel ID ${id} não encontrado.`);
      return papel;
    } catch (err: any) {
      console.error('[MySQL Error] updatePapel:', err.message);
      throw err;
    }
  }

  const papel = memoryPapeis.find(p => p.id === id);
  if (!papel) throw new Error(`Papel ID ${id} não encontrado.`);

  if (data.nome !== undefined) papel.nome = data.nome;
  if (data.descricao !== undefined) papel.descricao = data.descricao;
  papel.data_atualizacao = now;

  if (data.permissoes !== undefined) {
    memoryPapelPermissao = memoryPapelPermissao.filter(pp => pp.papel_id !== id);
    for (const permId of data.permissoes) {
      memoryPapelPermissao.push({ papel_id: id, permissao_id: permId });
    }
    papel.permissoes = data.permissoes;
    papel.permissoes_nomes = memoryPermissoes.filter(perm => data.permissoes!.includes(perm.id)).map(perm => perm.nome);
  }

  return papel;
}

export async function deletePapel(id: number): Promise<boolean> {
  if (isConnectedToMySQL && pool) {
    try {
      await pool.query('DELETE FROM papeis WHERE id = ?', [id]);
      return true;
    } catch (err: any) {
      console.error('[MySQL Error] deletePapel:', err.message);
      throw err;
    }
  }

  const initialLen = memoryPapeis.length;
  memoryPapeis = memoryPapeis.filter(p => p.id !== id);
  memoryPapelPermissao = memoryPapelPermissao.filter(pp => pp.papel_id !== id);
  memoryUsuarioPapel = memoryUsuarioPapel.filter(up => up.papel_id !== id);
  return memoryPapeis.length < initialLen;
}

export async function getPermissoes(): Promise<Permissao[]> {
  if (isConnectedToMySQL && pool) {
    try {
      const [rows] = await pool.query<any[]>('SELECT id, nome, descricao, data_criacao, data_atualizacao FROM permissoes ORDER BY id ASC');
      return rows.map(r => ({
        id: r.id,
        nome: r.nome,
        descricao: r.descricao || '',
        data_criacao: r.data_criacao ? new Date(r.data_criacao).toISOString().replace('T', ' ').substring(0, 19) : '',
        data_atualizacao: r.data_atualizacao ? new Date(r.data_atualizacao).toISOString().replace('T', ' ').substring(0, 19) : ''
      }));
    } catch (err: any) {
      console.error('[MySQL Error] getPermissoes:', err.message);
    }
  }
  return [...memoryPermissoes];
}

export async function createPermissao(data: { nome: string; descricao?: string }): Promise<Permissao> {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (isConnectedToMySQL && pool) {
    try {
      const [res]: any = await pool.query(
        'INSERT INTO permissoes (nome, descricao, data_criacao, data_atualizacao) VALUES (?, ?, ?, ?)',
        [data.nome, data.descricao || '', now, now]
      );
      return {
        id: res.insertId,
        nome: data.nome,
        descricao: data.descricao || '',
        data_criacao: now,
        data_atualizacao: now
      };
    } catch (err: any) {
      console.error('[MySQL Error] createPermissao:', err.message);
      throw err;
    }
  }

  if (memoryPermissoes.some(p => p.nome.toLowerCase() === data.nome.toLowerCase())) {
    throw new Error(`Permissão com o identificador "${data.nome}" já existe.`);
  }

  const newPerm: Permissao = {
    id: nextPermissaoId++,
    nome: data.nome,
    descricao: data.descricao || '',
    data_criacao: now,
    data_atualizacao: now
  };

  memoryPermissoes.push(newPerm);
  return newPerm;
}

export async function deletePermissao(id: number): Promise<boolean> {
  if (isConnectedToMySQL && pool) {
    try {
      await pool.query('DELETE FROM permissoes WHERE id = ?', [id]);
      return true;
    } catch (err: any) {
      console.error('[MySQL Error] deletePermissao:', err.message);
      throw err;
    }
  }

  const initialLen = memoryPermissoes.length;
  memoryPermissoes = memoryPermissoes.filter(p => p.id !== id);
  memoryPapelPermissao = memoryPapelPermissao.filter(pp => pp.permissao_id !== id);
  return memoryPermissoes.length < initialLen;
}

// ----------------------------------------------------
// ENTITY: BENEFICIARIOS BPC RECIFE
// ----------------------------------------------------
export async function getBeneficiariosBPC(filters?: { query?: string; tipo?: string; status?: string; rpa?: string }): Promise<BeneficiarioBPC[]> {
  let list = [...memoryBeneficiarios];

  if (filters?.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(b => 
      b.nome_beneficiario.toLowerCase().includes(q) ||
      b.numero_beneficio.includes(q) ||
      b.nis.includes(q) ||
      b.bairro_recife.toLowerCase().includes(q) ||
      b.cras_referencia.toLowerCase().includes(q)
    );
  }

  if (filters?.tipo && filters.tipo !== 'TODOS') {
    list = list.filter(b => b.tipo_beneficio === filters.tipo);
  }

  if (filters?.status && filters.status !== 'TODOS') {
    list = list.filter(b => b.status_cadastral === filters.status);
  }

  if (filters?.rpa && filters.rpa !== 'TODOS') {
    list = list.filter(b => b.rpa_recife === filters.rpa);
  }

  return list;
}

export async function createBeneficiarioBPC(data: Omit<BeneficiarioBPC, 'id' | 'data_ultima_atualizacao'>): Promise<BeneficiarioBPC> {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newBenef: BeneficiarioBPC = {
    ...data,
    id: nextBeneficiarioId++,
    data_ultima_atualizacao: now
  };
  memoryBeneficiarios.unshift(newBenef);
  return newBenef;
}
