import { useMemo } from "react";

/**
 * =====================================================================
 *  FacturaPreview.jsx  —  Visor / Prefactura interactivo de Mouren
 * =====================================================================
 *  Réplica bonita e interactiva del comprobante PDF (factura_comprobante.blade.php).
 *
 *  NO cambia ninguna lógica de negocio. Solo dibuja los datos.
 *
 *  Uso rápido:
 *   1) Como VISOR de una factura existente:
 *        <FacturaPreview
 *            factura={facturaSeleccionada}
 *            pdfUrl={`/admin/facturas/${facturaSeleccionada.id}/pdf`}
 *        />
 *
 *   2) Como PREFACTURA en vivo (mientras se llena el formulario):
 *        <FacturaPreview
 *            factura={construirPrefactura(formulario, { suscripciones, usuarioSeleccionado, esClienteExterno })}
 *            modo="prefactura"
 *        />
 *
 *  El helper `construirPrefactura` está exportado abajo y traduce el
 *  estado del formulario a la misma forma de datos que usa el Blade.
 * =====================================================================
 */

/* ----------------------- Formateo de dinero ------------------------ */
const dineroCOP = (valor) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(Number(valor) || 0);

/* --------------- Fecha "05 de agosto del 2026" ---------------------- */
const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const fechaLarga = (valor) => {
    if (!valor) return "—";
    // Acepta 'YYYY-MM-DD' o ISO. Se evita el desfase de zona horaria.
    const soloFecha = String(valor).slice(0, 10);
    const partes = soloFecha.split("-");
    if (partes.length !== 3) return String(valor);
    const [y, m, d] = partes.map((n) => parseInt(n, 10));
    if (!y || !m || !d) return String(valor);
    return `${String(d).padStart(2, "0")} de ${MESES[m - 1]} del ${y}`;
};

/* ==================================================================== */
/*  HELPER: construye la "forma" de factura desde el estado del form.   */
/*  Reproduce EXACTAMENTE la lógica del Blade (código, título, texto).  */
/* ==================================================================== */
export function construirPrefactura(
    formulario,
    { suscripciones = [], usuarioSeleccionado = null, esClienteExterno = false } = {}
) {
    // Suscripción elegida (modo cliente afiliado)
    const suscripcion =
        !esClienteExterno && formulario.suscripcion_id
            ? suscripciones.find(
                  (s) => String(s.id) === String(formulario.suscripcion_id)
              )
            : null;

    // Reconstruimos un objeto con la misma anatomía que $factura del Blade.
    return {
        id: null, // aún no existe
        _prefactura: true,
        total: formulario.total,
        fecha_emision: formulario.fecha_emision,
        fecha_vencimiento: formulario.fecha_vencimiento,
        concepto: formulario.concepto,

        suscripcion_id: suscripcion ? suscripcion.id : null,
        suscripcion: suscripcion
            ? {
                  id: suscripcion.id,
                  plan_id: suscripcion.plan?.id ?? suscripcion.plan_id,
                  plan: suscripcion.plan,
                  usuario: suscripcion.usuario,
              }
            : null,

        // cliente registrado sin suscripción
        usuario: usuarioSeleccionado
            ? {
                  nombre: usuarioSeleccionado.nombre,
                  cedula: usuarioSeleccionado.cedula,
                  email: usuarioSeleccionado.email,
              }
            : null,

        // cliente externo manual
        cliente_nombre: formulario.cliente_nombre,
        cliente_cedula: formulario.cliente_cedula,
        cliente_telefono: formulario.cliente_telefono,
        cliente_email: formulario.cliente_email,

        estado: { nombre: "Prefactura" },
    };
}

