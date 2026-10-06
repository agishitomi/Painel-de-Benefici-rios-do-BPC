import React, { useState } from 'react';
import { Lock, Mail, KeyRound, Shield, CheckCircle2, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import * as api from '../api';
import { AuthUser } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

const DEMO_USERS = [
  {
    nome: 'Alberto Barbieri',
    email: 'alberto.barbieri@recife.pe.gov.br',
    cargo: 'Administrador Geral & Gestor BPC',
    senhaPadrao: 'admin123'
  },
  {
    nome: 'Dra. Maria Luiza Santos',
    email: 'maria.santos@recife.pe.gov.br',
    cargo: 'Gestor Municipal BPC',
    senhaPadrao: 'admin123'
  },
  {
    nome: 'Carlos Eduardo Ferreira',
    email: 'carlos.ferreira@recife.pe.gov.br',
    cargo: 'Assistente Social (CRAS Santo Amaro)',
    senhaPadrao: 'admin123'
  },
  {
    nome: 'Juliana Mendes de Oliveira',
    email: 'juliana.oliveira@recife.pe.gov.br',
    cargo: 'Auditor / Fiscal BPC',
    senhaPadrao: 'admin123'
  }
];

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('alberto.barbieri@recife.pe.gov.br');
  const [senha, setSenha] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email.trim(), senha);
      if (res.success && res.usuario) {
        onLoginSuccess(res.usuario);
      } else {
        setError('Não foi possível autenticar. Verifique suas credenciais.');
      }
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação via JWT');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoUser = (demoEmail: string, demoSenha: string) => {
    setEmail(demoEmail);
    setSenha(demoSenha);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-slate-900 p-6 text-white text-center border-b border-slate-800">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl mb-3 shadow-lg shadow-blue-500/30 border border-blue-400/40">
            BPC
          </div>
          <h2 className="text-xl font-bold font-['Outfit']">
            Painel de Beneficiário BPC
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Prefeitura da Cidade do Recife • Secretaria de Assistência Social
          </p>

          <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-400 text-[11px] font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>Autenticação Bearer JWT Ativa</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                E-mail Institucional (@recife.pe.gov.br)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@recife.pe.gov.br"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Autenticando via JWT...</span>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Profiles Quick Selector */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Selecione um Perfil de Acesso para Teste:
            </span>

            <div className="space-y-1.5">
              {DEMO_USERS.map((u, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectDemoUser(u.email, u.senhaPadrao)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition cursor-pointer flex items-center justify-between ${
                    email === u.email
                      ? 'bg-blue-50/80 border-blue-300 text-blue-900'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      {u.nome}
                    </div>
                    <div className="text-[11px] text-slate-500">{u.cargo}</div>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                    {u.senhaPadrao}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            Tokens expiram em 12 horas
          </span>
          <span className="font-semibold text-slate-700">Recife/PE • BPC 2026</span>
        </div>
      </div>
    </div>
  );
};
