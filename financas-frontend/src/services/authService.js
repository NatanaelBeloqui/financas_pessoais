import api from './api';

const authService = {
  register: async (userData) => {
    try {
      // Backend espera: nome, email, password, confirmPassword
      const response = await api.post('/Auth/register', {
        nome: userData.nome,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.usuario));
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro no registro:', error.response?.data);
      throw error.response?.data || error.message;
    }
  },

  login: async (credentials) => {
    try {
      // Backend espera: email, password
      const response = await api.post('/Auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.usuario));
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro no login:', error.response?.data);
      throw error.response?.data || error.message;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

export { authService };
export default authService;