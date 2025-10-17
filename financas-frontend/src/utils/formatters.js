// Formatar moeda em Real (R$)
export const formatarMoeda = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formatar data (DD/MM/YYYY)
export const formatarData = (dateString) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Formatar data para input (YYYY-MM-DD)
export const formatDateToInput = (dateString) => {
  return new Date(dateString).toISOString().split('T')[0];
};

// Classes CSS por tipo
export const getTipoClass = (tipo) => {
  return tipo === 'Receita' 
    ? 'text-green-600 bg-green-100' 
    : 'text-red-600 bg-red-100';
};

// Ícone por tipo
export const getTipoIcon = (tipo) => {
  return tipo === 'Receita' ? '↑' : '↓';
};

// Exports alternativos (compatibilidade)
export const formatCurrency = formatarMoeda;
export const formatDate = formatarData;