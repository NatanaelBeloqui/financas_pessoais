import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, Mail, Lock, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro completo:', err);
      
      // Extrai mensagens de erro do backend
      if (err.errors) {
        const errorMessages = Object.values(err.errors).flat().join('. ');
        setError(errorMessages);
      } else if (err.message) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Email ou senha inválidos. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Decoração de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
          {/* Header com Gradient */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
              <Wallet className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta!</h1>
            <p className="text-emerald-50 flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Continue gerenciando suas finanças
            </p>
          </div>

          {/* Formulário */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Entrar na sua conta</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="input-field pl-11"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Digite sua senha"
                    className="input-field pl-11"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Esqueceu a senha - TODO */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-slate-600">
                    Lembrar de mim
                  </label>
                </div>
                <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                  Esqueceu a senha?
                </a>
              </div>

              {/* Botão de Login */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Entrando...</span>
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Link para Cadastro */}
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Não tem uma conta?{' '}
                <Link
                  to="/register"
                  className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline transition-colors"
                >
                  Criar conta grátis
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          © 2025 Finanças Pessoais - Seu dinheiro sob controle
        </p>
      </div>
    </div>
  );
};

export default Login;