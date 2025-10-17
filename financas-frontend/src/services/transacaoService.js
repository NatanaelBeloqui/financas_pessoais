import api from './api';

export const transacaoService = {
  getAll: async (params = {}) => {
    const response = await api.get('/transacoes', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/transacoes/${id}`);
    return response.data;
  },

  getResumo: async (mes, ano) => {
    const params = {};
    if (mes) params.mes = mes;
    if (ano) params.ano = ano;
    const response = await api.get('/transacoes/resumo', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/transacoes', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/transacoes/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/transacoes/${id}`);
  }
};

export default transacaoService;