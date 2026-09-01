import { Usuario, Papel, Permissao, BeneficiarioBPC, DbStatus, BeneficiariosResumo } from './types';

const API_BASE = '/api';

export async function getDbStatus(): Promise<DbStatus> {
  const res = await fetch(`${API_BASE}/db-status`);
  if (!res.ok) throw new Error('Erro ao obter status do banco');
  return res.json();
}

export async function testDbConnection(): Promise<DbStatus> {
  const res = await fetch(`${API_BASE}/db-test-connection`, { method: 'POST' });
  if (!res.ok) throw new Error('Erro ao testar conexão MySQL');
  return res.json();
}

export async function getSchemaSql(): Promise<{ sql: string; entities: { name: string; columns: string[] }[] }> {
  const res = await fetch(`${API_BASE}/schema/sql`);
  if (!res.ok) throw new Error('Erro ao carregar schema DDL');
  return res.json();
}

export async function getUsuarios(): Promise<Usuario[]> {
  const res = await fetch(`${API_BASE}/usuarios`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao buscar usuários');
  return data.data;
}

export async function createUsuario(payload: { nome: string; email: string; senha?: string; ativo?: boolean; papeis?: number[] }): Promise<Usuario> {
  const res = await fetch(`${API_BASE}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao cadastrar usuário');
  return data.data;
}

export async function updateUsuario(id: number, payload: { nome?: string; email?: string; senha?: string; ativo?: boolean; papeis?: number[] }): Promise<Usuario> {
  const res = await fetch(`${API_BASE}/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao atualizar usuário');
  return data.data;
}

export async function deleteUsuario(id: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/usuarios/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao excluir usuário');
  return data.success;
}

export async function getPapeis(): Promise<Papel[]> {
  const res = await fetch(`${API_BASE}/papeis`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao buscar papéis');
  return data.data;
}

export async function createPapel(payload: { nome: string; descricao?: string; permissoes?: number[] }): Promise<Papel> {
  const res = await fetch(`${API_BASE}/papeis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao cadastrar papel');
  return data.data;
}

export async function updatePapel(id: number, payload: { nome?: string; descricao?: string; permissoes?: number[] }): Promise<Papel> {
  const res = await fetch(`${API_BASE}/papeis/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao atualizar papel');
  return data.data;
}

export async function deletePapel(id: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/papeis/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao excluir papel');
  return data.success;
}

export async function getPermissoes(): Promise<Permissao[]> {
  const res = await fetch(`${API_BASE}/permissoes`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao buscar permissões');
  return data.data;
}

export async function createPermissao(payload: { nome: string; descricao?: string }): Promise<Permissao> {
  const res = await fetch(`${API_BASE}/permissoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao criar permissão');
  return data.data;
}

export async function deletePermissao(id: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/permissoes/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao excluir permissão');
  return data.success;
}

export async function getBeneficiariosBPC(filters?: { query?: string; tipo?: string; status?: string; rpa?: string }): Promise<{ data: BeneficiarioBPC[]; total: number; resumo: BeneficiariosResumo }> {
  const params = new URLSearchParams();
  if (filters?.query) params.set('query', filters.query);
  if (filters?.tipo && filters.tipo !== 'TODOS') params.set('tipo', filters.tipo);
  if (filters?.status && filters.status !== 'TODOS') params.set('status', filters.status);
  if (filters?.rpa && filters.rpa !== 'TODOS') params.set('rpa', filters.rpa);

  const res = await fetch(`${API_BASE}/beneficiarios-bpc?${params.toString()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao buscar beneficiários');
  return data;
}

export async function createBeneficiarioBPC(payload: Omit<BeneficiarioBPC, 'id' | 'data_ultima_atualizacao'>): Promise<BeneficiarioBPC> {
  const res = await fetch(`${API_BASE}/beneficiarios-bpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Erro ao cadastrar beneficiário');
  return data.data;
}
