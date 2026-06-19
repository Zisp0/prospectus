import React, { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiMenu, FiPlus, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import {
  createProspect,
  deleteProspect,
  fetchProspects,
  updateProspect,
} from '../services/api';
import { confirmAction, showError, showSuccess } from '../services/alerts';

const emptyForm = {
  documento: '',
  nombre: '',
  email: '',
  fecha: '',
};

const formatError = (error) => {
  if (!error || typeof error !== 'object') {
    return 'No se pudo guardar el prospecto';
  }

  return Object.entries(error)
    .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
    .join(' | ');
};

const Prospects = () => {
  const [prospects, setProspects] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = useMemo(() => (editing ? 'Editar prospecto' : 'Nuevo prospecto'), [editing]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  const loadProspects = async ({ search = query, currentPage = page, currentPageSize = pageSize } = {}) => {
    setLoading(true);
    try {
      const data = await fetchProspects({
        query: search,
        page: currentPage,
        pageSize: currentPageSize,
      });
      setProspects(data.results || []);
      setTotal(data.count || 0);
      setPage(data.page || currentPage);
    } catch (error) {
      showError('No se pudo cargar el listado', 'Revisa la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadProspects({ search: query, currentPage: page, currentPageSize: pageSize });
    }, 250);

    return () => clearTimeout(timeout);
  }, [query, page, pageSize]);

  const openCreateModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (prospecto) => {
    setEditing(prospecto);
    setForm({
      documento: prospecto.documento,
      nombre: prospecto.nombre,
      email: prospecto.email,
      fecha: prospecto.fecha,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (editing) {
        await updateProspect(editing.id, form);
        showSuccess('Prospecto actualizado', 'Los cambios se guardaron correctamente.');
      } else {
        await createProspect(form);
        showSuccess('Prospecto creado', 'El registro se creó correctamente.');
      }

      closeModal();
      loadProspects();
    } catch (error) {
      showError('No se pudo guardar', formatError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (prospecto) => {
    const confirmed = await confirmAction({
      title: 'Eliminar prospecto',
      text: `Esta acción eliminará a ${prospecto.nombre}.`,
      confirmButtonText: 'Eliminar',
    });
    if (!confirmed) {
      return;
    }

    try {
      await deleteProspect(prospecto.id);
      showSuccess('Prospecto eliminado', 'El registro fue eliminado correctamente.');
      loadProspects();
    } catch (error) {
      showError('No se pudo eliminar', 'Intenta nuevamente en unos segundos.');
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSearchChange = (event) => {
    setQuery(event.target.value);
    setPage(1);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <button className="fixed top-0 left-0 md:hidden p-4 z-50" onClick={() => setSidebarOpen(true)}>
        <FiMenu className="text-2xl text-gray-700" />
      </button>

      <div className="hidden md:block">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true">
          <div className="relative w-64 bg-indigo-600 text-white flex flex-col min-h-screen">
            <div className="flex items-center justify-between h-20 border-b border-indigo-500 p-4">
              <span className="ml-2 text-lg font-semibold text-white">Prospectus</span>
              <button onClick={() => setSidebarOpen(false)} className="text-white">x</button>
            </div>
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <main className="flex-1 p-6 md:p-8 overflow-y-auto md:ml-64">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prospectos</h1>
            <p className="text-sm text-gray-600 mt-1">{total} registros encontrados</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <FiPlus />
            Crear prospecto
          </button>
        </div>

        <div className="mb-4 max-w-md">
          <label htmlFor="search" className="sr-only">Buscar prospectos</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              id="search"
              type="search"
              value={query}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre o documento"
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">Cargando prospectos...</td>
                  </tr>
                ) : prospects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No hay prospectos para mostrar</td>
                  </tr>
                ) : (
                  prospects.map((prospect) => (
                    <tr key={prospect.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{prospect.documento}</td>
                      <td className="px-4 py-3">{prospect.nombre}</td>
                      <td className="px-4 py-3">{prospect.email}</td>
                      <td className="px-4 py-3">{prospect.fecha}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(prospect)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={`Editar ${prospect.nombre}`}
                            title="Editar"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(prospect)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label={`Eliminar ${prospect.nombre}`}
                            title="Eliminar"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 md:flex-row md:items-center md:justify-between">
          <div>
            Mostrando {firstItem}-{lastItem} de {total}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2">
              <span>Por página</span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="min-w-24 text-center">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || loading}
                className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={closeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Cerrar"
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label htmlFor="documento" className="block text-xs font-semibold uppercase text-gray-600">Documento</label>
                <input
                  id="documento"
                  name="documento"
                  value={form.documento}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="nombre" className="block text-xs font-semibold uppercase text-gray-600">Nombre</label>
                <input
                  id="nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase text-gray-600">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="fecha" className="block text-xs font-semibold uppercase text-gray-600">Fecha</label>
                <input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={form.fecha}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prospects;
