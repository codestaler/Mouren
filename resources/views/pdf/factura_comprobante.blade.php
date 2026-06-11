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
            background-color: #FAF8F5;
            margin: 0px;
            padding: 40px;
            font-size: 11px;
            line-height: 1.5;
        }
        /* Encabezado Principal */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .brand-section {
            width: 45%;
            vertical-align: top;
        }
        .logo-text {
            font-size: 32px;
            font-weight: bold;
            color: #302A1D;
            letter-spacing: 1px;
            margin: 0;
        }
        .logo-sub {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 4px;
            color: #A68966;
            margin-top: -2px;
        }
        .invoice-badge-section {
            width: 55%;
            background-color: #5D4E3F;
            color: #FFFFFF;
            padding: 25px;
            border-radius: 0px 0px 0px 40px;
            vertical-align: top;
        }
        .invoice-title {
            font-size: 28px;
            font-weight: 300;
            letter-spacing: 5px;
            margin: 0 0 10px 0;
            text-align: right;
        }
        .invoice-meta-table {
            width: 100%;
            border-collapse: collapse;
        }
        .invoice-meta-table td {
            color: #F4F1ED;
            font-size: 11px;
            padding: 2px 0;
            border: none;
        }

        /* Bloque de Información de Contacto de la Empresa */
        .company-info-table {
            width: 100%;
            margin-bottom: 30px;
        }
        .info-col {
            width: 65%;
            vertical-align: top;
            font-size: 11px;
            color: #6E6255;
        }
        .qr-col {
            width: 35%;
            text-align: right;
            vertical-align: top;
        }
        .qr-box {
            display: inline-block;
            background-color: #F4F1ED;
            padding: 10px;
            border-radius: 10px;
            font-size: 9px;
            color: #5D4E3F;
            text-align: center;
            border: 1px solid #D3CAB6;
        }

        /* Sección del Cliente */
        .section-title {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            color: #302A1D;
            letter-spacing: 1px;
            margin-bottom: 10px;
            border-bottom: 1px solid #D3CAB6;
            padding-bottom: 4px;
        }
        .client-table {
            width: 100%;
            background-color: #F4F1ED;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 35px;
        }
        .client-table td {
            padding: 4px 8px;
            vertical-align: top;
            border: none;
        }

        /* Tabla de Detalles del Cobro */
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .details-table th {
            background-color: #5D4E3F;
            color: #FFFFFF;
            padding: 8px 12px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .details-table td {
            padding: 12px;
            border-bottom: 1px solid #E6DFD5;
            color: #4A3F35;
        }
        
        /* Bloque de Totales */
        .totals-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .thank-you-box {
            width: 50%;
            background-color: #F4F1ED;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            font-size: 11px;
            font-style: italic;
            color: #6E6255;
            vertical-align: middle;
        }
        .math-totals {
            width: 50%;
            text-align: right;
            vertical-align: top;
        }
        .math-table {
            width: 90%;
            float: right;
            border-collapse: collapse;
        }
        .math-table td {
            padding: 6px 10px;
            border-bottom: 1px solid #E6DFD5;
        }
        .math-table tr.total-row td {
            background-color: #5D4E3F;
            color: #FFFFFF;
            font-weight: bold;
            font-size: 13px;
            border-radius: 4px;
        }

        /* Footer con Firmas e Información de Pago */
        .footer-section {
            margin-top: 50px;
            width: 100%;
        }
        .footer-col {
            width: 33.33%;
            vertical-align: top;
            font-size: 10px;
            color: #6E6255;
        }
        .signature-area {
            text-align: center;
            padding-top: 30px;
        }
        .signature-line {
            border-top: 1px solid #5D4E3F;
            width: 80%;
            margin: 0 auto 5px auto;
        }
        .slogan {
            text-align: center;
            font-style: italic;
            color: #A68966;
            margin-top: 40px;
            font-size: 11px;
            border-top: 1px solid #E6DFD5;
            padding-top: 10px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td class="brand-section">
                <h1 class="logo-text">Mouren</h1>
                <div class="logo-sub">• FUNERARIA •</div>
            </td>
            <td class="invoice-badge-section">
                <h2 class="invoice-title">FACTURA</h2>
                <table class="invoice-meta-table">
                    <tr>
                        <td class="text-right" style="width: 50%;"><strong>Factura N°:</strong></td>
                        <td style="padding-left: 10px; width: 50%;">000{{ $factura->id }}</td>
                    </tr>
                    <tr>
                        <td class="text-right"><strong>Fecha de emisión:</strong></td>
                        <td style="padding-left: 10px;">{{ \Carbon\Carbon::parse($factura->fecha_emision)->format('d \d\e F \d\e\l Y') }}</td>
                    </tr>
                    <tr>
                        <td class="text-right"><strong>Fecha de vencimiento:</strong></td>
                        <td style="padding-left: 10px;">{{ \Carbon\Carbon::parse($factura->fecha_vencimiento)->format('d \d\e F \d\e\l Y') }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="company-info-table">
        <tr>
            <td class="info-col">
                <strong>Dirección:</strong> Calle 45 #12-34, Bogotá, Colombia<br>
                <strong>Soporte:</strong> mouren.funeraria@gmail.com<br>
                <strong>Teléfono:</strong> 314 651 7554<br>
                <strong>Sitio Web:</strong> www.funerariamouren.com<br>
                <strong>NIT:</strong> 901.191.110-8
            </td>
            <td class="qr-col">
                <div class="qr-box">
                    <span style="font-weight: bold; display: block; margin-bottom: 4px;">Escanea para verificar</span>
                    <div style="width: 65px; height: 65px; background-color: #5D4E3F; margin: 5px auto; border-radius: 4px;"></div>
                    <span style="color: #A68966; font-size: 8px;">• Mouren Previsión •</span>
                </div>
            </td>
        </tr>
    </table>

    <div class="section-title">Información del Cliente</div>
    <table class="client-table">
        <tr>
            <td style="width: 15%;"><strong>Nombre:</strong></td>
            <td style="width: 40%;">{{ $factura->suscripcion->usuario->nombre ?? $factura->suscripcion->usuario->name }}</td>
            <td style="width: 15%;"><strong>Teléfono:</strong></td>
            <td style="width: 30%;">(316) 212-3456</td>
        </tr>
        <tr>
            <td><strong>Documento:</strong></td>
            <td>CC 1.234.567.890</td>
            <td><strong>Correo:</strong></td>
            <td>{{ $factura->suscripcion->usuario->email }}</td>
        </tr>
        <tr>
            <td><strong>Dirección:</strong></td>
            <td colspan="3">Calle Cualquiera 123, Ciudad Capital.</td>
        </tr>
    </table>

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
                <td class="text-center" style="font-weight: bold; color: #A68966;">S001</td>
                <td>Cuota mensual de Cobertura de Previsión Exequial Contratada (Plan Familiar Mouren)</td>
                <td class="text-right">1</td>
                <td class="text-right" style="font-weight: bold;">${{ number_format($factura->total, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <table class="totals-table">
        <tr>
            <td class="thank-you-box">
                ❤️ <br>
                <strong>Gracias por confiar en nosotros</strong><br>
                en los momentos que más importan.
            </td>
            <td class="math-totals">
                <table class="math-table">
                    <tr>
                        <td style="text-align: left; border: none;">Subtotal:</td>
                        <td style="border: none;">${{ number_format($factura->total, 2) }}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">IVA (0% - Exento):</td>
                        <td>$0.00</td>
                    </tr>
                    <tr class="total-row">
                        <td style="text-align: left;">TOTAL A PAGAR:</td>
                        <td>${{ number_format($factura->total, 2) }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="footer-section">
        <tr>
            <td class="footer-col">
                <span style="font-weight: bold; text-transform: uppercase; color: #302A1D; display: block; margin-bottom: 5px;">📞 Contacto</span>
                314 651 7554<br>
                mouren.funeraria@gmail.com<br>
                @funeraria_mouren<br>
                Facebook: Funeraria Mouren
            </td>
            <td class="footer-col">
                <span style="font-weight: bold; text-transform: uppercase; color: #302A1D; display: block; margin-bottom: 5px;">💳 Información de Pago</span>
                <strong>Banco:</strong> Banco de Bogotá<br>
                <strong>Tipo:</strong> Ahorros<br>
                <strong>Titular:</strong> Mouren Funeraria S.A.S<br>
                <strong>Cuenta:</strong> 0123 4567 8901<br>
                <small style="color: #A68966;">Aceptamos Transferencia, Efectivo y Nequi.</small>
            </td>
            <td class="footer-col signature-area">
                <div style="height: 35px;"></div> <div class="signature-line"></div>
                <strong>ANGEL HUNG</strong><br>
                <span style="font-size: 9px; color: #A68966; text-transform: uppercase;">Asesor Administrativo</span>
            </td>
        </tr>
    </table>

    <div class="slogan">
        Acompañamos con respeto, empatía y amor.
    </div>

</body>
</html>