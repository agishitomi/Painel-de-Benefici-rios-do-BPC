import React, { useState, useEffect } from 'react';
import { DbStatus } from '../types';
import { Database, Server, Terminal, Copy, Check, RefreshCw, Layers, Shield, KeyRound, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import * as api from '../api';

interface DatabaseFastifyViewProps {
  dbStatus: DbStatus | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export const DatabaseFastifyView: React.FC<DatabaseFastifyViewProps> = ({
  dbStatus,
  onRefresh,
  isLoading
}) => {
  const [schemaData, setSchemaData] = useState<{ sql: string; entities: { name: string; columns: string[] }[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testingConn, setTestingConn] = useState(false);

  useEffect(() => {
    api.getSchemaSql().then(setSchemaData).catch(console.error);
  }, []);

  const handleCopySql = () => {
    if (schemaData?.sql) {
      navigator.clipboard.writeText(schemaData.sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTestConnection = async () => {
    setTestingConn(true);
    setTestResult(null);
    try {
      const res = await api.testDbConnection();
      if (res.connected) {
        setTestResult(`Conexão MySQL ativa! Banco: ${res.database}`);
      } else {
        setTestResult(`Motor Standby ativo (MySQL não configurado ou inacessível). Detalhe: ${res.lastError || 'Variáveis de ambiente locais'}`);
      }
      onRefresh();
    } catch (err: any) {
      setTestResult(`Erro no teste: ${err.message}`);
    } finally {
      setTestingConn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Architecture Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
              Backend Fastify & Banco de Dados MySQL
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Arquitetura em Node.js com Fastify, pool de conexões <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-blue-700">mysql2</code> e mapeamento das entidades relacionais do BPC Recife.
          </p>
        </div>

        <button
          id="btn-testar-conexao-mysql"
          onClick={handleTestConnection}
          disabled={testingConn || isLoading}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${testingConn || isLoading ? 'animate-spin' : ''}`} />
          <span>{testingConn ? 'Testando Conexão...' : 'Testar Conexão MySQL'}</span>
        </button>
      </div>

      {testResult && (
        <div className={`p-4 rounded-xl text-xs font-medium border flex items-center gap-2.5 ${
          testResult.includes('ativa')
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {testResult.includes('ativa') ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{testResult}</span>
        </div>
      )}

      {/* Grid: Server & Database Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fastify Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Servidor Fastify (Node.js)</h3>
              <p className="text-xs text-slate-500">Framework web de alta performance</p>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Porta de Execução:</span>
              <span className="font-mono font-semibold text-slate-800">3000 (0.0.0.0)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Middleware:</span>
              <span className="font-mono text-slate-800">@fastify/cors + @fastify/middie</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Integração Frontend:</span>
              <span className="text-slate-800">Vite React SPA</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Autenticação:</span>
              <span className="text-slate-800">Bcrypt password hashing + RBAC</span>
            </div>
          </div>
        </div>

        {/* MySQL Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Banco de Dados MySQL</h3>
              <p className="text-xs text-slate-500">Driver mysql2/promise com DDL automático</p>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Status da Conexão:</span>
              <span className={`font-semibold inline-flex items-center gap-1 ${dbStatus?.connected ? 'text-emerald-600' : 'text-amber-600'}`}>
                <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                {dbStatus?.connected ? 'MySQL Live Conectado' : 'SQL Standby (Simulado com Seed)'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Host / Porta:</span>
              <span className="font-mono text-slate-800">{dbStatus?.host || 'localhost'}:{dbStatus?.port || 3306}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Database:</span>
              <span className="font-mono text-slate-800">{dbStatus?.database || 'bpc_recife_db'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Tabelas Relacionais:</span>
              <span className="text-slate-800 font-semibold">5 Entidades + Beneficiários</span>
            </div>
          </div>
        </div>
      </div>

      {/* SQL DDL Schema Visualizer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-semibold">schema_ddl.sql — MySQL Database Definition</span>
          </div>

          <button
            id="btn-copy-sql"
            onClick={handleCopySql}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded text-slate-200 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar SQL DDL</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto max-h-96">
          <pre className="leading-relaxed whitespace-pre">
            {schemaData?.sql || '// Carregando DDL do servidor Fastify...'}
          </pre>
        </div>
      </div>

      {/* Entidades & Colunas Breakdown */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          Estrutura das Entidades Solicitadas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {schemaData?.entities?.map((ent, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1.5 text-blue-700">
                <Database className="w-3.5 h-3.5" />
                {ent.name}
              </div>
              <ul className="space-y-1">
                {ent.columns.map((col, cIdx) => (
                  <li key={cIdx} className="text-[11px] font-mono text-slate-600 flex items-center gap-1">
                    <span className="text-slate-400">•</span>
                    {col}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Fastify REST API Routes Directory */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-600" />
          Rotas REST Disponíveis no Fastify
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold">
              <tr>
                <th className="p-3">Método</th>
                <th className="p-3">Endpoint</th>
                <th className="p-3">Descrição da Operação</th>
                <th className="p-3">Entidade Associada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="p-3"><span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-mono">GET</span></td>
                <td className="p-3 font-mono font-semibold text-slate-900">/api/usuarios</td>
                <td className="p-3 text-slate-600">Listar todos os usuários e seus papéis</td>
                <td className="p-3 font-mono text-slate-500">usuarios, usuario_papel</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3"><span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded font-mono">POST</span></td>
                <td className="p-3 font-mono font-semibold text-slate-900">/api/usuarios</td>
                <td className="p-3 text-slate-600">Criar novo usuário com hash de senha e papéis</td>
                <td className="p-3 font-mono text-slate-500">usuarios, usuario_papel</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3"><span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded font-mono">PUT</span></td>
                <td className="p-3 font-mono font-semibold text-slate-900">/api/usuarios/:id</td>
                <td className="p-3 text-slate-600">Atualizar dados, status ativo e papéis do usuário</td>
                <td className="p-3 font-mono text-slate-500">usuarios, usuario_papel</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3"><span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded font-mono">DELETE</span></td>
                <td className="p-3 font-mono font-semibold text-slate-900">/api/usuarios/:id</td>
                <td className="p-3 text-slate-600">Excluir usuário do sistema</td>
                <td className="p-3 font-mono text-slate-500">usuarios</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3"><span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-mono">GET</span></td>
                <td className="p-3 font-mono font-semibold text-slate-900">/api/papeis</td>
                <td className="p-3 text-slate-600">Listar papéis e permissões vinculadas</td>
                <td className="p-3 font-mono text-slate-500">papeis, papel_permissao</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3"><span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded font-mono">POST</span></td>
                <td className="p-3 font-mono font-semibold text-slate-900">/api/papeis</td>
                <td className="p-3 text-slate-600">Criar novo papel com permissões</td>
                <td className="p-3 font-mono text-slate-500">papeis, papel_permissao</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3"><span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-mono">GET</span></td>
                <td className="p-3 font-mono font-semibold text-slate-900">/api/permissoes</td>
                <td className="p-3 text-slate-600">Listar catálogo de permissões</td>
                <td className="p-3 font-mono text-slate-500">permissoes</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3"><span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-mono">GET</span></td>
                <td className="p-3 font-mono font-semibold text-slate-900">/api/beneficiarios-bpc</td>
                <td className="p-3 text-slate-600">Listar e filtrar beneficiários BPC do Recife</td>
                <td className="p-3 font-mono text-slate-500">beneficiarios_bpc</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
