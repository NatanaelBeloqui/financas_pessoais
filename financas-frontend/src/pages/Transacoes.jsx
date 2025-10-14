import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Receipt, TrendingUp, TrendingDown, Filter, Calendar } from 'lucide-react';
import { transacaoService } from '../services/transacaoService';
import { categoriaService } from '../services/categoriaService';
import { formatarMoeda, formatarData } from '../utils/formatters';

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
    tipo: 'Despesa',
    data: new Date().toISOString().split('T')[0],
    categoriaId: '',
    observacoes: '',
    recorrente: false,
    tipoRecorrencia: 'Mensal'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transacoesData, categoriasData] = await Promise.all([
        transacaoService.getAll(),
        categoriaService.getAll()
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
        categoriaId: parseInt(formData.categoriaId)
      };

      if (editingTransacao) {
        await transacaoService.update(editingTransacao.id, payload);
      } else {
        await transacaoService.create(payload);
      }
      loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await transacaoService.delete(id);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
      }
    }
  };

  const handleEdit = (transacao) => {
    setEditingTransacao(transacao);
    setFormData({
      descricao: transacao.descricao,
      valor: transacao.valor.toString(),
      tipo: transacao.tipo,
      data: transacao.data.split('T')[0],
      categoriaId: transacao.categoriaId.toString(),
      observacoes: transacao.observacoes || '',
      recorrente: transacao.recorrente,
      tipoRecorrencia: transacao.tipoRecorrencia || 'Mensal'
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransacao(null);
    setFormData({
      descricao: '',
      valor: '',
      tipo: 'Despesa',
      data: new Date().toISOString().split('T')[0],
      categoriaId: '',
      observacoes: '',
      recorrente: false,
      tipoRecorrencia: 'Mensal'
    });
  };

  const filteredTransacoes = filtroTipo
    ? transacoes.filter(t => t.tipo === filtroTipo)
    : transacoes;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Carregando transações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Transações</h1>
          <p className="text-slate-600">Gerencie suas receitas e despesas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Transação
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setFiltroTipo('')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filtroTipo === ''
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFiltroTipo('Receita')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            filtroTipo === 'Receita'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Receitas
        </button>
        <button
          onClick={() => setFiltroTipo('Despesa')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            filtroTipo === 'Despesa'
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Despesas
        </button>
      </div>

      {/* Lista de Transações */}
      <div className="space-y-4">
        {filteredTransacoes.map((transacao) => (
          <div
            key={transacao.id}
            className="card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex items-start gap-4 flex-1">
              <div
                className={`p-3 rounded-lg ${
                  transacao.tipo === 'Receita'
                    ? 'bg-emerald-100'
                    : 'bg-red-100'
                }`}
              >
                {transacao.tipo === 'Receita' ? (
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-800">{transacao.descricao}</h3>
                  {transacao.recorrente && (
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-semibold">
                      Recorrente
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatarData(transacao.data)}
                  </span>
                  {transacao.categoriaNome && (
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${transacao.categoriaCor}20`,
                        color: transacao.categoriaCor
                      }}
                    >
                      {transacao.categoriaNome}
                    </span>
                  )}
                </div>
                {transacao.observacoes && (
                  <p className="text-sm text-slate-500 mt-1">{transacao.observacoes}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`text-2xl font-bold ${
                  transacao.tipo === 'Receita'
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                {transacao.tipo === 'Receita' ? '+' : '-'} {formatarMoeda(transacao.valor)}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(transacao)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(transacao.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTransacoes.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">Nenhuma transação encontrada</p>
          <p className="text-slate-400 text-sm">Crie sua primeira transação para começar</p>
        </div>
      )}

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-fadeIn my-8">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">
                {editingTransacao ? 'Editar Transação' : 'Nova Transação'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Salário, Mercado, Conta de luz..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="input-field"
                    placeholder="0,00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="input-field"
                  >
                    <option value="Despesa">Despesa</option>
                    <option value="Receita">Receita</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={formData.categoriaId}
                    onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Selecione...</option>
                    {categorias
                      .filter(c => c.tipo === formData.tipo)
                      .map(categoria => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Detalhes adicionais..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recorrente"
                  checked={formData.recorrente}
                  onChange={(e) => setFormData({ ...formData, recorrente: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded"
                />
                <label htmlFor="recorrente" className="text-sm font-semibold text-slate-700">
                  Transação recorrente
                </label>
              </div>

              {formData.recorrente && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Recorrência
                  </label>
                  <select
                    value={formData.tipoRecorrencia}
                    onChange={(e) => setFormData({ ...formData, tipoRecorrencia: e.target.value })}
                    className="input-field"
                  >
                    <option value="Diaria">Diária</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Mensal">Mensal</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingTransacao ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transacoes;