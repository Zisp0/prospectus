import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiUpload, FiSettings, FiLogOut } from 'react-icons/fi';
import LogoMark from '../components/LogoMark';
import { logOut } from '../services/api';
import { showError } from '../services/alerts';
import AuthContext from '../context/AuthContext';

const navItems = [
  { name: 'Inicio', path: '/', icon: <FiHome className="inline-block mr-2" /> },
  { name: 'Prospectos', path: '/prospectos', icon: <FiUsers className="inline-block mr-2" /> },
  { name: 'Carga CSV', path: '/carga-csv', icon: <FiUpload className="inline-block mr-2" /> },
];

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await logOut();
      if (response.status !== 205) {
        throw new Error('Unexpected logout response');
      }
      logout();
      navigate('/login', { replace: true });
    } catch (e) {
      showError('No se pudo cerrar sesión', 'Intenta nuevamente en unos segundos.');
    }
  };

  return (
    <aside className="fixed top-0 left-0 z-30 w-64 h-screen bg-indigo-600 text-white flex flex-col">
      <div className="flex items-center justify-center h-20 border-b border-indigo-500">
        <LogoMark />
        <span className="ml-2 text-lg font-semibold text-white">Prospectus</span>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className="flex items-center px-4 py-2 rounded text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
              >
                {item.icon}
                {item.name}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 rounded text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
            >
              <FiLogOut className="inline-block mr-2" />
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>
      <footer className="p-4 text-xs text-white border-t border-indigo-500">
        © {new Date().getFullYear()} Prospectus
      </footer>
    </aside>
  );
};

export default Sidebar;
