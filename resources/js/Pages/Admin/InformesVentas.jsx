import AdminSidebar from "./AdminSidebar";
import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import GraficaVentas from "./Components/GraficaVentas";
import FacturaPreview, { construirPrefactura } from "./Components/FacturaPreview";
import axios from 'axios';
import { 
    BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell
} from 'recharts';

export default function InformesVentas() {

    const {
        estadisticas,
        facturas,
        suscripciones,
        metodosPago,
        conteos,
        datosGraficas,
        topClientes,
        metodosPagoData,
        comparativaPrevia,
        periodo: periodoInicial,
        fecha: fechaInicial,
        filtros: filtrosInicial,
        flash
    } = usePage().props;

    const [mostrarModal, setMostrarModal] = useState(false);
    const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

    const [mostrarPago, setMostrarPago] = useState(false);

    // Vista previa dentro del modal Nueva Factura (prefactura en vivo)
    const [mostrarPrefactura, setMostrarPrefactura] = useState(true);

    const [pago, setPago] = useState({
        factura_id: "",
        metodo_pago_id: "",
        monto: "",
    });
    const [busqueda, setBusqueda] = useState("");

    const [esClienteExterno, setEsClienteExterno] = useState(false);
    const [busquedaUsuario, setBusquedaUsuario] = useState('');
    const [resultadosUsuario, setResultadosUsuario] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [formulario, setFormulario] = useState({
        suscripcion_id: "",
        usuario_id: "",
        cliente_nombre: "",
        cliente_cedula: "",
        cliente_telefono: "",
        cliente_email: "",
        concepto: "",
        fecha_emision: "",
        fecha_vencimiento: "",
        total: "",
    });

    // 🆕 Estados para filtros avanzados (periodo/fecha/metodo/estado)
    const [periodo, setPeriodo] = useState(periodoInicial || 'mes');
    const [fecha, setFecha] = useState(fechaInicial || new Date().toISOString().split('T')[0]);
    const [metodoPagoFiltro, setMetodoPagoFiltro] = useState(filtrosInicial?.metodo_pago || '');
    const [estadoFacturaFiltro, setEstadoFacturaFiltro] = useState(filtrosInicial?.estado_factura || '');
    const [mostrarComparativa, setMostrarComparativa] = useState(true);

    // 🆕 Paginación de la tabla de facturas (se hace en el navegador, no recarga la página)
    const [paginaActual, setPaginaActual] = useState(1);
    const FACTURAS_POR_PAGINA = 15;

    // 🆕 Modo de vista: 'grafico' muestra KPIs + gráficas, 'operativo' se enfoca solo en la tabla
    const [modoVista, setModoVista] = useState('grafico');

    const dinero = (valor) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(valor || 0);

    // 🆕 Aplicar filtros de período / método / estado
    const aplicarFiltros = () => {
        const params = { periodo, fecha };
        if (metodoPagoFiltro) params.metodo_pago = metodoPagoFiltro;
        if (estadoFacturaFiltro) params.estado_factura = estadoFacturaFiltro;

        router.get('/admin/ventas', params, {
            preserveState: true, // 🆕 mantiene la búsqueda escrita y la página actual
            preserveScroll: true,
            replace: false,
        });
    };

    // 🆕 Resetear filtros a los valores por defecto
    const resetearFiltros = () => {
        setPeriodo('mes');
        setFecha(new Date().toISOString().split('T')[0]);
        setMetodoPagoFiltro('');
        setEstadoFacturaFiltro('');
        router.get('/admin/ventas', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: false,
        });
    };

    const buscarUsuarios = (texto) => {
        setBusquedaUsuario(texto);
        if (texto.trim().length < 2) {
            setResultadosUsuario([]);
            return;
        }
        axios.get('/admin/ventas/buscar-usuario', { params: { query: texto } })
            .then(res => setResultadosUsuario(res.data))
            .catch(() => setResultadosUsuario([]));
    };

    // Reinicia el formulario tras crear / cancelar
    const resetFormulario = () => {
        setFormulario({
            suscripcion_id: "",
            usuario_id: "",
            cliente_nombre: "",
            cliente_cedula: "",
            cliente_telefono: "",
            cliente_email: "",
            concepto: "",
            fecha_emision: "",
            fecha_vencimiento: "",
            total: ""
        });
        setEsClienteExterno(false);
        setUsuarioSeleccionado(null);
    };

    const facturasFiltradas = facturas.filter((factura) => {
        const cliente = (factura.suscripcion?.usuario?.nombre || factura.cliente_nombre || "").toLowerCase();
        const plan = (factura.suscripcion?.plan?.nombre || factura.concepto || "").toLowerCase();

        return (
            cliente.includes(busqueda.toLowerCase()) ||
            plan.includes(busqueda.toLowerCase())
        );

    });

    // 🆕 Paginación sobre el resultado ya filtrado por búsqueda (no afecta la búsqueda, solo corta en páginas)
    const totalPaginas = Math.max(1, Math.ceil(facturasFiltradas.length / FACTURAS_POR_PAGINA));
    const paginaSegura = Math.min(paginaActual, totalPaginas);
    const facturasPaginadas = facturasFiltradas.slice(
        (paginaSegura - 1) * FACTURAS_POR_PAGINA,
        paginaSegura * FACTURAS_POR_PAGINA
    );

    // 🆕 Cambiar el texto de búsqueda siempre regresa a la página 1
    const manejarCambioBusqueda = (texto) => {
        setBusqueda(texto);
        setPaginaActual(1);
    };

    // Datos derivados para la prefactura en vivo (NO toca la lógica del store)
    const datosPrefactura = construirPrefactura(formulario, {
        suscripciones,
        usuarioSeleccionado,
        esClienteExterno,
    });

    // Clases reutilizables para las etiquetas de estado
    const claseEstado = (nombreEstado) => {
        switch (nombreEstado) {
            case "Pagado":
                return "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400";
            case "Pendiente":
                return "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400";
            case "Abonado":
                return "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400";
            case "Anulado":
                return "bg-gray-200 dark:bg-[#4A4033] text-gray-700 dark:text-[#C2B49A]";
            default:
                return "bg-gray-100 dark:bg-[#4A4033] text-gray-600 dark:text-[#C2B49A]";
        }
    };

    // 🆕 Datos para gráfica de pastel de estados
    const datosEstados = [
        { nombre: "Pagadas", valor: conteos?.facturasPagadas || 0, color: "#10b981" },
        { nombre: "Pendientes", valor: conteos?.facturasPendientes || 0, color: "#ef4444" },
        { nombre: "Abonadas", valor: conteos?.facturasAbonadas || 0, color: "#f59e0b" },
    ];

    return (
        <div className="min-h-screen bg-[#F4EDE6] dark:bg-[#221D17] font-['Hepta_Slab'] flex relative text-[#5D4E3F] dark:text-[#EDE4D3] transition-colors duration-500">

            <AdminSidebar />

            <main className="content-shift flex-1 p-4 sm:p-10">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                    <div>
                        <h1 className="text-2xl sm:text-2xl font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">
                            Informes de Ventas
                        </h1>

                        <p className="text-[#7C6B58] dark:text-[#C2B49A] mt-1 text-[13px]">
                            Control financiero, facturación y pagos del sistema Mouren.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <a
                            href={`/admin/ventas/exportar?periodo=${periodo}&fecha=${fecha}${metodoPagoFiltro ? `&metodo_pago=${metodoPagoFiltro}` : ''}${estadoFacturaFiltro ? `&estado_factura=${estadoFacturaFiltro}` : ''}`}
                            className="bg-[#F5C227] hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md transition text-center"
                        >
                            📥 Exportar Excel
                        </a>

                        <button
                            onClick={() => setMostrarModal(true)}
                            className="bg-[#8B5E3C] hover:bg-[#6F482D] text-white px-6 py-3 rounded-xl shadow-md transition"
                        >
                            + Nueva Factura
                        </button>
                    </div>

                </div>

                {/* 🆕 TOGGLE MODO GRÁFICO / MODO OPERATIVO */}
                <div className="mt-4 inline-flex bg-white dark:bg-[#2E2720] border dark:border-[#4A4033] rounded-xl p-1 gap-1 shadow-sm">
                    <button
                        type="button"
                        onClick={() => setModoVista('grafico')}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${modoVista === 'grafico' ? 'bg-[#8B5E3C] text-white' : 'text-[#5D4E3F] dark:text-[#EDE4D3]'}`}
                    >
                        📊 Modo Gráfico
                    </button>
                    <button
                        type="button"
                        onClick={() => setModoVista('operativo')}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${modoVista === 'operativo' ? 'bg-[#8B5E3C] text-white' : 'text-[#5D4E3F] dark:text-[#EDE4D3]'}`}
                    >
                        📋 Modo Operativo
                    </button>
                </div>

                {flash?.success && (
                    <div className="mt-6 bg-green-100 dark:bg-green-950/40 border border-green-300 dark:border-green-800 text-green-800 dark:text-green-400 px-5 py-4 rounded-xl">
                        ✅ {flash.success}
                    </div>
                )}

                {/* ============================================================= */}
                {/* 🆕 FILTROS DE PERÍODO, MÉTODO DE PAGO Y ESTADO                 */}
                {/*    (Reemplaza el antiguo aviso de Mercado Pago)                */}
                {/* ============================================================= */}
                <div className="mt-8 bg-white dark:bg-[#2E2720] border border-transparent dark:border-[#4A4033] rounded-2xl shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">
                            📅 Filtrar informes
                        </h3>
                        <button
                            onClick={resetearFiltros}
                            className="text-sm text-[#8B5E3C] dark:text-[#C2A275] hover:underline font-semibold"
                        >
                            🔄 Resetear filtros
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="text-sm text-[#7C6B58] dark:text-[#C2B49A] font-semibold">Período</label>
                            <select
                                value={periodo}
                                onChange={(e) => setPeriodo(e.target.value)}
                                className="w-full mt-2 bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3"
                            >
                                <option value="dia">📅 Día</option>
                                <option value="semana">📊 Semana</option>
                                <option value="mes">📈 Mes</option>
                                <option value="anio">📉 Año</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-[#7C6B58] dark:text-[#C2B49A] font-semibold">Fecha</label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="w-full mt-2 bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-[#7C6B58] dark:text-[#C2B49A] font-semibold">Método de pago</label>
                            <select
                                value={metodoPagoFiltro}
                                onChange={(e) => setMetodoPagoFiltro(e.target.value)}
                                className="w-full mt-2 bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3"
                            >
                                <option value="">Todos</option>
                                {metodosPago.map((m) => (
                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-[#7C6B58] dark:text-[#C2B49A] font-semibold">Estado factura</label>
                            <select
                                value={estadoFacturaFiltro}
                                onChange={(e) => setEstadoFacturaFiltro(e.target.value)}
                                className="w-full mt-2 bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3"
                            >
                                <option value="">Todos</option>
                                <option value="1">Pendiente</option>
                                <option value="2">Pagado</option>
                                <option value="3">Abonado</option>
                                <option value="4">Anulado</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={aplicarFiltros}
                                className="w-full bg-[#8B5E3C] hover:bg-[#6F482D] text-white px-6 py-3 rounded-xl transition font-semibold"
                            >
                                🔍 Aplicar
                            </button>
                        </div>
                    </div>
                </div>

                {/* TARJETAS */}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">

                    <div className="bg-white dark:bg-[#2E2720] border border-transparent dark:border-[#4A4033] rounded-2xl shadow p-6">
                        <p className="text-sm text-gray-500 dark:text-[#C2B49A]">
                            Ingresos Totales
                        </p>

                        <h2 className="text-3xl font-bold text-[#5D4E3F] dark:text-[#EDE4D3] mt-2">
                            {dinero(estadisticas.ingresos)}
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-[#2E2720] border border-transparent dark:border-[#4A4033] rounded-2xl shadow p-6">
                        <p className="text-sm text-gray-500 dark:text-[#C2B49A]">
                            Facturas Emitidas
                        </p>

                        <h2 className="text-3xl font-bold text-[#5D4E3F] dark:text-[#EDE4D3] mt-2">
                            {conteos?.totalFacturas ?? 0}
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-[#2E2720] border border-transparent dark:border-[#4A4033] rounded-2xl shadow p-6">
                        <p className="text-sm text-gray-500 dark:text-[#C2B49A]">
                            Facturas Pagadas
                        </p>

                        <h2 className="text-3xl font-bold text-green-700 dark:text-green-400 mt-2">
                            {conteos?.facturasPagadas ?? 0}
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-[#2E2720] border border-transparent dark:border-[#4A4033] rounded-2xl shadow p-6">
                        <p className="text-sm text-gray-500 dark:text-[#C2B49A]">
                            Pendientes
                        </p>

                        <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                            {conteos?.facturasPendientes ?? 0}
                        </h2>

                    </div>

                </div>

                {/* 🆕 TOGGLE: Modo Gráfico (con KPIs extra + gráficas) vs Modo Operativo (solo tabla) */}
                {modoVista === 'grafico' && (
                <>
                {/* ============================================================= */}
                {/* 🆕 COMPARATIVA VS PERÍODO ANTERIOR                             */}
                {/* ============================================================= */}
                {mostrarComparativa && comparativaPrevia && (
                    <div className="mt-8 bg-white dark:bg-[#2E2720] border border-transparent dark:border-[#4A4033] rounded-2xl shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">
                                📈 Comparativa vs período anterior
                            </h3>
                            <button
                                onClick={() => setMostrarComparativa(false)}
                                className="text-xs text-[#7C6B58] dark:text-[#C2B49A] hover:text-[#5D4E3F] dark:hover:text-[#EDE4D3]"
                            >
                                ✕ Ocultar
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-[#F8F5F0] dark:bg-[#221D17] rounded-xl p-4">
                                <p className="text-sm text-[#7C6B58] dark:text-[#C2B49A]">Período actual</p>
                                <h3 className="text-2xl font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">
                                    {dinero(comparativaPrevia.ingresosActual)}
                                </h3>
                            </div>

                            <div className="bg-[#F8F5F0] dark:bg-[#221D17] rounded-xl p-4">
                                <p className="text-sm text-[#7C6B58] dark:text-[#C2B49A]">Período anterior</p>
                                <h3 className="text-2xl font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">
                                    {dinero(comparativaPrevia.ingresosPrevia)}
                                </h3>
                            </div>

                            <div className={`rounded-xl p-4 ${comparativaPrevia.cambioPositivo ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                                <p className={`text-sm ${comparativaPrevia.cambioPositivo ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    Cambio
                                </p>
                                <h3 className={`text-2xl font-bold ${comparativaPrevia.cambioPositivo ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                    {comparativaPrevia.cambioPositivo ? '📈' : '📉'} {comparativaPrevia.porcentajecambio}%
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================= */}
                {/* GRÁFICA ORIGINAL (Pagadas vs Pendientes)                       */}
                {/* ============================================================= */}
                <div className="mt-10">

                    <GraficaVentas

                        pagadas={conteos?.facturasPagadas ?? 0}

                        pendientes={conteos?.facturasPendientes ?? 0}

                    />

                </div>

                {/* ============================================================= */}
                {/* 🆕 NUEVAS GRÁFICAS: Ingresos por período + Estado de facturas  */}
                {/* ============================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                    <div className="bg-white dark:bg-[#2E2720] border border-transparent dark:border-[#4A4033] rounded-2xl shadow p-6">
                        <h3 className="text-lg font-bold text-[#5D4E3F] dark:text-[#EDE4D3] mb-4">
                            💹 Ingresos por período
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={datosGraficas || []}>
                                <defs>
                                    <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5E3C" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8B5E3C" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                                <XAxis
                                    dataKey={periodo === 'anio' ? 'mes' : periodo === 'mes' ? 'dia' : (datosGraficas?.[0] && 'hora' in datosGraficas[0]) ? 'hora' : 'dia'}
                                    stroke="#7C6B58"
                                />
                                <YAxis stroke="#7C6B58" />
                                <Tooltip formatter={(value) => dinero(value)} />
                                <Area type="monotone" dataKey="monto" stroke="#8B5E3C" strokeWidth={2} fillOpacity={1} fill="url(#colorMonto)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white dark:bg-[#2E2720] border border-transparent dark:border-[#4A4033] rounded-2xl shadow p-6">
                        <h3 className="text-lg font-bold text-[#5D4E3F] dark:text-[#EDE4D3] mb-4">
                            📊 Estado de facturas
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={datosEstados}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ nombre, valor }) => `${nombre}: ${valor}`}
                                    outerRadius={100}
                                    fill="#8B5E3C"
                                    dataKey="valor"
                                >
                                    {datosEstados.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                </div>

                {/* ============================================================= */}
                {/* 🆕 NUEVAS GRÁFICAS: Top clientes + Métodos de pago             */}
                {/* ============================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

                    <div className="bg-white dark:bg-[#2E2720] border border-transparent dark:border-[#4A4033] rounded-2xl shadow p-6">
                        <h3 className="text-lg font-bold text-[#5D4E3F] dark:text-[#EDE4D3] mb-4">
                            👥 Top 5 clientes
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={topClientes || []}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                                <XAxis type="number" stroke="#7C6B58" />
                                <YAxis dataKey="cliente" type="category" stroke="#7C6B58" width={90} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(value) => dinero(value)} />
                                <Bar dataKey="monto" fill="#D6A64F" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white dark:bg-[#2E2720] border border-transparent dark:border-[#4A4033] rounded-2xl shadow p-6">
                        <h3 className="text-lg font-bold text-[#5D4E3F] dark:text-[#EDE4D3] mb-4">
                            💳 Métodos de pago
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={metodosPagoData || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                                <XAxis dataKey="metodo" stroke="#7C6B58" />
                                <YAxis stroke="#7C6B58" />
                                <Tooltip formatter={(value) => dinero(value)} />
                                <Bar dataKey="monto" fill="#F5C227" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </div>
                </>
                )}

                <div className="mt-10 mb-5">

                    <input
                        type="text"
                        placeholder="🔍 Buscar por cliente o plan..."
                        value={busqueda}
                        onChange={(e) => manejarCambioBusqueda(e.target.value)}
                        className="w-full md:w-96 bg-white dark:bg-[#2E2720] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                    />

                </div>

                {/* ============================================================= */}
                {/*  TABLA — fuente neutral, encabezados discretos, menos negrilla */}
                {/* ============================================================= */}

                <div className="bg-white dark:bg-[#2E2720] border border-transparent dark:border-[#4A4033] rounded-2xl shadow mt-10 overflow-hidden overflow-x-auto font-sans">

                    <div className="flex items-center justify-between px-6 py-5 border-b dark:border-[#4A4033]">

                        <h2 className="text-xl font-semibold text-[#5D4E3F] dark:text-[#EDE4D3] tracking-tight">
                            Últimas Facturas
                        </h2>

                        <span className="text-xs text-[#8C7A67] dark:text-[#C2B49A]">
                            {facturasFiltradas.length} {facturasFiltradas.length === 1 ? 'resultado' : 'resultados'}
                        </span>

                    </div>

                    <table className="w-full min-w-[800px] text-sm">

                        <thead className="bg-[#F2ECE5] dark:bg-[#221D17]">

                            <tr>

                                <th className="text-left p-4 text-[11px] font-medium uppercase tracking-wider text-[#8C7A67] dark:text-[#C2B49A]">Factura</th>
                                <th className="text-left p-4 text-[11px] font-medium uppercase tracking-wider text-[#8C7A67] dark:text-[#C2B49A]">Titular Suscripción</th>
                                <th className="text-left p-4 text-[11px] font-medium uppercase tracking-wider text-[#8C7A67] dark:text-[#C2B49A]">Suscripción</th>
                                <th className="text-left p-4 text-[11px] font-medium uppercase tracking-wider text-[#8C7A67] dark:text-[#C2B49A]">Plan Elegido</th>
                                <th className="text-left p-4 text-[11px] font-medium uppercase tracking-wider text-[#8C7A67] dark:text-[#C2B49A]">Emisión</th>
                                <th className="text-left p-4 text-[11px] font-medium uppercase tracking-wider text-[#8C7A67] dark:text-[#C2B49A]">Valor</th>
                                <th className="text-left p-4 text-[11px] font-medium uppercase tracking-wider text-[#8C7A67] dark:text-[#C2B49A]">Estado</th>
                                <th className="text-center p-4 text-[11px] font-medium uppercase tracking-wider text-[#8C7A67] dark:text-[#C2B49A]">Acciones</th>

                            </tr>

                        </thead>

                        <tbody>

                            {facturas.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="text-center py-12 text-gray-500 dark:text-[#C2B49A] text-sm"
                                    >
                                        No existen facturas registradas.
                                    </td>

                                </tr>

                            ) : facturasFiltradas.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="8"
                                        className="text-center py-12 text-gray-500 dark:text-[#C2B49A] text-sm"
                                    >
                                        No hay facturas que coincidan con tu búsqueda.
                                    </td>
                                </tr>

                            ) : (

                                facturasPaginadas.map((factura) => (

                                    <tr
                                        key={factura.id}
                                        className="border-b last:border-b-0 dark:border-[#4A4033] hover:bg-[#FAF7F2] dark:hover:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] transition-colors"
                                    >

                                        <td className="p-4 text-[#8C7A67] dark:text-[#C2B49A] font-normal">
                                            #{factura.id}
                                        </td>

                                        <td className="p-4 font-normal">
                                            {factura.suscripcion?.usuario?.nombre || factura.cliente_nombre || '—'}
                                        </td>

                                        <td className="p-4 font-normal">
                                            {factura.suscripcion_id ?? <span className="text-[10px] italic opacity-60">Venta directa</span>}
                                        </td>

                                        <td className="p-4 font-normal">
                                            {factura.suscripcion?.plan?.nombre || factura.concepto || '—'}
                                        </td>

                                        <td className="p-4 font-normal text-[#8C7A67] dark:text-[#C2B49A]">
                                            {factura.fecha_emision}
                                        </td>

                                        <td className="p-4 font-medium">
                                            {dinero(factura.total)}
                                        </td>

                                        <td className="p-4">

                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${claseEstado(factura.estado?.nombre)}`}
                                            >

                                                {factura.estado?.nombre}

                                            </span>

                                        </td>
                                        <td className="p-4">

                                            <div className="flex justify-center gap-2">

                                                <button
                                                    onClick={() => setFacturaSeleccionada(factura)}
                                                    title="Ver factura"
                                                    className="bg-blue-100 dark:bg-blue-950/40 hover:bg-blue-200 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    👁
                                                </button>

                                                <a
                                                    href={`/admin/facturas/${factura.id}/pdf`}
                                                    target="_blank"
                                                    title="Descargar PDF"
                                                    className="bg-green-100 dark:bg-green-950/40 hover:bg-green-200 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    📄
                                                </a>

                                                <button
                                                    onClick={() => {

                                                        if (!confirm("¿Desea anular esta factura?")) return;

                                                        router.put(`/admin/facturas/${factura.id}/anular`);

                                                    }}
                                                    title="Anular factura"
                                                    className="bg-red-100 dark:bg-red-950/40 hover:bg-red-200 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    🚫
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                    {/* 🆕 CONTROLES DE PAGINACIÓN */}
                    {facturasFiltradas.length > FACTURAS_POR_PAGINA && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-6 py-4 border-t dark:border-[#4A4033]">
                            <span className="text-xs text-[#8C7A67] dark:text-[#C2B49A]">
                                Página {paginaSegura} de {totalPaginas} — mostrando {facturasPaginadas.length} de {facturasFiltradas.length} facturas
                            </span>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                                    disabled={paginaSegura === 1}
                                    className="px-4 py-2 rounded-lg border dark:border-[#4A4033] text-[#5D4E3F] dark:text-[#EDE4D3] text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F5F0] dark:hover:bg-[#221D17] transition"
                                >
                                    ← Anterior
                                </button>
                                <button
                                    onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                                    disabled={paginaSegura === totalPaginas}
                                    className="px-4 py-2 rounded-lg border dark:border-[#4A4033] text-[#5D4E3F] dark:text-[#EDE4D3] text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F5F0] dark:hover:bg-[#221D17] transition"
                                >
                                    Siguiente →
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                {/* ============================================================= */}
                {/*  MODAL NUEVA FACTURA  +  PREFACTURA EN VIVO (2 columnas)       */}
                {/*  ⚠️ SIN CAMBIOS — se mantiene igual al original                */}
                {/* ============================================================= */}
                {mostrarModal && (

                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

                        <div className="bg-white dark:bg-[#2E2720] rounded-3xl shadow-2xl w-full max-w-[1150px] max-h-[92vh] overflow-hidden flex flex-col lg:flex-row">

                            {/* ---------- Columna izquierda: FORMULARIO ---------- */}
                            <div className="w-full lg:w-[46%] p-8 overflow-y-auto">

                                <div className="flex justify-between items-center">

                                    <h2 className="text-2xl font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">
                                        Nueva Factura
                                    </h2>

                                    <button
                                        onClick={() => setMostrarModal(false)}
                                        className="text-2xl text-[#5D4E3F] dark:text-[#EDE4D3] hover:text-red-500 transition"
                                    >
                                        ✖
                                    </button>

                                </div>

                                <p className="text-[13px] text-[#7C6B58] dark:text-[#C2B49A] mt-1">
                                    Llena los datos y observa la prefactura en vivo a la derecha.
                                </p>

                                <div className="mt-6 space-y-5">

                                    {/* Toggle: factura de suscripción vs cliente no afiliado */}
                                    <div className="flex bg-[#F2ECE5] dark:bg-[#221D17] rounded-xl p-1 gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setEsClienteExterno(false)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${!esClienteExterno ? 'bg-[#8B5E3C] text-white' : 'text-[#5D4E3F] dark:text-[#EDE4D3]'}`}
                                        >
                                            Cliente Afiliado
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEsClienteExterno(true)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${esClienteExterno ? 'bg-[#8B5E3C] text-white' : 'text-[#5D4E3F] dark:text-[#EDE4D3]'}`}
                                        >
                                            Cliente No Afiliado
                                        </button>
                                    </div>

                                    {!esClienteExterno ? (
                                        <div>

                                            <label className="font-semibold text-[#5D4E3F] dark:text-[#EDE4D3]">
                                                Suscripción
                                            </label>
                                            <select
                                                value={formulario.suscripcion_id}
                                                onChange={(e) =>
                                                    setFormulario({
                                                        ...formulario,
                                                        suscripcion_id: e.target.value
                                                    })
                                                }
                                                className="w-full bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3 mt-2"
                                            >

                                                <option value="">
                                                    Seleccione...
                                                </option>

                                                {suscripciones.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        #{s.id} -
                                                        {s.usuario?.nombre}
                                                        {" - "}
                                                        {s.plan?.nombre}
                                                    </option>
                                                ))}

                                            </select>

                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="text-[#5D4E3F] dark:text-[#EDE4D3]">
                                                    Buscar cliente ya registrado (opcional)
                                                </label>
                                                {!usuarioSeleccionado && (
                                                    <>
                                                        <input
                                                            type="text"
                                                            placeholder="Cédula o nombre..."
                                                            value={busquedaUsuario}
                                                            onChange={(e) => buscarUsuarios(e.target.value)}
                                                            className="w-full bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3 mt-2"
                                                        />
                                                        {resultadosUsuario.length > 0 && (
                                                            <div className="mt-2 space-y-1">
                                                                {resultadosUsuario.map((u) => (
                                                                    <button
                                                                        key={u.id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setUsuarioSeleccionado(u);
                                                                            setFormulario({ ...formulario, usuario_id: u.id, cliente_nombre: '', cliente_cedula: '', cliente_telefono: '', cliente_email: '' });
                                                                            setResultadosUsuario([]);
                                                                            setBusquedaUsuario('');
                                                                        }}
                                                                        className="w-full text-left p-2 bg-[#F4EDE6] dark:bg-[#221D17] rounded-lg text-sm hover:bg-[#E8DFC8]"
                                                                    >
                                                                        {u.nombre} — CC {u.cedula}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {usuarioSeleccionado && (
                                                    <div className="mt-2 bg-green-50 dark:bg-green-950/30 rounded-xl p-4 text-sm space-y-1 border border-green-200 dark:border-green-900">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-bold text-green-700 dark:text-green-400">✅ Cuenta vinculada</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setUsuarioSeleccionado(null);
                                                                    setFormulario({ ...formulario, usuario_id: '' });
                                                                }}
                                                                className="text-red-500 text-xs font-bold hover:underline"
                                                            >
                                                                Quitar
                                                            </button>
                                                        </div>
                                                        <p><span className="opacity-60">Nombre:</span> <strong>{usuarioSeleccionado.nombre}</strong></p>
                                                        <p><span className="opacity-60">Cédula:</span> {usuarioSeleccionado.cedula}</p>
                                                        <p><span className="opacity-60">Correo:</span> {usuarioSeleccionado.email}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {!usuarioSeleccionado && (
                                                <>
                                                    <div>
                                                        <label className="text-[#5D4E3F] dark:text-[#EDE4D3]">Nombre del cliente</label>
                                                        <input type="text" className="w-full bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3 mt-2"
                                                            value={formulario.cliente_nombre}
                                                            onChange={(e) => setFormulario({ ...formulario, cliente_nombre: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="text-[#5D4E3F] dark:text-[#EDE4D3]">Cédula del cliente</label>
                                                        <input type="text" className="w-full bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3 mt-2"
                                                            value={formulario.cliente_cedula}
                                                            onChange={(e) => setFormulario({ ...formulario, cliente_cedula: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="text-[#5D4E3F] dark:text-[#EDE4D3]">Teléfono (opcional)</label>
                                                        <input type="text" className="w-full bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3 mt-2"
                                                            value={formulario.cliente_telefono}
                                                            onChange={(e) => setFormulario({ ...formulario, cliente_telefono: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="text-[#5D4E3F] dark:text-[#EDE4D3]">Correo (opcional)</label>
                                                        <input type="email" className="w-full bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3 mt-2"
                                                            value={formulario.cliente_email}
                                                            onChange={(e) => setFormulario({ ...formulario, cliente_email: e.target.value })} />
                                                    </div>
                                                </>
                                            )}

                                            <div>
                                                <label className="text-[#5D4E3F] dark:text-[#EDE4D3]">Concepto del servicio</label>
                                                <input type="text" placeholder="Ej: Servicio funerario completo"
                                                    className="w-full bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3 mt-2"
                                                    value={formulario.concepto}
                                                    onChange={(e) => setFormulario({ ...formulario, concepto: e.target.value })} />
                                            </div>
                                        </>
                                    )}

                                    <div>

                                        <label className="text-[#5D4E3F] dark:text-[#EDE4D3]">Fecha emisión</label>

                                        <input
                                            type="date"
                                            className="w-full bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3 mt-2"
                                            value={formulario.fecha_emision}
                                            onChange={(e) =>
                                                setFormulario({
                                                    ...formulario,
                                                    fecha_emision: e.target.value
                                                })
                                            }
                                        />

                                    </div>

                                    <div>

                                        <label className="text-[#5D4E3F] dark:text-[#EDE4D3]">Fecha vencimiento</label>

                                        <input
                                            type="date"
                                            className="w-full bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3 mt-2"
                                            value={formulario.fecha_vencimiento}
                                            onChange={(e) =>
                                                setFormulario({
                                                    ...formulario,
                                                    fecha_vencimiento: e.target.value
                                                })
                                            }
                                        />

                                    </div>

                                    <div>

                                        <label className="text-[#5D4E3F] dark:text-[#EDE4D3]">Total</label>

                                        <input
                                            type="number"
                                            className="w-full bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3 mt-2"
                                            value={formulario.total}
                                            onChange={(e) =>
                                                setFormulario({
                                                    ...formulario,
                                                    total: e.target.value
                                                })
                                            }
                                        />

                                    </div>

                                </div>

                                <div className="flex justify-end gap-3 mt-8">

                                    <button
                                        onClick={() => setMostrarModal(false)}
                                        className="px-5 py-3 rounded-xl border dark:border-[#4A4033] text-[#5D4E3F] dark:text-[#EDE4D3]"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        onClick={() => {
                                            router.post("/admin/ventas/store", formulario, {
                                                onSuccess: () => {
                                                    setMostrarModal(false);
                                                    resetFormulario();
                                                }
                                            });
                                        }}
                                        className="bg-[#8B5E3C] hover:bg-[#6F482D] text-white px-6 py-3 rounded-xl transition"
                                    >
                                        Crear factura
                                    </button>

                                </div>

                            </div>

                            {/* ---------- Columna derecha: PREFACTURA EN VIVO ---------- */}
                            <div className="hidden lg:flex w-[54%] bg-[#EFE7DC] dark:bg-[#221D17] p-8 overflow-y-auto flex-col">

                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] dark:text-[#C2A275]">
                                        Vista previa
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setMostrarPrefactura((v) => !v)}
                                        className="text-xs font-semibold text-[#8B5E3C] dark:text-[#C2A275] hover:underline"
                                    >
                                        {mostrarPrefactura ? "Ocultar" : "Mostrar"}
                                    </button>
                                </div>

                                {mostrarPrefactura ? (
                                    <FacturaPreview
                                        factura={datosPrefactura}
                                        modo="prefactura"
                                        formatoDinero={dinero}
                                    />
                                ) : (
                                    <div className="flex-1 grid place-items-center text-center text-[#8B5E3C] dark:text-[#C2A275] opacity-70">
                                        <p>Vista previa oculta.<br />Toca "Mostrar" para verla.</p>
                                    </div>
                                )}

                            </div>

                        </div>

                    </div>

                )}

                {/* ============================================================= */}
                {/*  MODAL VISOR DE FACTURA (botón 👁)  — con comprobante          */}
                {/*  ⚠️ SIN CAMBIOS — se mantiene igual al original                */}
                {/* ============================================================= */}
                {facturaSeleccionada && (

                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

                        <div className="bg-white dark:bg-[#2E2720] rounded-3xl shadow-2xl w-full max-w-[820px] max-h-[92vh] overflow-hidden flex flex-col">

                            {/* Cabecera del visor */}
                            <div className="flex justify-between items-center border-b dark:border-[#4A4033] px-8 py-5">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">
                                        Factura #{facturaSeleccionada.id}
                                    </h2>
                                    <p className="text-gray-500 dark:text-[#C2B49A] text-[13px]">
                                        Comprobante oficial — Funeraria Mouren
                                    </p>
                                </div>
                                <button
                                    onClick={() => setFacturaSeleccionada(null)}
                                    className="text-3xl text-gray-500 dark:text-[#C2B49A] hover:text-red-600 transition"
                                >
                                    ✖
                                </button>
                            </div>

                            {/* Comprobante bonito */}
                            <div className="overflow-y-auto p-6 sm:p-8 bg-[#EFE7DC] dark:bg-[#221D17]">

                                <FacturaPreview
                                    factura={facturaSeleccionada}
                                    modo="vista"
                                    pdfUrl={`/admin/facturas/${facturaSeleccionada.id}/pdf`}
                                    formatoDinero={dinero}
                                />

                                {/* Resumen financiero rápido (total / pagado / saldo) */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                                    <div className="bg-[#F8F5F0] dark:bg-[#2E2720] rounded-2xl p-5">
                                        <p className="text-gray-500 dark:text-[#C2B49A] text-sm">Total</p>
                                        <h2 className="text-2xl font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">
                                            {dinero(facturaSeleccionada.total)}
                                        </h2>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl p-5">
                                        <p className="text-gray-500 dark:text-[#C2B49A] text-sm">Pagado</p>
                                        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
                                            {dinero(facturaSeleccionada.monto_pagado)}
                                        </h2>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-5">
                                        <p className="text-gray-500 dark:text-[#C2B49A] text-sm">Saldo pendiente</p>
                                        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                                            {dinero(facturaSeleccionada.saldo_pendiente)}
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 px-8 py-5 border-t dark:border-[#4A4033]">
                                <button
                                    onClick={() => {
                                        setPago({
                                            factura_id: facturaSeleccionada.id,
                                            metodo_pago_id: "",
                                            monto: facturaSeleccionada.saldo_pendiente,
                                        });
                                        setMostrarPago(true);
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition"
                                >
                                    💳 Registrar pago
                                </button>

                                <a
                                    href={`/admin/facturas/${facturaSeleccionada.id}/pdf`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-[#8B5E3C] hover:bg-[#6F482D] text-white px-6 py-3 rounded-xl text-center transition"
                                >
                                    📄 Descargar PDF
                                </a>

                                <button
                                    onClick={() => setFacturaSeleccionada(null)}
                                    className="px-6 py-3 rounded-xl border dark:border-[#4A4033] text-[#5D4E3F] dark:text-[#EDE4D3]"
                                >
                                    Cerrar
                                </button>
                            </div>

                        </div>

                    </div>

                )}

                {/* ============================================================= */}
                {/*  MODAL REGISTRAR PAGO                                          */}
                {/*  ⚠️ SIN CAMBIOS — se mantiene igual al original                */}
                {/* ============================================================= */}
                {mostrarPago && (

                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">

                        <div className="bg-white dark:bg-[#2E2720] rounded-3xl w-full max-w-[500px] p-8 shadow-2xl">

                            <h2 className="text-2xl font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">
                                Registrar Pago
                            </h2>

                            <div className="mt-6 space-y-5">

                                <div>

                                    <label className="text-[#5D4E3F] dark:text-[#EDE4D3]">Método de pago</label>

                                    <select
                                        value={pago.metodo_pago_id}
                                        onChange={(e) =>
                                            setPago({
                                                ...pago,
                                                metodo_pago_id: e.target.value
                                            })
                                        }
                                        className="w-full bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3 mt-2"
                                    >

                                        <option value="">
                                            Seleccione...
                                        </option>

                                        {metodosPago.map((m) => (
                                            <option
                                                key={m.id}
                                                value={m.id}
                                            >
                                                {m.nombre}
                                            </option>
                                        ))}

                                    </select>

                                </div>

                                <div>

                                    <label className="text-[#5D4E3F] dark:text-[#EDE4D3]">Monto</label>

                                    <input
                                        type="number"
                                        value={pago.monto}
                                        onChange={(e) =>
                                            setPago({
                                                ...pago,
                                                monto: e.target.value
                                            })
                                        }
                                        className="w-full bg-white dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3] border dark:border-[#4A4033] rounded-xl p-3 mt-2"
                                    />

                                </div>

                            </div>

                            <div className="flex justify-end gap-3 mt-8">

                                <button
                                    onClick={() => setMostrarPago(false)}
                                    className="border dark:border-[#4A4033] text-[#5D4E3F] dark:text-[#EDE4D3] px-5 py-3 rounded-xl"
                                >
                                    Cancelar
                                </button>

                                <button
                                    onClick={() => {
                                        router.post(
                                            "/admin/facturas/registrar-pago",
                                            pago,
                                            {
                                                onSuccess: () => {

                                                    setMostrarPago(false);

                                                    setFacturaSeleccionada(null);

                                                }
                                            }
                                        )
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
                                >
                                    Registrar pago
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );

}
