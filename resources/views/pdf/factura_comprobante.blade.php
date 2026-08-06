<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Factura Oficial - Mouren Funeraria</title>
    <style>
        @page {
            margin: 0px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #5D4E3F;
            background-color: #FFFFFF;
            margin: 0px;
            padding: 0px;
            font-size: 11px;
            line-height: 1.5;
        }

        /* Banda superior dorada decorativa */
        .top-band {
            height: 8px;
            background-color: #A68966;
            width: 100%;
        }
        .page {
            padding: 38px 46px 30px 46px;
        }

        /* ===================== ENCABEZADO ===================== */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 26px;
        }
        .brand-section {
            width: 52%;
            vertical-align: middle;
        }
        .logo-container-table {
            border-collapse: collapse;
        }
        .logo-cell {
            width: 58px;
            padding: 0;
            vertical-align: middle;
        }
        /* Monograma elegante (reemplaza la imagen de la flor) */
        .monogram {
            width: 54px;
            height: 54px;
            background-color: #5D4E3F;
            color: #FFFFFF;
            font-size: 30px;
            font-weight: bold;
            text-align: center;
            line-height: 54px;
            border-radius: 14px;
            border: 2px solid #A68966;
        }
        .text-cell {
            padding-left: 14px;
            vertical-align: middle;
        }
        .logo-text {
            font-size: 30px;
            font-weight: bold;
            color: #302A1D;
            letter-spacing: 1px;
            margin: 0;
        }
        .logo-sub {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 5px;
            color: #A68966;
            margin-top: 2px;
        }

        .invoice-badge-section {
            width: 48%;
            background-color: #5D4E3F;
            color: #FFFFFF;
            padding: 22px 26px;
            border-radius: 0px 0px 0px 38px;
            vertical-align: top;
        }
        .invoice-title {
            font-size: 30px;
            font-weight: 300;
            letter-spacing: 8px;
            margin: 0 0 12px 0;
            text-align: right;
            color: #FFFFFF;
        }
        .invoice-meta-table {
            width: 100%;
            border-collapse: collapse;
        }
        .invoice-meta-table td {
            color: #EDE4D3;
            font-size: 10.5px;
            padding: 3px 0;
            border: none;
        }
        .meta-value {
            color: #FFFFFF;
            font-weight: bold;
        }

        /* ============ INFO EMPRESA + TARJETA TOTAL ============ */
        .company-info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .info-col {
            width: 62%;
            vertical-align: middle;
            font-size: 11px;
            color: #6E6255;
            line-height: 1.8;
        }
        .info-col strong {
            color: #4A3F35;
        }
        .summary-col {
            width: 38%;
            text-align: right;
            vertical-align: middle;
        }
        .total-card {
            background-color: #F4F1ED;
            border: 1px solid #E1D8C8;
            border-left: 4px solid #A68966;
            border-radius: 10px;
            padding: 14px 20px;
            text-align: left;
        }
        .total-card .lbl {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #A68966;
        }
        .total-card .amt {
            font-size: 22px;
            font-weight: bold;
            color: #302A1D;
            margin-top: 2px;
        }

        /* ===================== SECCIONES ===================== */
        .section-title {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            color: #302A1D;
            letter-spacing: 2px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #A68966;
        }
        .client-table {
            width: 100%;
            background-color: #F4F1ED;
            border-radius: 8px;
            border-collapse: separate;
            margin-bottom: 32px;
        }
        .client-table td {
            padding: 9px 14px;
            vertical-align: top;
            border: none;
        }
        .client-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #A68966;
            display: block;
        }
        .client-value {
            font-size: 12px;
            color: #4A3F35;
            font-weight: bold;
        }

        /* ================= DETALLE DEL COBRO ================= */
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 22px;
            border: 1px solid #E6DFD5;
        }
        .details-table th {
            background-color: #5D4E3F;
            color: #FFFFFF;
            padding: 9px 14px;
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .details-table td {
            padding: 14px;
            border-bottom: 1px solid #E6DFD5;
            color: #4A3F35;
        }
        .svc-code {
            font-weight: bold;
            color: #A68966;
            font-size: 12px;
        }
        .svc-title {
            font-size: 12px;
            color: #302A1D;
        }
        .svc-desc {
            font-size: 10px;
            color: #6E6255;
        }

        /* ===================== TOTALES ===================== */
        .totals-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        .thank-you-box {
            width: 50%;
            background-color: #F4F1ED;
            border-radius: 8px;
            border: 1px solid #E6DFD5;
            padding: 16px;
            text-align: center;
            font-size: 11px;
            font-style: italic;
            color: #6E6255;
            vertical-align: middle;
        }
        .thank-you-box strong {
            font-style: normal;
            color: #5D4E3F;
        }
        .math-totals {
            width: 50%;
            text-align: right;
            vertical-align: top;
        }
        .math-table {
            width: 92%;
            float: right;
            border-collapse: collapse;
        }
        .math-table td {
            padding: 7px 12px;
            border-bottom: 1px solid #E6DFD5;
            font-size: 11.5px;
        }
        .math-table tr.total-row td {
            background-color: #5D4E3F;
            color: #FFFFFF;
            font-weight: bold;
            font-size: 14px;
            border-radius: 6px;
            border-bottom: none;
        }

        /* ===================== FOOTER ===================== */
        .footer-section {
            margin-top: 40px;
            width: 100%;
            border-top: 1px solid #E6DFD5;
            padding-top: 20px;
        }
        .footer-col {
            width: 33.33%;
            vertical-align: top;
            font-size: 10px;
            color: #6E6255;
            line-height: 1.7;
        }
        .footer-title {
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #302A1D;
            display: block;
            margin-bottom: 6px;
            font-size: 10px;
        }
        .signature-area {
            text-align: center;
        }
        .signature-line {
            border-top: 1px solid #5D4E3F;
            width: 82%;
            margin: 34px auto 6px auto;
        }
        .slogan {
            text-align: center;
            font-style: italic;
            color: #A68966;
            margin-top: 26px;
            font-size: 11px;
            border-top: 2px solid #F4F1ED;
            padding-top: 14px;
            letter-spacing: 1px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
    </style>
</head>
<body>

    <div class="top-band"></div>

    <div class="page">

        <!-- ===================== ENCABEZADO ===================== -->
        <table class="header-table">
            <tr>
                <td class="brand-section">
                    <table class="logo-container-table">
                        <tr>
                            <td class="logo-cell">
                                <div class="monogram">M</div>
                            </td>
                            <td class="text-cell">
                                <h1 class="logo-text">Mouren</h1>
                                <div class="logo-sub">Funeraria</div>
                            </td>
                        </tr>
                    </table>
                </td>
                <td class="invoice-badge-section">
                    <h2 class="invoice-title">FACTURA</h2>
                    <table class="invoice-meta-table">
                        <tr>
                            <td class="text-right" style="width: 55%;">Factura N°:</td>
                            <td class="meta-value" style="padding-left: 12px; width: 45%;">000{{ $factura->id }}</td>
                        </tr>
                        <tr>
                            <td class="text-right">Fecha de emisión:</td>
                            <td class="meta-value" style="padding-left: 12px;">{{ \Carbon\Carbon::parse($factura->fecha_emision)->locale('es')->translatedFormat('d \d\e F \d\e\l Y') }}</td>
                        </tr>
                        <tr>
                            <td class="text-right">Fecha de vencimiento:</td>
                            <td class="meta-value" style="padding-left: 12px;">{{ \Carbon\Carbon::parse($factura->fecha_vencimiento)->locale('es')->translatedFormat('d \d\e F \d\e\l Y') }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- ============ INFO EMPRESA + TARJETA TOTAL ============ -->
        <table class="company-info-table">
            <tr>
                <td class="info-col">
                    <strong>Dirección:</strong> Calle 45 #12-34, Bogotá, Colombia<br>
                    <strong>Soporte:</strong> mouren.funeraria@gmail.com<br>
                    <strong>Teléfono:</strong> 314 651 7554<br>
                    <strong>Sitio Web:</strong> www.funerariamouren.com<br>
                    <strong>NIT:</strong> 901.191.110-8
                </td>
                <td class="summary-col">
                    <div class="total-card">
                        <div class="lbl">Total a pagar</div>
                        <div class="amt">${{ number_format($factura->total, 2) }}</div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- ===================== CLIENTE ===================== -->
        <div class="section-title">Información del Cliente</div>
        <table class="client-table">
            <tr>
                <td style="width: 25%;">
                    <span class="client-label">Nombre</span>
                    <span class="client-value">{{ $factura->nombre_cliente }}</span>
                </td>
                <td style="width: 25%;">
                    <span class="client-label">Teléfono</span>
                    <span class="client-value">{{ $factura->cliente_telefono ?? 'No registrado' }}</span>
                </td>
                <td style="width: 25%;">
                    <span class="client-label">Documento</span>
                    <span class="client-value">{{ $factura->suscripcion?->usuario?->cedula ?? $factura->usuario?->cedula ?? $factura->cliente_cedula ?? 'No registrado' }}</span>
                </td>
                <td style="width: 25%;">
                    <span class="client-label">Correo</span>
                    <span class="client-value">{{ $factura->suscripcion?->usuario?->email ?? $factura->usuario?->email ?? $factura->cliente_email ?? 'No registrado' }}</span>
                </td>
            </tr>
        </table>

        <!-- ================= DETALLE DEL COBRO ================= -->
        <table class="details-table">
            <thead>
                <tr>
                    <th style="width: 15%; text-align: center;">Código</th>
                    <th style="width: 55%; text-align: left;">Descripción del Servicio</th>
                    <th style="width: 15%; text-align: right;">Cantidad</th>
                    <th style="width: 15%; text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="text-center svc-code">
                        @if(!$factura->suscripcion_id)
                            SVC
                        @elseif($factura->suscripcion->plan_id == 4)
                            M-004
                        @else
                            H-00{{ $factura->suscripcion->plan_id ?? '1' }}
                        @endif
                    </td>
                    <td>
                        <strong class="svc-title">
                            @if(!$factura->suscripcion_id)
                                {{ $factura->concepto ?? 'Servicio Contratado' }}
                            @elseif($factura->suscripcion->plan_id == 4)
                                Plan Huella Eterna (Mascotas)
                            @else
                                {{ $factura->suscripcion->plan->nombre ?? 'Plan Previsión Exequial Humano' }}
                            @endif
                        </strong><br>
                        <span class="svc-desc">
                            @if(!$factura->suscripcion_id)
                                Servicio funerario contratado directamente, sin plan de previsión asociado.
                            @elseif($factura->suscripcion->plan_id == 4)
                                Cuota correspondiente a la protección y cobertura integral para la mascota registrada en el sistema.
                            @else
                                Cuota correspondiente a la cobertura integral de previsión exequial familiar contratada.
                            @endif
                        </span>
                    </td>
                    <td class="text-right">1</td>
                    <td class="text-right" style="font-weight: bold; color: #302A1D;">${{ number_format($factura->total, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <!-- ===================== TOTALES ===================== -->
        <table class="totals-table">
            <tr>
                <td class="thank-you-box">
                    <strong>Gracias por confiar en nosotros</strong><br>
                    en los momentos que más importan.
                </td>
                <td style="width: 4%;"></td>
                <td class="math-totals">
                    <table class="math-table">
                        <tr>
                            <td style="text-align: left; border: none;">Subtotal:</td>
                            <td class="text-right" style="border: none;">${{ number_format($factura->total, 2) }}</td>
                        </tr>
                        <tr>
                            <td style="text-align: left;">IVA (0% - Exento):</td>
                            <td class="text-right">$0.00</td>
                        </tr>
                        <tr class="total-row">
                            <td style="text-align: left;">TOTAL A PAGAR:</td>
                            <td class="text-right">${{ number_format($factura->total, 2) }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- ===================== FOOTER ===================== -->
        <table class="footer-section">
            <tr>
                <td class="footer-col">
                    <span class="footer-title">Contacto</span>
                    314 651 7554<br>
                    mouren.funeraria@gmail.com<br>
                    &#64;funeraria_mouren<br>
                    Facebook: Funeraria Mouren
                </td>
                <td class="footer-col">
                    <span class="footer-title">Información de Pago</span>
                    <strong>Banco:</strong> Banco de Bogotá<br>
                    <strong>Tipo:</strong> Ahorros<br>
                    <strong>Titular:</strong> Mouren Funeraria S.A.S<br>
                    <strong>Cuenta:</strong> 0123 4567 8901<br>
                    <small style="color: #A68966;">Aceptamos Transferencia, Efectivo y Nequi.</small>
                </td>
                <td class="footer-col signature-area">
                    <div class="signature-line"></div>
                    <strong>ANGEL HUNG</strong><br>
                    <span style="font-size: 9px; color: #A68966; text-transform: uppercase; letter-spacing: 1px;">Asesor Administrativo</span>
                </td>
            </tr>
        </table>

        <div class="slogan">
            Acompañamos con respeto, empatía y amor.
        </div>

    </div>

</body>
</html>
