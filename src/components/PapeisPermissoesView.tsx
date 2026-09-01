import React, { useState } from 'react';
import { Papel, Permissao } from '../types';
import { ShieldCheck, Plus, Check, Trash2, Edit, CheckSquare, Square, Shield, Lock, Layers } from 'lucide-react';
import * as api from '../api';

interface PapeisPermissoesViewProps {
  papeis: Papel[];
  permissoes: Permissao[];
  onRefresh: () => void;
}

export const PapeisPermissoesView: React.FC<PapeisPermissoesViewProps> = ({
  papeis,
  permissoes,
  onRefresh
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'matriz' | 'papeis' | 'permissoes'>('matriz');

  // Role modal
  const [isPapelModalOpen, setIsPapelModalOpen] = useState(false);
  const [editingPapel, setEditingPapel] = useState<Papel | null>(null);
  const [papelNome, setPapelNome] = useState('');
  const [papelDescricao, setPapelDescricao] = useState('');
  const [papelPerms, setPapelPerms] = useState<number[]>([]);

  // Permission modal
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [permNome, setPermNome] = useState('');
  const [permDescricao, setPermDescricao] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Open Papel Modal
  const openNewPapelModal = () => {
    setEditingPapel(null);
    setPapelNome('');
    setPapelDescricao('');
    setPapelPerms([]);
    setErrorMsg(null);
    setIsPapelModalOpen(true);
  };

  const openEditPapelModal = (papel: Papel) => {
    setEditingPapel(papel);
    setPapelNome(papel.nome);
    setPapelDescricao(papel.descricao);
    setPapelPerms(papel.permissoes || []);
    setErrorMsg(null);
    setIsPapelModalOpen(true);
  };

  // Open Permissao Modal
  const openNewPermModal = () => {
    setPermNome('');
    setPermDescricao('');
    setErrorMsg(null);
    setIsPermModalOpen(true);
  };

  // Matrix Checkbox Toggle (Directly updates papel_permissao)
  const handleToggleMatrix = async (papel: Papel, permId: number) => {
    const currentPerms = papel.permissoes || [];
    const hasPerm = currentPerms.includes(permId);
    const newPerms = hasPerm
      ? currentPerms.filter(id => id !== permId)
      : [...currentPerms, permId];

    try {
      await api.updatePapel(papel.id, { permissoes: newPerms });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar permissão do papel');
    }
  };

  // Submit Papel
  const handleSubmitPapel = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSaving(true);
    try {
      if (editingPapel) {
        await api.updatePapel(editingPapel.id, {
          nome: papelNome,
          descricao: papelDescricao,
          permissoes: papelPerms
        });
      } else {
        await api.createPapel({
          nome: papelNome,
          descricao: papelDescricao,
          permissoes: papelPerms
        });
      }
      setIsPapelModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar papel');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Papel
  const handleDeletePapel = async (id: number, nome: string) => {
    if (window.confirm(`Deseja realmente remover o papel "${nome}"? Usuários vinculados perderão essa atribuição.`)) {
      try {
        await api.deletePapel(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir papel');
      }
    }
  };

  // Submit Permissao
  const handleSubmitPerm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSaving(true);
    try {
      await api.createPermissao({
        nome: permNome,
        descricao: permDescricao
      });
      setIsPermModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar permissão');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Permissao
  const handleDeletePerm = async (id: number, nome: string) => {
    if (window.confirm(`Deseja remover a permissão "${nome}"?`)) {
      try {
        await api.deletePermissao(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir permissão');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
              Controle de Acesso RBAC (Tabelas: <span className="font-mono text-indigo-600">papeis</span>, <span className="font-mono text-indigo-600">permissoes</span> & <span className="font-mono text-indigo-600">papel_permissao</span>)
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie os papéis funcionais da Prefeitura do Recife e as permissões de acesso ao sistema de Beneficiários BPC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-novo-papel"
            onClick={openNewPapelModal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Papel</span>
          </button>
          <button
            id="btn-nova-permissao"
            onClick={openNewPermModal}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer shadow-sm"
          >
            <Lock className="w-4 h-4" />
            <span>Nova Permissão</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs switch */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl border">
        <button
          id="subtab-matriz"
          onClick={() => setActiveSubTab('matriz')}
          className={`py-3 px-4 text-sm font-medium border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'matriz'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matriz de Acessos Interativa (RBAC)</span>
        </button>

        <button
          id="subtab-papeis"
          onClick={() => setActiveSubTab('papeis')}
          className={`py-3 px-4 text-sm font-medium border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'papeis'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Lista de Papéis ({papeis.length})</span>
        </button>

        <button
          id="subtab-permissoes"
          onClick={() => setActiveSubTab('permissoes')}
          className={`py-3 px-4 text-sm font-medium border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'permissoes'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Catálogo de Permissões ({permissoes.length})</span>
        </button>
      </div>

      {/* VIEW 1: Matriz de Acessos Interativa */}
      {activeSubTab === 'matriz' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Matriz de Atribuição (papel_permissao)
              </h3>
              <p className="text-xs text-slate-500">
                Clique nos checkboxes para conceder ou revogar permissões instantaneamente para cada papel.
              </p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-md border border-indigo-100">
              {papeis.length} papéis × {permissoes.length} permissões
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 text-slate-700">
                <tr>
                  <th className="p-3 border-b border-r border-slate-200 sticky left-0 bg-slate-100 z-10 w-72">
                    Permissão / Ação do Sistema
                  </th>
                  {papeis.map(p => (
                    <th key={p.id} className="p-3 border-b border-r border-slate-200 text-center min-w-[140px]">
                      <div className="font-semibold text-slate-900">{p.nome}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        ({p.total_usuarios || 0} usuários)
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissoes.map(perm => (
                  <tr key={perm.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 border-r border-slate-200 sticky left-0 bg-white font-medium z-10">
                      <div className="font-mono text-slate-800 text-[11px] font-semibold">{perm.nome}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{perm.descricao}</div>
                    </td>
                    {papeis.map(papel => {
                      const isGranted = (papel.permissoes || []).includes(perm.id);
                      return (
                        <td key={papel.id} className="p-3 border-r border-slate-200 text-center">
                          <button
                            onClick={() => handleToggleMatrix(papel, perm.id)}
                            title={`Alternar ${perm.nome} para ${papel.nome}`}
                            className={`p-1.5 rounded transition cursor-pointer ${
                              isGranted
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500'
                            }`}
                          >
                            {isGranted ? (
                              <CheckSquare className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Lista de Papéis */}
      {activeSubTab === 'papeis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {papeis.map(papel => (
            <div key={papel.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{papel.nome}</h4>
                      <span className="text-xs text-slate-500 font-mono">ID: #{papel.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditPapelModal(papel)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                      title="Editar Papel"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePapel(papel.id, papel.nome)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                      title="Excluir Papel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {papel.descricao || 'Sem descrição cadastrada.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                    <span>Permissões Concedidas ({papel.permissoes?.length || 0})</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      {papel.total_usuarios || 0} usuários ativos com este papel
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {papel.permissoes_nomes && papel.permissoes_nomes.length > 0 ? (
                      papel.permissoes_nomes.map((pName, i) => (
                        <span key={i} className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {pName}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Nenhuma permissão associada.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Criado: {papel.data_criacao}</span>
                <span>Atualizado: {papel.data_atualizacao}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: Catálogo de Permissões */}
      {activeSubTab === 'permissoes' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Identificador de Permissão</th>
                <th className="px-5 py-3.5">Descrição da Operação</th>
                <th className="px-5 py-3.5">Data de Criação</th>
                <th className="px-5 py-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissoes.map(perm => (
                <tr key={perm.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500 font-semibold">
                    #{perm.id}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded">
                      {perm.nome}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-700">
                    {perm.descricao}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                    {perm.data_criacao}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDeletePerm(perm.id, perm.nome)}
                      title="Excluir permissão"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Papel */}
      {isPapelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                {editingPapel ? 'Editar Papel' : 'Novo Papel (papeis)'}
              </h3>
              <button onClick={() => setIsPapelModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitPapel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nome do Papel *
                </label>
                <input
                  type="text"
                  required
                  value={papelNome}
                  onChange={(e) => setPapelNome(e.target.value)}
                  placeholder="Ex: Coordenador de CRAS"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição das Atribuições
                </label>
                <textarea
                  rows={3}
                  value={papelDescricao}
                  onChange={(e) => setPapelDescricao(e.target.value)}
                  placeholder="Descreva o propósito deste perfil de acesso..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Permissões Associadas (<code className="font-mono text-indigo-600 lowercase">papel_permissao</code>)
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {permissoes.map((p) => {
                    const isSelected = papelPerms.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-start gap-2 p-1.5 rounded hover:bg-white transition cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setPapelPerms(papelPerms.filter(id => id !== p.id));
                            } else {
                              setPapelPerms([...papelPerms, p.id]);
                            }
                          }}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <span className="font-mono font-semibold text-slate-800">{p.nome}</span>
                          <p className="text-[11px] text-slate-500">{p.descricao}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPapelModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : editingPapel ? 'Atualizar Papel' : 'Salvar Papel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Permissao */}
      {isPermModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <Lock className="w-5 h-5 text-slate-700" />
                Nova Permissão (permissoes)
              </h3>
              <button onClick={() => setIsPermModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitPerm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Identificador Único *
                </label>
                <input
                  type="text"
                  required
                  value={permNome}
                  onChange={(e) => setPermNome(e.target.value)}
                  placeholder="Ex: relatorios:exportar_pdf"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Padrão recomendado: <code>modulo:acao</code></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={permDescricao}
                  onChange={(e) => setPermDescricao(e.target.value)}
                  placeholder="Explique o que esta permissão autoriza..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPermModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Cadastrando...' : 'Cadastrar Permissão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
