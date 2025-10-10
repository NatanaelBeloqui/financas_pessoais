import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import transacaoService from '../services/transacaoService';
import categoriaService from '../services/categoriaService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Filter } from 'lucide-react';

const Transacoes = () => {
  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    tipo: 'Receita',
    data: new Date().toISOString().split('T')[0],
    categoriaId: '',
    observacoes: '',
    recorrente: false,
    tipoRecorrencia: null,
  });

  useEffect(() => {
    loadData();
  }, [filtroTipo]);

  const loadData = async () => {
    try {
      const [transacoesData, categoriasData] = await Promise.all([
        transacaoService.getAll({ tipo: filtroTipo }),
        categoriaService.getAll(),
      ]);
      setTransacoes(transacoesData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        valor: parseFloat(formData.valor),
        categoriaId: parseInt(formData.categoriaId),
      };

      if (editingTransacao) {
        await transacaoService.update(editingTransacao.id, payload);
      } else {
        await transacaoService.create(payload);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      alert('Erro ao salvar transação');
    }
  };

  const handleEdit = (transacao) => {
    setEditingTransacao(transacao);
    setFormData({
      descricao: transacao.descricao,
      valor: transacao.valor.toString(),
      tipo: transacao.tipo,
      data: new Date(transacao.data).toISOString().split('T')[0],
      categoriaId: transacao.categoriaId.toString(),
      observacoes: transacao.observacoes || '',
      recorrente: transacao.recorrente,
      tipoRecorrencia: transacao.tipoRecorrencia,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await transacaoService.delete(id);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
        alert('Erro ao excluir transação');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      descricao: '',
      valor: '',
      tipo: 'Receita',
      data: new Date().toISOString().split('T')[0],
      categoriaId: '',
      observacoes: '',
      recorrente: false,
      tipoRecorrencia: null,
    });
    setEditingTransacao(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const categoriasFiltradas = categorias.filter(c => c.tipo === formData.tipo);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Transações</h1>
            <p className="text-gray-600 mt-1">Gerencie suas receitas e despesas</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} />
            <span>Nova Transação</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <Filter size={20} className="text-gray-600" />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os tipos</option>
              <option value="Receita">Receitas</option>
              <option value="Despesa">Despesas</option>
            </select>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {transacoes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma transação encontrada</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Criar primeira transação
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transacoes.map((transacao) => (
                <div key={transacao.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-full ${
                          transacao.tipo === 'Receita' ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        {transacao.tipo === 'Receita' ? (
                          <TrendingUp size={24} className="text-green-600" />
                        ) : (
                          <TrendingDown size={24} className="text-red-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{transacao.descricao}</h3>
                        <p className="text-sm text-gray-500">{transacao.categoriaNome}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(transacao.data)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            transacao.tipo === 'Receita' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transacao.tipo === 'Receita' ? '+' : '-'} {formatCurrency(transacao.valor)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(transacao)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(transacao.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingTransacao ? 'Editar Transação' : 'Nova Transação'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Descrição</label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Data</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value, categoriaId: '' })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Receita">Receita</option>
                  <option value="Despesa">Despesa</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Categoria</label>
                <select
                  value={formData.categoriaId}
                  onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categoriasFiltradas.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  {editingTransacao ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Transacoes;