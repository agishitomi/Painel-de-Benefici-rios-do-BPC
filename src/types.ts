export interface Usuario {
  id: number;
  nome: string;
  email: string;
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

export interface UsuarioPapel {
  usuario_id: number;
  papel_id: number;
}

export interface PapelPermissao {
  papel_id: number;
  permissao_id: number;
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

export interface DbStatus {
  connected: boolean;
  mode: 'MYSQL_LIVE' | 'SQL_MEMORY_FALLBACK';
  engine: string;
  host: string;
  port: number;
  user: string;
  database: string;
  lastError: string | null;
  stats: {
    totalUsuarios: number;
    totalPapeis: number;
    totalPermissoes: number;
    totalBeneficiarios: number;
  };
}

export interface BeneficiariosResumo {
  totalGeral: number;
  idosos: number;
  pcd: number;
  regulares: number;
  emRevisao: number;
  bloqueados: number;
  pendenciaCadUnico: number;
  totalRepasseMensal: number;
}
