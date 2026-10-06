/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { UsuariosView } from './components/UsuariosView';
import { PapeisPermissoesView } from './components/PapeisPermissoesView';
import { DatabaseFastifyView } from './components/DatabaseFastifyView';
import { LoginView } from './components/LoginView';
import { Usuario, Papel, Permissao, BeneficiarioBPC, DbStatus, BeneficiariosResumo, AuthUser } from './types';
import * as api from './api';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'usuarios' | 'papeis' | 'database'>('dashboard');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => api.getStoredUser());
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // State collections
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [papeis, setPapeis] = useState<Papel[]>([]);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [beneficiarios, setBeneficiarios] = useState<BeneficiarioBPC[]>([]);
  const [resumo, setResumo] = useState<BeneficiariosResumo | null>(null);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingDb, setLoadingDb] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    // Carrega sempre o status do banco (rota pública)
    api.getDbStatus().then(setDbStatus).catch(() => null);

    // Se não estiver logado, não tenta carregar rotas protegidas por JWT
    if (!api.getStoredToken()) {
      setUsuarios([]);
      setPapeis([]);
      setPermissoes([]);
      setBeneficiarios([]);
      return;
    }

    setLoading(true);
    setGlobalError(null);
    try {
      const [uData, pData, permData, bData, dbData] = await Promise.all([
        api.getUsuarios().catch(() => []),
        api.getPapeis().catch(() => []),
        api.getPermissoes().catch(() => []),
        api.getBeneficiariosBPC().catch(() => ({ data: [], total: 0, resumo: null })),
        api.getDbStatus().catch(() => null)
      ]);

      setUsuarios(uData);
      setPapeis(pData);
      setPermissoes(permData);
      if (bData) {
        setBeneficiarios(bData.data || []);
        setResumo(bData.resumo || null);
      }
      if (dbData) {
        setDbStatus(dbData);
      }
    } catch (err: any) {
      setGlobalError(err.message || 'Erro ao carregar dados protegidos do servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDbStatus = async () => {
    setLoadingDb(true);
    try {
      const st = await api.getDbStatus();
      setDbStatus(st);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingDb(false);
    }
  };

  // Verifica sessão ao iniciar
  useEffect(() => {
    const token = api.getStoredToken();
    if (token) {
      api.getMe()
        .then((user) => {
          setCurrentUser(user);
          loadAllData();
        })
        .catch(() => {
          api.setStoredToken(null);
          api.setStoredUser(null);
          setCurrentUser(null);
        });
    } else {
      // Se não há token gravado, faz um login inicial padrão com o administrador
      api.login('alberto.barbieri@recife.pe.gov.br', 'admin123')
        .then((res) => {
          if (res.success && res.usuario) {
            setCurrentUser(res.usuario);
            loadAllData();
          }
        })
        .catch(() => {
          // Exibe tela de login se não conseguir autenticar automaticamente
          setCurrentUser(null);
        });
    }

    const handleUnauthorized = () => {
      setCurrentUser(null);
      setGlobalError('Sua sessão JWT expirou. Por favor, autentique-se novamente.');
    };

    const handleLogout = () => {
      setCurrentUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [loadAllData]);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    setGlobalError(null);
    loadAllData();
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setUsuarios([]);
    setPapeis([]);
    setPermissoes([]);
    setBeneficiarios([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        dbStatus={dbStatus}
        onRefreshDb={refreshDbStatus}
        isLoadingDb={loadingDb}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => setShowLoginModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {globalError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{globalError}</span>
            </div>
            <button
              onClick={loadAllData}
              className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-md hover:bg-rose-700 transition cursor-pointer"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {!currentUser ? (
          <LoginView onLoginSuccess={handleLoginSuccess} />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500 font-['Outfit']">
              Validando JWT e sincronizando dados do BPC Recife...
            </p>
          </div>
        ) : (
          <div>
            {currentTab === 'dashboard' && (
              <DashboardView
                beneficiarios={beneficiarios}
                resumo={resumo}
                onRefresh={loadAllData}
                isLoading={loading}
              />
            )}

            {currentTab === 'usuarios' && (
              <UsuariosView
                usuarios={usuarios}
                papeis={papeis}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'papeis' && (
              <PapeisPermissoesView
                papeis={papeis}
                permissoes={permissoes}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'database' && (
              <DatabaseFastifyView
                dbStatus={dbStatus}
                onRefresh={loadAllData}
                isLoading={loading}
              />
            )}
          </div>
        )}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>© 2025 Prefeitura da Cidade do Recife • Secretaria de Desenvolvimento Social</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Fastify v5 + JWT Bearer</span>
            <span>•</span>
            <span>mysql2 + React 19</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

