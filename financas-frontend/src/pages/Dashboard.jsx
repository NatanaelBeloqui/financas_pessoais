import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { transacaoService } from '../services/transacaoService';
import { formatarMoeda } from '../utils/formatters';

const Dashboard = () => {
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResumo();
  }, []);

  const loadResumo = async () => {
    try {
      const data = await transacaoService.getResumo();
      setResumo(data);
    } catch (err) {
      setError('Erro ao carregar resumo financeiro');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-8 rounded-2xl shadow-xl mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
        </div>
        <p className="text-emerald-50 text-lg capitalize">
          Resumo de {mesAtual}
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card Receitas */}
        <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-3 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Receitas</h3>
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-600 mb-2">
            {formatarMoeda(resumo?.totalReceitas || 0)}
          </p>
          <p className="text-sm text-slate-600">
            {resumo?.quantidadeReceitas || 0} transaç{resumo?.quantidadeReceitas === 1 ? 'ão' : 'ões'}
          </p>
        </div>

        {/* Card Despesas */}
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-3 rounded-xl shadow-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Despesas</h3>
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600 mb-2">
            {formatarMoeda(resumo?.totalDespesas || 0)}
          </p>
          <p className="text-sm text-slate-600">
            {resumo?.quantidadeDespesas || 0} transaç{resumo?.quantidadeDespesas === 1 ? 'ão' : 'ões'}
          </p>
        </div>

        {/* Card Saldo */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-xl shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Saldo</h3>
            </div>
          </div>
          <p className={`text-3xl font-bold mb-2 ${(resumo?.saldo || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatarMoeda(resumo?.saldo || 0)}
          </p>
          <p className="text-sm text-slate-600">
            {(resumo?.saldo || 0) >= 0 ? 'Positivo' : 'Negativo'}
          </p>
        </div>
      </div>

      {/* Cards Informativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dicas de Economia */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-800">Dicas de Economia</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-slate-600">
              <span className="text-emerald-500 mt-1">✓</span>
              <span>Registre todas as suas despesas diariamente</span>
            </li>
            <li className="flex items-start gap-2 text-slate-600">
              <span className="text-emerald-500 mt-1">✓</span>
              <span>Defina metas de economia mensais</span>
            </li>
            <li className="flex items-start gap-2 text-slate-600">
              <span className="text-emerald-500 mt-1">✓</span>
              <span>Evite compras por impulso</span>
            </li>
            <li className="flex items-start gap-2 text-slate-600">
              <span className="text-emerald-500 mt-1">✓</span>
              <span>Revise seus gastos semanalmente</span>
            </li>
          </ul>
        </div>

        {/* Status Financeiro */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-800">Status Financeiro</h3>
          </div>
          
          {resumo?.saldo >= 0 ? (
            <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
              <p className="font-semibold text-emerald-700 mb-2">✓ Situação Positiva</p>
              <p className="text-slate-600 text-sm">
                Suas receitas estão superando as despesas. Continue assim!
              </p>
            </div>
          ) : (
            <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
              <p className="font-semibold text-red-700 mb-2">⚠ Atenção Necessária</p>
              <p className="text-slate-600 text-sm">
                Suas despesas estão maiores que as receitas. Revise seus gastos.
              </p>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600 text-sm">Total de Transações</span>
              <span className="font-bold text-slate-800">
                {(resumo?.quantidadeReceitas || 0) + (resumo?.quantidadeDespesas || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600 text-sm">Média de Despesas</span>
              <span className="font-bold text-slate-800">
                {formatarMoeda((resumo?.totalDespesas || 0) / Math.max(resumo?.quantidadeDespesas || 1, 1))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;