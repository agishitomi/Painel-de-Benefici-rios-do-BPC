import React from 'react';
import { Database, ShieldCheck, Users, BarChart3, Server, RefreshCw, LogOut, User, Lock } from 'lucide-react';
import { DbStatus, AuthUser } from '../types';

interface HeaderProps {
  currentTab: 'dashboard' | 'usuarios' | 'papeis' | 'database';
  onTabChange: (tab: 'dashboard' | 'usuarios' | 'papeis' | 'database') => void;
  dbStatus: DbStatus | null;
  onRefreshDb: () => void;
  isLoadingDb: boolean;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  dbStatus,
  onRefreshDb,
  isLoadingDb,
  currentUser,
  onLogout,
  onOpenLogin
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      {/* Top Governmental Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Prefeitura da Cidade do Recife
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline">SDSDHJPD — Assistência Social & Direitos Humanos</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 bg-slate-800/90 px-2.5 py-1 rounded border border-slate-700">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fastify (JWT Ativo)</span>
          </div>

          <button
            id="btn-refresh-db-status"
            onClick={onRefreshDb}
            disabled={isLoadingDb}
            title="Verificar status da conexão MySQL"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 transition cursor-pointer text-slate-300"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-[11px]">
              {dbStatus?.connected ? 'MySQL Live' : 'SQL Standby Engine'}
            </span>
            <RefreshCw className={`w-3 h-3 text-slate-400 ${isLoadingDb ? 'animate-spin' : ''}`} />
          </button>

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded border border-slate-700">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-medium text-white max-w-[120px] truncate" title={currentUser.nome}>
                  {currentUser.nome}
                </span>
                <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.2 rounded border border-blue-700/50 hidden lg:inline">
                  {currentUser.papeis?.[0]?.nome || 'Usuário'}
                </span>
              </div>

              <button
                id="btn-logout"
                onClick={onLogout}
                title="Encerrar sessão JWT"
                className="flex items-center gap-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 px-2 py-1 rounded border border-rose-800/60 transition cursor-pointer text-xs"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            <button
              id="btn-open-login"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition cursor-pointer text-xs font-semibold shadow-sm"
            >
              <Lock className="w-3 h-3" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header & Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-lg tracking-wider border border-blue-400/30 shrink-0">
              BPC
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-['Outfit']">
                Painel de Beneficiário BPC do Recife
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Sistema de Gestão do Benefício de Prestação Continuada & Controle de Acesso (RBAC)
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
            <button
              id="tab-btn-dashboard"
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Painel BPC Recife</span>
            </button>

            <button
              id="tab-btn-usuarios"
              onClick={() => onTabChange('usuarios')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                currentTab === 'usuarios'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Usuários (usuarios)</span>
            </button>

            <button
              id="tab-btn-papeis"
              onClick={() => onTabChange('papeis')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                currentTab === 'papeis'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Papéis & Permissões (RBAC)</span>
            </button>

            <button
              id="tab-btn-database"
              onClick={() => onTabChange('database')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                currentTab === 'database'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Banco MySQL & Fastify</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