/* ==================================================================== */
/*  Deriva los campos mostrados, replicando el Blade @if/@elseif.       */
/* ==================================================================== */
function derivarDatos(f = {}) {
    const tieneSuscripcion = !!f.suscripcion_id;
    const planId = f.suscripcion?.plan_id ?? f.suscripcion?.plan?.id ?? null;

    // -------- Código del servicio ----------
    let codigo;
    if (!tieneSuscripcion) codigo = "SVC";
    else if (planId == 4) codigo = "M-004";
    else codigo = "H-00" + (planId ?? "1");

    // -------- Título del servicio ----------
    let titulo, emoji, detalle;
    if (!tieneSuscripcion) {
        titulo = f.concepto || "Servicio Contratado";
        emoji = "🕯️";
        detalle =
            "Servicio funerario contratado directamente, sin plan de previsión asociado.";
    } else if (planId == 4) {
        titulo = "Plan Huella Eterna (Mascotas)";
        emoji = "🐾";
        detalle =
            "Cuota correspondiente a la protección y cobertura integral para la mascota registrada en el sistema.";
    } else {
        titulo = f.suscripcion?.plan?.nombre || "Plan Previsión Exequial Humano";
        emoji = "👥";
        detalle =
            "Cuota correspondiente a la cobertura integral de previsión exequial familiar contratada.";
    }

    // -------- Cliente ----------
    const nombre =
        f.suscripcion?.usuario?.nombre ||
        f.usuario?.nombre ||
        f.cliente_nombre ||
        f.nombre_cliente ||
        "Cliente por definir";

    const documento =
        f.suscripcion?.usuario?.cedula ??
        f.usuario?.cedula ??
        f.cliente_cedula ??
        "No registrado";

    const correo =
        f.suscripcion?.usuario?.email ??
        f.usuario?.email ??
        f.cliente_email ??
        "No registrado";

    const telefono =
        f.suscripcion?.usuario?.telefono ??
        f.cliente_telefono ??
        "No registrado";

    return { codigo, titulo, emoji, detalle, nombre, documento, correo, telefono };
}

/* ==================================================================== */
/*  Colores del sello según estado (paleta Mouren)                      */
/* ==================================================================== */
function selloEstado(nombre = "") {
    const n = nombre.toLowerCase();
    if (n.includes("pag")) return { txt: "PAGADA", color: "#3F7D4E", bg: "rgba(63,125,78,.10)" };
    if (n.includes("pend")) return { txt: "PENDIENTE", color: "#B4632A", bg: "rgba(180,99,42,.10)" };
    if (n.includes("abon")) return { txt: "ABONADA", color: "#C89A2B", bg: "rgba(200,154,43,.12)" };
    if (n.includes("anul")) return { txt: "ANULADA", color: "#8A8178", bg: "rgba(138,129,120,.12)" };
    if (n.includes("pref")) return { txt: "PREFACTURA", color: "#A68966", bg: "rgba(166,137,102,.12)" };
    return { txt: nombre.toUpperCase() || "EMITIDA", color: "#5D4E3F", bg: "rgba(93,78,63,.10)" };
}

