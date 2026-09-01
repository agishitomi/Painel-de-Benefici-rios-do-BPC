import { Usuario, Papel, Permissao, BeneficiarioBPC, DbStatus, BeneficiariosResumo } from './types';

const API_BASE = '/api';

async function safeFetchJson<T>(url: string, options?: RequestInit, defaultErrMsg = 'Erro na requisição'): Promise<T> {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  
  if (contentType.includes('application/json')) {
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || `${defaultErrMsg} (Status ${res.status})`);
    }
    return json;
  }

  if (!res.ok) {
    throw new Error(`${defaultErrMsg} (Status ${res.status})`);
  }

  throw new Error('Resposta do servidor inesperada (não-JSON).');
}

export async function getDbStatus(): Promise<DbStatus> {
  return safeFetchJson<DbStatus>(`${API_BASE}/db-status`, undefined, 'Erro ao obter status do banco');
}

export async function testDbConnection(): Promise<DbStatus> {
  return safeFetchJson<DbStatus>(`${API_BASE}/db-test-connection`, { method: 'POST' }, 'Erro ao testar conexão MySQL');
}

export async function getSchemaSql(): Promise<{ sql: string; entities: { name: string; columns: string[] }[] }> {
  return safeFetchJson<{ sql: string; entities: { name: string; columns: string[] }[] }>(`${API_BASE}/schema/sql`, undefined, 'Erro ao carregar schema DDL');
}

export async function getUsuarios(): Promise<Usuario[]> {
  const data = await safeFetchJson<{ success: boolean; data: Usuario[]; error?: string }>(`${API_BASE}/usuarios`, undefined, 'Erro ao buscar usuários');
  if (!data.success) throw new Error(data.error || 'Erro ao buscar usuários');
  return data.data;
}

export async function createUsuario(payload: { nome: string; email: string; senha?: string; ativo?: boolean; papeis?: number[] }): Promise<Usuario> {
  const data = await safeFetchJson<{ success: boolean; data: Usuario[]; error?: string }>(`${API_BASE}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Erro ao cadastrar usuário');
  if (!data.success) throw new Error(data.error || 'Erro ao cadastrar usuário');
  return data.data as unknown as Usuario;
}

export async function updateUsuario(id: number, payload: { nome?: string; email?: string; senha?: string; ativo?: boolean; papeis?: number[] }): Promise<Usuario> {
  const data = await safeFetchJson<{ success: boolean; data: Usuario; error?: string }>(`${API_BASE}/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Erro ao atualizar usuário');
  if (!data.success) throw new Error(data.error || 'Erro ao atualizar usuário');
  return data.data;
}

export async function deleteUsuario(id: number): Promise<boolean> {
  const data = await safeFetchJson<{ success: boolean; error?: string }>(`${API_BASE}/usuarios/${id}`, {
    method: 'DELETE'
  }, 'Erro ao excluir usuário');
  if (!data.success) throw new Error(data.error || 'Erro ao excluir usuário');
  return data.success;
}

export async function getPapeis(): Promise<Papel[]> {
  const data = await safeFetchJson<{ success: boolean; data: Papel[]; error?: string }>(`${API_BASE}/papeis`, undefined, 'Erro ao buscar papéis');
  if (!data.success) throw new Error(data.error || 'Erro ao buscar papéis');
  return data.data;
}

export async function createPapel(payload: { nome: string; descricao?: string; permissoes?: number[] }): Promise<Papel> {
  const data = await safeFetchJson<{ success: boolean; data: Papel; error?: string }>(`${API_BASE}/papeis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Erro ao cadastrar papel');
  if (!data.success) throw new Error(data.error || 'Erro ao cadastrar papel');
  return data.data;
}

export async function updatePapel(id: number, payload: { nome?: string; descricao?: string; permissoes?: number[] }): Promise<Papel> {
  const data = await safeFetchJson<{ success: boolean; data: Papel; error?: string }>(`${API_BASE}/papeis/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Erro ao atualizar papel');
  if (!data.success) throw new Error(data.error || 'Erro ao atualizar papel');
  return data.data;
}

export async function deletePapel(id: number): Promise<boolean> {
  const data = await safeFetchJson<{ success: boolean; error?: string }>(`${API_BASE}/papeis/${id}`, {
    method: 'DELETE'
  }, 'Erro ao excluir papel');
  if (!data.success) throw new Error(data.error || 'Erro ao excluir papel');
  return data.success;
}

export async function getPermissoes(): Promise<Permissao[]> {
  const data = await safeFetchJson<{ success: boolean; data: Permissao[]; error?: string }>(`${API_BASE}/permissoes`, undefined, 'Erro ao buscar permissões');
  if (!data.success) throw new Error(data.error || 'Erro ao buscar permissões');
  return data.data;
}

export async function createPermissao(payload: { nome: string; descricao?: string }): Promise<Permissao> {
  const data = await safeFetchJson<{ success: boolean; data: Permissao; error?: string }>(`${API_BASE}/permissoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Erro ao criar permissão');
  if (!data.success) throw new Error(data.error || 'Erro ao criar permissão');
  return data.data;
}

export async function deletePermissao(id: number): Promise<boolean> {
  const data = await safeFetchJson<{ success: boolean; error?: string }>(`${API_BASE}/permissoes/${id}`, {
    method: 'DELETE'
  }, 'Erro ao excluir permissão');
  if (!data.success) throw new Error(data.error || 'Erro ao excluir permissão');
  return data.success;
}

export async function getBeneficiariosBPC(filters?: { query?: string; tipo?: string; status?: string; rpa?: string }): Promise<{ data: BeneficiarioBPC[]; total: number; resumo: BeneficiariosResumo }> {
  const params = new URLSearchParams();
  if (filters?.query) params.set('query', filters.query);
  if (filters?.tipo && filters.tipo !== 'TODOS') params.set('tipo', filters.tipo);
  if (filters?.status && filters.status !== 'TODOS') params.set('status', filters.status);
  if (filters?.rpa && filters.rpa !== 'TODOS') params.set('rpa', filters.rpa);

  const data = await safeFetchJson<{ success: boolean; data: BeneficiarioBPC[]; total: number; resumo: BeneficiariosResumo; error?: string }>(
    `${API_BASE}/beneficiarios-bpc?${params.toString()}`,
    undefined,
    'Erro ao buscar beneficiários'
  );
  if (!data.success) throw new Error(data.error || 'Erro ao buscar beneficiários');
  return data;
}

export async function createBeneficiarioBPC(payload: Omit<BeneficiarioBPC, 'id' | 'data_ultima_atualizacao'>): Promise<BeneficiarioBPC> {
  const data = await safeFetchJson<{ success: boolean; data: BeneficiarioBPC; error?: string }>(`${API_BASE}/beneficiarios-bpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Erro ao cadastrar beneficiário');
  if (!data.success) throw new Error(data.error || 'Erro ao cadastrar beneficiário');
  return data.data;
}
