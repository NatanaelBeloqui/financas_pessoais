import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wallet, LayoutDashboard, FolderOpen, Receipt, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/categorias', icon: FolderOpen, label: 'Categorias' },
    { to: '/transacoes', icon: Receipt, label: 'Transações' }
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-lg shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Finanças Pessoais
            </span>
          </div>

          {/* Links de Navegação */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Usuário e Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
              <User className="w-5 h-5 text-slate-600" />
              <span className="text-slate-700 font-semibold">{user?.nome}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        <div className="md:hidden pb-4 flex gap-2 overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;