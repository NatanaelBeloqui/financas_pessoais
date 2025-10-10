import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import transacaoService from '../services/transacaoService';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';

const Dashboard = () => {
  const [resumo, setResumo] = useState(null);
  const [transacoesRecentes, setTransacoesRecentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resumoData, transacoesData] = await Promise.all([
        transacaoService.getResumo(),
        transacaoService.getAll(),
      ]);
      setResumo(resumoData);
      setTransacoesRecentes(transacoesData.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Carregando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral das suas finanças</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Receitas</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(resumo?.totalReceitas || 0)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Despesas</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {formatCurrency(resumo?.totalDespesas || 0)}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Saldo</p>
                <p className={`text-2xl font-bold mt-2 ${resumo?.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(resumo?.saldo || 0)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Wallet size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transações Recentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Transações Recentes</h2>
          </div>
          <div className="p-6">
            {transacoesRecentes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma transação encontrada</p>
            ) : (
              <div className="space-y-4">
                {transacoesRecentes.map((transacao) => (
                  <div key={transacao.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${transacao.tipo === 'Receita' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {transacao.tipo === 'Receita' ? (
                          <TrendingUp size={20} className="text-green-600" />
                        ) : (
                          <TrendingDown size={20} className="text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{transacao.descricao}</p>
                        <p className="text-sm text-gray-500">{transacao.categoriaNome}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transacao.tipo === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {transacao.tipo === 'Receita' ? '+' : '-'} {formatCurrency(transacao.valor)}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center justify-end mt-1">
                        <Calendar size={14} className="mr-1" />
                        {new Date(transacao.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;