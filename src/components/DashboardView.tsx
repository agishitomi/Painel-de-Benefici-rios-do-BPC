import React, { useState } from 'react';
import { BeneficiarioBPC, BeneficiariosResumo } from '../types';
import {
  Users,
  Search,
  Filter,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
  MapPin,
  Building2,
  Calendar,
  UserCheck,
  Plus,
  CreditCard
} from 'lucide-react';
import * as api from '../api';

interface DashboardViewProps {
  beneficiarios: BeneficiarioBPC[];
  resumo: BeneficiariosResumo | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  beneficiarios,
  resumo,
  onRefresh,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [rpaFilter, setRpaFilter] = useState('TODOS');

  // Modal Novo Beneficiario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [numeroBeneficio, setNumeroBeneficio] = useState('');
  const [nis, setNis] = useState('');
  const [cpf, setCpf] = useState('');
  const [tipo, setTipo] = useState<'BPC_IDOSO' | 'BPC_PCD'>('BPC_IDOSO');
  const [bairro, setBairro] = useState('Casa Amarela');
  const [rpa, setRpa] = useState('RPA 3');
  const [cras, setCras] = useState('CRAS Alto do Mandu / Casa Amarela');
  const [statusCadastral, setStatusCadastral] = useState<'REGULAR' | 'EM_REVISAO' | 'BLOQUEADO' | 'PENDENCIA_CADUNICO'>('REGULAR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBeneficiario = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createBeneficiarioBPC({
        nome_beneficiario: nome,
        numero_beneficio: numeroBeneficio,
        nis,
        cpf_mascarado: cpf ? `***.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-**` : '***.123.456-**',
        tipo_beneficio: tipo,
        bairro_recife: bairro,
        rpa_recife: rpa,
        valor_mensal: 1412.00,
        status_cadastral: statusCadastral,
        cras_referencia: cras,
        data_concessao: new Date().toISOString().substring(0, 10)
      });
      setIsModalOpen(false);
      onRefresh();
      // Reset form
      setNome('');
      setNumeroBeneficio('');
      setNis('');
      setCpf('');
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredList = beneficiarios.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = b.nome_beneficiario.toLowerCase().includes(q) ||
                          b.numero_beneficio.includes(q) ||
                          b.nis.includes(q) ||
                          b.bairro_recife.toLowerCase().includes(q) ||
                          b.cras_referencia.toLowerCase().includes(q);
    const matchesTipo = tipoFilter === 'TODOS' || b.tipo_beneficio === tipoFilter;
    const matchesStatus = statusFilter === 'TODOS' || b.status_cadastral === statusFilter;
    const matchesRpa = rpaFilter === 'TODOS' || b.rpa_recife === rpaFilter;
    return matchesSearch && matchesTipo && matchesStatus && matchesRpa;
  });

  const formatBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-blue-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-400/30">
              Recife • Sistema Municipal de Assistência Social
            </span>
            <h2 className="text-2xl font-bold tracking-tight font-['Outfit']">
              Monitoramento de Beneficiários BPC
            </h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Painel territorializado para acompanhamento de idosos e pessoas com deficiência beneficiários da LOAS/BPC nas 6 Regiões Político-Administrativas (RPAs) da Cidade do Recife.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-novo-beneficiario"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-md cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Beneficiário</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Beneficiários</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-['Outfit']">
              {resumo?.totalGeral ?? beneficiarios.length}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{resumo?.regulares ?? 0} Cadastros Regulares</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">BPC Idoso (65+ anos)</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-['Outfit']">
              {resumo?.idosos ?? beneficiarios.filter(b => b.tipo_beneficio === 'BPC_IDOSO').length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Benefício LOAS Idoso
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">BPC PCD</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-['Outfit']">
              {resumo?.pcd ?? beneficiarios.filter(b => b.tipo_beneficio === 'BPC_PCD').length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Pessoas com Deficiência
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Atenção CadÚnico</span>
            <div className="text-2xl font-bold text-amber-600 mt-1 font-['Outfit']">
              {(resumo?.emRevisao || 0) + (resumo?.pendenciaCadUnico || 0) + (resumo?.bloqueados || 0)}
            </div>
            <div className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Revisão / Pendência</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-busca-bpc"
              type="text"
              placeholder="Buscar por nome, NIS, benefício, bairro ou CRAS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filtros:</span>
            </div>

            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="TODOS">Todos os Tipos</option>
              <option value="BPC_IDOSO">BPC Idoso</option>
              <option value="BPC_PCD">BPC PCD</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="REGULAR">Regular</option>
              <option value="EM_REVISAO">Em Revisão</option>
              <option value="PENDENCIA_CADUNICO">Pendência CadÚnico</option>
              <option value="BLOQUEADO">Bloqueado</option>
            </select>

            <select
              value={rpaFilter}
              onChange={(e) => setRpaFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="TODOS">Todas as RPAs do Recife</option>
              <option value="RPA 1">RPA 1 (Centro)</option>
              <option value="RPA 2">RPA 2 (Norte)</option>
              <option value="RPA 3">RPA 3 (Noroeste)</option>
              <option value="RPA 4">RPA 4 (Oeste)</option>
              <option value="RPA 5">RPA 5 (Sudoeste)</option>
              <option value="RPA 6">RPA 6 (Sul)</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Exibindo {filteredList.length} de {beneficiarios.length} beneficiários</span>
          <span>Repasse mensal estimado nesta listagem: <strong>{formatBrl(filteredList.reduce((acc, b) => acc + b.valor_mensal, 0))}</strong></span>
        </div>
      </div>

      {/* Beneficiaries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nº Benefício / NIS</th>
                <th className="px-5 py-3.5">Nome do Beneficiário</th>
                <th className="px-5 py-3.5">Modalidade</th>
                <th className="px-5 py-3.5">Território (Recife)</th>
                <th className="px-5 py-3.5">CRAS de Referência</th>
                <th className="px-5 py-3.5">Status Cadastral</th>
                <th className="px-5 py-3.5 text-right">Valor Mensal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    Nenhum beneficiário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredList.map((benef) => (
                  <tr key={benef.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 font-mono text-xs">
                      <div className="font-bold text-slate-900">{benef.numero_beneficio}</div>
                      <div className="text-slate-500 text-[11px]">NIS: {benef.nis}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{benef.nome_beneficiario}</div>
                      <div className="text-xs text-slate-400 font-mono">CPF: {benef.cpf_mascarado}</div>
                    </td>
                    <td className="px-5 py-4">
                      {benef.tipo_beneficio === 'BPC_IDOSO' ? (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded text-xs font-medium">
                          BPC Idoso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded text-xs font-medium">
                          BPC PCD
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div className="font-medium text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {benef.bairro_recife}
                      </div>
                      <div className="text-[11px] text-slate-500">{benef.rpa_recife}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{benef.cras_referencia}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {benef.status_cadastral === 'REGULAR' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Regular
                        </span>
                      )}
                      {benef.status_cadastral === 'EM_REVISAO' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Em Revisão
                        </span>
                      )}
                      {benef.status_cadastral === 'PENDENCIA_CADUNICO' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                          <AlertTriangle className="w-3 h-3 text-orange-600" />
                          CadÚnico Desat.
                        </span>
                      )}
                      {benef.status_cadastral === 'BLOQUEADO' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <Ban className="w-3 h-3 text-rose-600" />
                          Bloqueado
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-semibold text-slate-900 text-xs">
                      {formatBrl(benef.valor_mensal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo Beneficiário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Cadastrar Beneficiário BPC Recife
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBeneficiario} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nome Completo do Beneficiário *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do titular"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nº do Benefício (NB) *
                  </label>
                  <input
                    type="text"
                    required
                    value={numeroBeneficio}
                    onChange={(e) => setNumeroBeneficio(e.target.value)}
                    placeholder="870.000.000-0"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    NIS *
                  </label>
                  <input
                    type="text"
                    required
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="123.45678.90-0"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Modalidade BPC *
                  </label>
                  <select
                    value={tipo}
                    onChange={(e: any) => setTipo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="BPC_IDOSO">BPC Idoso (65+ anos)</option>
                    <option value="BPC_PCD">BPC PCD (Deficiência)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Status Cadastral *
                  </label>
                  <select
                    value={statusCadastral}
                    onChange={(e: any) => setStatusCadastral(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="EM_REVISAO">Em Revisão</option>
                    <option value="PENDENCIA_CADUNICO">Pendência CadÚnico</option>
                    <option value="BLOQUEADO">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Bairro do Recife *
                  </label>
                  <input
                    type="text"
                    required
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Ex: Boa Viagem, Várzea..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    RPA do Recife *
                  </label>
                  <select
                    value={rpa}
                    onChange={(e) => setRpa(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="RPA 1">RPA 1 (Centro)</option>
                    <option value="RPA 2">RPA 2 (Norte)</option>
                    <option value="RPA 3">RPA 3 (Noroeste)</option>
                    <option value="RPA 4">RPA 4 (Oeste)</option>
                    <option value="RPA 5">RPA 5 (Sudoeste)</option>
                    <option value="RPA 6">RPA 6 (Sul)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  CRAS de Referência *
                </label>
                <input
                  type="text"
                  required
                  value={cras}
                  onChange={(e) => setCras(e.target.value)}
                  placeholder="Ex: CRAS Várzea / CRAS Santo Amaro"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
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
                  {isSubmitting ? 'Salvando...' : 'Salvar Beneficiário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
