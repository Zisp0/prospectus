import React, { useState } from 'react';
import { FiUpload, FiFileText, FiCheckCircle, FiAlertCircle, FiCopy, FiMenu, FiX } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import { uploadCSV } from '../services/api';
import { showError, showSuccess } from '../services/alerts';

const LoadCSV = () => {
    const [archive, setArchive] = useState(null);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setArchive(file);
            setReport(null);
        }
    };

    const handleUpload = async () => {
        if (!archive) {
            showError('Sin archivo', 'Selecciona un archivo CSV para continuar.');
            return;
        }
        if (!archive.name.endsWith('.csv')) {
            showError('Formato inválido', 'El archivo debe tener extensión .csv.');
            return;
        }

        setLoading(true);
        try {
            const data = await uploadCSV(archive);
            setReport(data);
            if (data.error) {
                showError('Error al procesar', data.error);
            } else {
                showSuccess('Archivo procesado', `Se procesaron ${data.total_procesados} registros.`);
            }
        } catch (e) {
            showError('Error de conexión', 'No se pudo contactar al servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setArchive(null);
        setReport(null);
        // Resetear el input de archivo
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Hamburguesa móvil */}
            <button className="fixed top-0 left-0 md:hidden p-4 z-50" onClick={() => setSidebarOpen(true)}>
                <FiMenu className="text-2xl text-gray-700" />
            </button>

            {/* Sidebar escritorio */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Sidebar overlay móvil */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true">
                    <div className="relative w-64 bg-indigo-600 text-white flex flex-col min-h-screen">
                        <div className="flex items-center justify-between h-20 border-b border-indigo-500 p-4">
                            <span className="ml-2 text-lg font-semibold text-white">Prospectus</span>
                            <button onClick={() => setSidebarOpen(false)} className="text-white">
                                <FiX />
                            </button>
                        </div>
                        <Sidebar />
                    </div>
                    <div className="flex-1 bg-black/30" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            <main className="flex-1 p-6 md:p-8 overflow-y-auto md:ml-64">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Carga masiva CSV</h1>
                    <p className="text-sm text-gray-600 mt-1">Sube un archivo CSV para registrar prospectos en lote.</p>
                </div>

                {/* Tarjeta de carga */}
                <div className="w-full">
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Seleccionar archivo</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            El archivo debe contener las columnas:{' '}
                            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-800">
                                documento, nombre, correo, fecha
                            </code>
                            . Formato de fecha: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-800">YYYY-MM-DD</code>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <label className="flex-1 cursor-pointer">
                                <div className={`rounded-lg border-2 border-dashed p-4 text-center transition ${archive
                                    ? 'border-indigo-300 bg-indigo-50'
                                    : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50'
                                    }`}>
                                    <FiFileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                    {archive ? (
                                        <p className="text-sm font-medium text-gray-800 truncate">{archive.name}</p>
                                    ) : (
                                        <p className="text-sm text-gray-600">Haz clic o arrastra un archivo CSV aquí</p>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="sr-only"
                                />
                            </label>

                            <div className="flex flex-col gap-2 sm:justify-center">
                                <button
                                    onClick={handleUpload}
                                    disabled={loading || !archive}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <FiUpload />
                                    {loading ? 'Procesando…' : 'Procesar CSV'}
                                </button>
                                {archive && (
                                    <button
                                        onClick={handleReset}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reporte */}
                    {report && !report.error && (
                        <div className="space-y-4">
                            {/* Tarjetas resumen */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <SummaryCard label="Total" value={report.total_procesados} color="indigo" icon={<FiFileText />} />
                                <SummaryCard label="Exitosos" value={report.exitosos} color="green" icon={<FiCheckCircle />} />
                                <SummaryCard label="Rechazados" value={report.rechazados} color="red" icon={<FiAlertCircle />} />
                                <SummaryCard label="Duplicados" value={report.duplicados} color="yellow" icon={<FiCopy />} />
                            </div>

                            {/* Detalle: exitosos */}
                            {report.detalle_exitosos?.length > 0 && (
                                <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
                                    <h3 className="text-base font-semibold text-green-600 mb-3">Registros exitosos</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
                                                <tr>
                                                    <th className="px-3 py-2">Fila</th>
                                                    <th className="px-3 py-2">Documento</th>
                                                    <th className="px-3 py-2">Nombre</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 text-gray-800">
                                                {report.detalle_exitosos.map((e, i) => (
                                                    <tr key={i} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2 text-gray-500">{e.fila}</td>
                                                        <td className="px-3 py-2 font-medium">{e.documento}</td>
                                                        <td className="px-3 py-2">{e.nombre}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Detalle: duplicados */}
                            {report.detalle_duplicados?.length > 0 && (
                                <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
                                    <h3 className="text-base font-semibold text-yellow-600 mb-3">Registros duplicados</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {report.detalle_duplicados.map((d, i) => (
                                            <div key={i} className="border-l-4 border-yellow-400 pl-3 py-1.5">
                                                <span className="text-sm font-medium text-gray-800">
                                                    Fila {d.fila}
                                                </span>
                                                <span className="text-sm text-gray-600"> — {d.nombre} ({d.documento})</span>
                                                <p className="text-sm text-yellow-700">{d.razon}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Detalle: rechazados */}
                            {report.detalle_rechazados?.length > 0 && (
                                <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
                                    <h3 className="text-base font-semibold text-red-600 mb-3">Registros rechazados</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {report.detalle_rechazados.map((r, i) => (
                                            <div key={i} className="border-l-4 border-red-400 pl-3 py-1.5">
                                                <span className="text-sm font-medium text-gray-800">
                                                    Fila {r.fila}
                                                </span>
                                                <span className="text-sm text-gray-600"> — {r.nombre} ({r.documento})</span>
                                                <ul className="text-sm text-red-600 list-disc ml-4 mt-0.5">
                                                    {r.errores.map((e, j) => <li key={j}>{e}</li>)}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const summaryStyles = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    green: 'bg-green-50  text-green-700  border-green-200',
    red: 'bg-red-50    text-red-700    border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700  border-yellow-200',
};

const SummaryCard = ({ label, value, color, icon }) => (
    <div className={`rounded-lg border p-4 ${summaryStyles[color]}`}>
        <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{icon}</span>
            <span className="text-xs font-semibold uppercase opacity-75">{label}</span>
        </div>
        <p className="text-3xl font-bold">{value}</p>
    </div>
);

export default LoadCSV;