/* ==================================================================== */
/*  COMPONENTE PRINCIPAL                                                 */
/* ==================================================================== */
export default function FacturaPreview({
    factura,
    modo = "vista", // "vista" | "prefactura"
    pdfUrl = null,
    formatoDinero = dineroCOP,
}) {
    const esPrefactura = modo === "prefactura" || factura?._prefactura;
    const d = useMemo(() => derivarDatos(factura || {}), [factura]);
    const sello = selloEstado(factura?.estado?.nombre || (esPrefactura ? "Prefactura" : "Emitida"));

    const total = Number(factura?.total) || 0;
    const numeroFactura = factura?.id ? "000" + factura.id : "— — —";

    return (
        <div className="fp-root">
            {/* Estilos locales (keyframes + marca de agua). No afectan a nada más. */}
            <style>{fpStyles}</style>

            {/* ============ BARRA SUPERIOR DE ACCIONES ============ */}
            <div className="fp-toolbar">
                <div className="fp-toolbar-tag" style={{ color: sello.color, background: sello.bg }}>
                    <span className="fp-dot" style={{ background: sello.color }} />
                    {esPrefactura ? "Vista previa en vivo" : `Comprobante #${factura?.id ?? ""}`}
                </div>

                <div className="fp-toolbar-actions">
                    {!esPrefactura && pdfUrl && (
                        <a href={pdfUrl} target="_blank" rel="noreferrer" className="fp-btn fp-btn-primary">
                            📄 Descargar PDF
                        </a>
                    )}
                </div>
            </div>

            {/* ==================== HOJA (documento) ==================== */}
            <div className={`fp-sheet ${esPrefactura ? "fp-sheet-preview" : ""}`}>
                {esPrefactura && <div className="fp-watermark">PREFACTURA</div>}

                {/* ---------- Encabezado ---------- */}
                <header className="fp-header">
                    <div className="fp-brand">
                        <div className="fp-logo">M</div>
                        <div>
                            <h1 className="fp-logo-text">Mouren</h1>
                            <div className="fp-logo-sub">• FUNERARIA •</div>
                        </div>
                    </div>

                    <div className="fp-badge">
                        <div className="fp-badge-shine" />
                        <h2 className="fp-badge-title">FACTURA</h2>
                        <div className="fp-badge-row">
                            <span>Factura N°</span>
                            <strong>{numeroFactura}</strong>
                        </div>
                        <div className="fp-badge-row">
                            <span>Emisión</span>
                            <strong>{fechaLarga(factura?.fecha_emision)}</strong>
                        </div>
                        <div className="fp-badge-row">
                            <span>Vencimiento</span>
                            <strong>{fechaLarga(factura?.fecha_vencimiento)}</strong>
                        </div>
                    </div>
                </header>

                {/* ---------- Info empresa + estado ---------- */}
                <section className="fp-company">
                    <div className="fp-company-info">
                        <p><b>Dirección:</b> Calle 45 #12-34, Bogotá, Colombia</p>
                        <p><b>Soporte:</b> mouren.funeraria@gmail.com</p>
                        <p><b>Teléfono:</b> 314 651 7554</p>
                        <p><b>Sitio Web:</b> www.funerariamouren.com</p>
                        <p><b>NIT:</b> 901.191.110-8</p>
                    </div>

                    {/* Sello de estado giratorio */}
                    <div className="fp-stamp" style={{ color: sello.color, borderColor: sello.color }}>
                        <span className="fp-stamp-ring" style={{ borderColor: sello.color }} />
                        {sello.txt}
                    </div>
                </section>

                {/* ---------- Cliente ---------- */}
                <div className="fp-section-title">Información del Cliente</div>
                <section className="fp-client">
                    <div className="fp-client-item">
                        <span>Nombre</span>
                        <strong>{d.nombre}</strong>
                    </div>
                    <div className="fp-client-item">
                        <span>Teléfono</span>
                        <strong>{d.telefono}</strong>
                    </div>
                    <div className="fp-client-item">
                        <span>Documento</span>
                        <strong>{d.documento}</strong>
                    </div>
                    <div className="fp-client-item">
                        <span>Correo</span>
                        <strong>{d.correo}</strong>
                    </div>
                </section>

                {/* ---------- Detalle del servicio ---------- */}
                <div className="fp-table">
                    <div className="fp-table-head">
                        <div className="fp-col-cod">Código</div>
                        <div className="fp-col-desc">Descripción del Servicio</div>
                        <div className="fp-col-cant">Cant.</div>
                        <div className="fp-col-tot">Total</div>
                    </div>
                    <div className="fp-table-row">
                        <div className="fp-col-cod fp-codigo">{d.codigo}</div>
                        <div className="fp-col-desc">
                            <strong>{d.titulo} {d.emoji}</strong>
                            <p className="fp-desc-sub">{d.detalle}</p>
                        </div>
                        <div className="fp-col-cant">1</div>
                        <div className="fp-col-tot fp-strong">{formatoDinero(total)}</div>
                    </div>
                </div>

                {/* ---------- Totales ---------- */}
                <section className="fp-totals">
                    <div className="fp-thanks">
                        <span className="fp-heart">❤️</span>
                        <strong>Gracias por confiar en nosotros</strong>
                        <em>en los momentos que más importan.</em>
                    </div>

                    <div className="fp-math">
                        <div className="fp-math-row">
                            <span>Subtotal</span>
                            <span>{formatoDinero(total)}</span>
                        </div>
                        <div className="fp-math-row">
                            <span>IVA (0% - Exento)</span>
                            <span>{formatoDinero(0)}</span>
                        </div>
                        <div className="fp-math-total">
                            <span>TOTAL A PAGAR</span>
                            <span>{formatoDinero(total)}</span>
                        </div>
                    </div>
                </section>

                {/* ---------- Footer ---------- */}
                <footer className="fp-footer">
                    <div className="fp-foot-col">
                        <span className="fp-foot-title">📞 Contacto</span>
                        314 651 7554<br />
                        mouren.funeraria@gmail.com<br />
                        @funeraria_mouren<br />
                        Facebook: Funeraria Mouren
                    </div>
                    <div className="fp-foot-col">
                        <span className="fp-foot-title">💳 Información de Pago</span>
                        <b>Banco:</b> Banco de Bogotá<br />
                        <b>Tipo:</b> Ahorros<br />
                        <b>Titular:</b> Mouren Funeraria S.A.S<br />
                        <b>Cuenta:</b> 0123 4567 8901<br />
                        <small>Aceptamos Transferencia, Efectivo y Nequi.</small>
                    </div>
                    <div className="fp-foot-col fp-sign">
                        <div className="fp-sign-line" />
                        <strong>ANGEL HUNG</strong>
                        <span>Asesor Administrativo</span>
                    </div>
                </footer>

                <div className="fp-slogan">Acompañamos con respeto, empatía y amor.</div>
            </div>
        </div>
    );
}

