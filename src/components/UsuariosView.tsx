import React, { useState } from 'react';
import { Usuario, Papel } from '../types';
import { UserPlus, Edit, Trash2, CheckCircle2, XCircle, Shield, Search, KeyRound, Calendar, Mail } from 'lucide-react';
import * as api from '../api';

interface UsuariosViewProps {
  usuarios: Usuario[];
  papeis: Papel[];
  onRefresh: () => void;
}

export const UsuariosView: React.FC<UsuariosViewProps> = ({ usuarios, papeis, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ATIVOS' | 'INATIVOS'>('TODOS');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  
  // Form fields
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [selectedPapeis, setSelectedPapeis] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingUser(null);
    setNome('');
    setEmail('');
    setSenha('');
    setAtivo(true);
    setSelectedPapeis([5]); // Default 'Consulta Básica'
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: Usuario) => {
    setEditingUser(user);
    setNome(user.nome);
    setEmail(user.email);
    setSenha('');
    setAtivo(user.ativo);
    setSelectedPapeis(user.papeis || []);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleTogglePapel = (papelId: number) => {
    if (selectedPapeis.includes(papelId)) {
      setSelectedPapeis(selectedPapeis.filter(id => id !== papelId));
    } else {
      setSelectedPapeis([...selectedPapeis, papelId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingUser) {
        await api.updateUsuario(editingUser.id, {
          nome,
          email,
          ...(senha ? { senha } : {}),
          ativo,
          papeis: selectedPapeis
        });
      } else {
        await api.createUsuario({
          nome,
          email,
          senha: senha || 'Recife@2025',
          ativo,
          papeis: selectedPapeis
        });
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, userName: string) => {
    if (window.confirm(`Tem certeza que deseja remover o usuário "${userName}"?`)) {
      try {
        await api.deleteUsuario(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir');
      }
    }
  };

  const handleToggleAtivo = async (user: Usuario) => {
    try {
      await api.updateUsuario(user.id, { ativo: !user.ativo });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status');
    }
  };

  // Filtered users
  const filteredUsers = usuarios.filter(u => {
    const matchesSearch = u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.papeis_nomes && u.papeis_nomes.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())));
    
    if (statusFilter === 'ATIVOS') return matchesSearch && u.ativo;
    if (statusFilter === 'INATIVOS') return matchesSearch && !u.ativo;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header section with Entity Info */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
              Gestão de Usuários (Tabela: <span className="font-mono text-blue-600">usuarios</span>)
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {usuarios.length} registros
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Entidade que gerencia os operadores do sistema, credenciais de acesso, status ativo e a relação <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">usuario_papel</code>.
          </p>
        </div>

        <button
          id="btn-novo-usuario"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-busca-usuario"
            type="text"
            placeholder="Buscar por nome, e-mail ou papel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-500">Filtrar:</span>
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setStatusFilter('TODOS')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                statusFilter === 'TODOS' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({usuarios.length})
            </button>
            <button
              onClick={() => setStatusFilter('ATIVOS')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                statusFilter === 'ATIVOS' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Ativos ({usuarios.filter(u => u.ativo).length})
            </button>
            <button
              onClick={() => setStatusFilter('INATIVOS')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                statusFilter === 'INATIVOS' ? 'bg-white text-rose-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              Inativos ({usuarios.filter(u => !u.ativo).length})
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Nome & E-mail</th>
                <th className="px-5 py-3.5">Papéis Atribuídos (usuario_papel)</th>
                <th className="px-5 py-3.5">Status (ativo)</th>
                <th className="px-5 py-3.5">Criação / Atualização</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500 font-semibold">
                      #{user.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{user.nome}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {user.papeis_nomes && user.papeis_nomes.length > 0 ? (
                          user.papeis_nomes.map((papelNome, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium"
                            >
                              <Shield className="w-3 h-3 text-indigo-500" />
                              {papelNome}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sem papel atribuído</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleAtivo(user)}
                        title="Clique para alternar ativo/inativo"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer border ${
                          user.ativo
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {user.ativo ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Ativo</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Inativo</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Criado: {user.data_criacao}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Atualizado: {user.data_atualizacao}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`btn-editar-usuario-${user.id}`}
                          onClick={() => openEditModal(user)}
                          title="Editar usuário e papéis"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-excluir-usuario-${user.id}`}
                          onClick={() => handleDelete(user.id, user.nome)}
                          title="Excluir usuário"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo / Editar Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                {editingUser ? 'Editar Usuário' : 'Novo Usuário do BPC Recife'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nome Completo *
                </label>
                <input
                  id="form-user-nome"
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Alberto Barbieri"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  E-mail Institucional *
                </label>
                <input
                  id="form-user-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@recife.pe.gov.br"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  {editingUser ? 'Alterar Senha (opcional)' : 'Senha de Acesso *'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="form-user-senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder={editingUser ? 'Deixe em branco para manter a atual' : 'Defina a senha de acesso'}
                    required={!editingUser}
                    className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Atribuição de Papéis (<code className="font-mono lowercase text-blue-600">usuario_papel</code>)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {papeis.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-start gap-2.5 p-2 rounded-md hover:bg-white transition cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPapeis.includes(p.id)}
                        onChange={() => handleTogglePapel(p.id)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-semibold text-slate-900">{p.nome}</span>
                        <p className="text-[11px] text-slate-500 leading-tight">{p.descricao}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="form-user-ativo"
                  type="checkbox"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="form-user-ativo" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Usuário Ativo no Sistema
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : editingUser ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
