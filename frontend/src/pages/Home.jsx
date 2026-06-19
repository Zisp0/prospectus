import React, { useContext, useEffect, useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import AuthContext from '../context/AuthContext';
import Sidebar from "../components/Sidebar";
import { fetchDashboardStats } from "../services/api";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile header */}
      <button className={`fixed top-0 left-0 md:hidden p-4 z-50 ${sidebarOpen ? 'hidden' : ''}`} onClick={() => setSidebarOpen(true)}>
        <FiMenu className="text-2xl text-gray-700" />
      </button>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true">
          {/* Side panel */}
          <div className="relative w-64 bg-indigo-600 text-white flex flex-col min-h-screen">
            <div className="flex items-center justify-between h-20 border-b border-indigo-500 p-4">
              <span className="ml-2 text-lg font-semibold text-white">Prospectus</span>
              <button onClick={() => setSidebarOpen(false)} className="text-white">✕</button>
            </div>
            <Sidebar />
          </div>
          {/* Clickable overlay to close */}
          <div className="flex-1 bg-black/30" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50 md:ml-64">
        <h1 className="text-3xl font-bold mb-4">
          Bienvenido{user ? `, ${user.username}` : ''}!
        </h1>
        {loading ? (
          <p className="text-gray-600">Cargando estadísticas…</p>
        ) : (
          stats && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Total prospectos</h2>
                  <p className="text-4xl font-bold text-primary">{stats.total_prospectos}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Prospectos hoy</h2>
                  <p className="text-4xl font-bold text-primary">{stats.prospectos_hoy}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Latest 5 prospects */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">Últimos 5 prospectos</h2>
                  <ul className="space-y-2">
                    {stats.ultimos_5_prospectos.map((p) => (
                      <li key={p.id} className="border-b pb-2">
                        <p className="font-medium text-gray-800">{p.nombre} ({p.email})</p>
                        <p className="text-sm text-gray-600">Creado: {new Date(p.creado_en).toLocaleDateString()}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Prospects last 7 days chart */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900">Prospectos últimos 7 días</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={Object.entries(stats.prospectos_por_dia).map(([day, count]) => ({ date: new Date(day).toLocaleDateString(), count }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#2563eb" name="Prospectos" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default Home;