/* ==================================================================== */
/*  Estilos locales — misma paleta café/beige, con vida e interacción.  */
/*  Se auto-adaptan al modo oscuro de la página vía prefers/`.dark`.     */
/* ==================================================================== */
const fpStyles = `
.fp-root{ --marfil:#FAF8F5; --cafe:#5D4E3F; --cafe2:#302A1D; --oro:#A68966;
    --linea:#E6DFD5; --panel:#F4F1ED; --texto:#4A3F35;
    font-family:'Hepta Slab','Helvetica Neue',Helvetica,Arial,sans-serif; }

/* Toolbar */
.fp-toolbar{ display:flex; align-items:center; justify-content:space-between;
    gap:12px; flex-wrap:wrap; margin-bottom:14px; }
.fp-toolbar-tag{ display:inline-flex; align-items:center; gap:8px;
    padding:7px 14px; border-radius:999px; font-size:12px; font-weight:700;
    letter-spacing:.3px; }
.fp-dot{ width:8px; height:8px; border-radius:50%;
    animation:fpPulse 1.6s ease-in-out infinite; }
.fp-toolbar-actions{ display:flex; gap:8px; }
.fp-btn{ text-decoration:none; padding:9px 16px; border-radius:12px;
    font-size:13px; font-weight:700; transition:transform .15s ease, box-shadow .15s ease; }
.fp-btn-primary{ background:var(--cafe); color:#fff;
    box-shadow:0 6px 16px rgba(93,78,63,.28); }
.fp-btn-primary:hover{ transform:translateY(-2px); box-shadow:0 10px 22px rgba(93,78,63,.35); }

/* Hoja */
.fp-sheet{ position:relative; overflow:hidden; background:var(--marfil);
    color:var(--cafe); border-radius:22px; padding:34px 34px 26px;
    box-shadow:0 24px 60px -20px rgba(48,42,29,.45), 0 2px 0 rgba(255,255,255,.6) inset;
    border:1px solid rgba(211,202,182,.6);
    animation:fpRise .5s cubic-bezier(.2,.8,.25,1) both; }
.fp-sheet-preview{ animation:fpRise .35s ease both; }
.fp-sheet::before{ content:""; position:absolute; inset:0 auto 0 0; width:6px;
    background:linear-gradient(180deg,var(--oro),var(--cafe)); }

/* Marca de agua */
.fp-watermark{ position:absolute; top:46%; left:50%;
    transform:translate(-50%,-50%) rotate(-24deg); font-size:78px; font-weight:800;
    letter-spacing:10px; color:rgba(166,137,102,.10); pointer-events:none;
    white-space:nowrap; user-select:none; }

/* Header */
.fp-header{ display:flex; justify-content:space-between; align-items:stretch;
    gap:20px; margin-bottom:26px; }
.fp-brand{ display:flex; align-items:center; gap:12px; }
.fp-logo{ width:56px; height:56px; border-radius:16px; display:grid; place-items:center;
    font-size:30px; font-weight:800; color:#fff;
    background:linear-gradient(135deg,var(--cafe),var(--cafe2));
    box-shadow:0 8px 20px rgba(48,42,29,.3); }
.fp-logo-text{ font-size:30px; font-weight:800; color:var(--cafe2);
    letter-spacing:1px; margin:0; line-height:1; }
.fp-logo-sub{ font-size:10px; text-transform:uppercase; letter-spacing:4px;
    color:var(--oro); margin-top:3px; }
.fp-badge{ position:relative; overflow:hidden; min-width:250px;
    background:linear-gradient(135deg,var(--cafe),var(--cafe2)); color:#fff;
    padding:18px 22px; border-radius:0 18px 0 34px; }
.fp-badge-shine{ position:absolute; top:0; left:-60%; width:40%; height:100%;
    background:linear-gradient(120deg,transparent,rgba(255,255,255,.25),transparent);
    animation:fpShine 3.6s ease-in-out infinite; }
.fp-badge-title{ font-size:26px; font-weight:300; letter-spacing:6px;
    margin:0 0 10px; text-align:right; }
.fp-badge-row{ display:flex; justify-content:space-between; gap:14px;
    font-size:11px; padding:2px 0; color:#F4F1ED; }
.fp-badge-row strong{ font-weight:700; text-align:right; }

/* Empresa + sello */
.fp-company{ display:flex; justify-content:space-between; align-items:center;
    gap:20px; margin-bottom:26px; }
.fp-company-info{ font-size:11.5px; color:#6E6255; line-height:1.7; }
.fp-company-info p{ margin:0; }
.fp-stamp{ position:relative; display:grid; place-items:center; text-align:center;
    width:120px; height:120px; border:3px double currentColor; border-radius:50%;
    font-weight:800; font-size:15px; letter-spacing:1px; transform:rotate(-13deg);
    opacity:.85; flex-shrink:0; }
.fp-stamp-ring{ position:absolute; inset:8px; border:1px solid currentColor;
    border-radius:50%; opacity:.5; }

/* Section title */
.fp-section-title{ font-size:12px; font-weight:800; text-transform:uppercase;
    color:var(--cafe2); letter-spacing:1px; margin-bottom:10px;
    border-bottom:1px solid var(--linea); padding-bottom:5px; }

/* Cliente */
.fp-client{ display:grid; grid-template-columns:1fr 1fr; gap:2px 26px;
    background:var(--panel); border-radius:12px; padding:16px 20px; margin-bottom:30px; }
.fp-client-item{ display:flex; flex-direction:column; padding:6px 0; }
.fp-client-item span{ font-size:10px; text-transform:uppercase; letter-spacing:.5px;
    color:var(--oro); }
.fp-client-item strong{ font-size:13px; color:var(--texto); font-weight:700; }

/* Tabla */
.fp-table{ border-radius:12px; overflow:hidden; margin-bottom:22px;
    border:1px solid var(--linea); }
.fp-table-head{ display:grid; grid-template-columns:90px 1fr 60px 130px;
    background:linear-gradient(135deg,var(--cafe),var(--cafe2)); color:#fff;
    font-size:10px; text-transform:uppercase; letter-spacing:1px; font-weight:700; }
.fp-table-head>div{ padding:11px 14px; }
.fp-table-row{ display:grid; grid-template-columns:90px 1fr 60px 130px;
    align-items:center; background:#fff; transition:background .2s ease; }
.fp-table-row:hover{ background:#FBF8F3; }
.fp-table-row>div{ padding:14px; color:var(--texto); }
.fp-col-cant{ text-align:right; }
.fp-col-tot{ text-align:right; }
.fp-codigo{ font-weight:800; color:var(--oro); text-align:center; }
.fp-desc-sub{ font-size:10.5px; color:#6E6255; margin:4px 0 0; }
.fp-strong{ font-weight:800; }

/* Totales */
.fp-totals{ display:grid; grid-template-columns:1fr 1fr; gap:18px;
    align-items:stretch; margin-bottom:14px; }
.fp-thanks{ display:flex; flex-direction:column; justify-content:center; gap:3px;
    text-align:center; background:var(--panel); border-radius:12px; padding:18px;
    font-size:11.5px; color:#6E6255; font-style:italic; }
.fp-heart{ font-size:20px; font-style:normal; animation:fpBeat 1.8s ease-in-out infinite; }
.fp-math{ align-self:end; }
.fp-math-row{ display:flex; justify-content:space-between; padding:8px 12px;
    border-bottom:1px solid var(--linea); font-size:12.5px; color:var(--texto); }
.fp-math-total{ display:flex; justify-content:space-between; padding:12px 14px;
    margin-top:8px; border-radius:10px; font-weight:800; font-size:15px; color:#fff;
    background:linear-gradient(135deg,var(--cafe),var(--cafe2));
    box-shadow:0 8px 18px rgba(93,78,63,.3); }

/* Footer */
.fp-footer{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px;
    margin-top:30px; padding-top:20px; border-top:1px solid var(--linea);
    font-size:10.5px; color:#6E6255; line-height:1.7; }
.fp-foot-title{ display:block; font-weight:800; text-transform:uppercase;
    color:var(--cafe2); margin-bottom:6px; }
.fp-sign{ text-align:center; display:flex; flex-direction:column;
    justify-content:flex-end; align-items:center; }
.fp-sign-line{ width:80%; border-top:1.5px solid var(--cafe); margin:22px 0 6px; }
.fp-sign span{ font-size:9px; text-transform:uppercase; color:var(--oro); }

.fp-slogan{ text-align:center; font-style:italic; color:var(--oro);
    margin-top:22px; padding-top:12px; border-top:1px solid var(--linea); font-size:11.5px; }

/* Animaciones */
@keyframes fpRise{ from{opacity:0; transform:translateY(16px) scale(.99);} to{opacity:1; transform:none;} }
@keyframes fpPulse{ 0%,100%{opacity:1;} 50%{opacity:.35;} }
@keyframes fpShine{ 0%{left:-60%;} 55%,100%{left:130%;} }
@keyframes fpBeat{ 0%,100%{transform:scale(1);} 15%{transform:scale(1.25);} 30%{transform:scale(1);} }

/* ---------- Modo oscuro (respeta el .dark de tu app) ---------- */
.dark .fp-sheet{ --marfil:#2B241D; --cafe:#EDE4D3; --cafe2:#F6EFE2; --oro:#C2A275;
    --linea:#4A4033; --panel:#221D17; --texto:#E4D8C4;
    border-color:#4A4033;
    box-shadow:0 24px 60px -20px rgba(0,0,0,.6); }
.dark .fp-sheet .fp-logo-text{ color:#F6EFE2; }
.dark .fp-table-row{ background:#2E2720; }
.dark .fp-table-row:hover{ background:#332B22; }
.dark .fp-badge, .dark .fp-logo, .dark .fp-math-total,
.dark .fp-table-head{ background:linear-gradient(135deg,#4A3F31,#2E2720); }
.dark .fp-company-info, .dark .fp-desc-sub, .dark .fp-thanks,
.dark .fp-footer{ color:#C2B49A; }

/* Responsive */
@media (max-width:640px){
    .fp-header{ flex-direction:column; }
    .fp-badge{ min-width:0; border-radius:16px; }
    .fp-company{ flex-direction:column; align-items:flex-start; }
    .fp-client{ grid-template-columns:1fr; }
    .fp-totals{ grid-template-columns:1fr; }
    .fp-table-head{ display:none; }
    .fp-table-row{ grid-template-columns:1fr; gap:2px; }
    .fp-col-cant, .fp-col-tot{ text-align:left; }
    .fp-footer{ grid-template-columns:1fr; }
    .fp-watermark{ font-size:52px; }
}
`;
