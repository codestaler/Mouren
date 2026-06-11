<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Estado de Cuenta - Mouren Previsión</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #5D4E3F;
            margin: 0;
            padding: 20px;
            font-size: 12px;
        }
        .header {
            border-bottom: 2px solid #5D4E3F;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .titulo {
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
            color: #302A1D;
        }
        .subtitulo {
            font-size: 11px;
            font-style: italic;
            opacity: 0.8;
            margin-top: 5px;
        }
        .datos-cliente {
            margin-bottom: 30px;
            background-color: #F4F1ED;
            padding: 15px;
            border-radius: 10px;
        }
        .resumen-cards {
            width: 100%;
            margin-bottom: 30px;
        }
        .card {
            background-color: #D3CAB6;
            padding: 15px;
            text-align: center;
            border-radius: 10px;
            width: 45%;
        }
        .card-deuda {
            background-color: #5D4E3F;
            color: #FFFFFF;
        }
        .card p { margin: 0; font-size: 10px; text-transform: uppercase; }
        .card h3 { margin: 5px 0 0 0; font-size: 18px; font-weight: bold; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            background-color: #5D4E3F;
            color: white;
            padding: 8px;
            text-transform: uppercase;
            font-size: 10px;
        }
        td {
            padding: 10px 8px;
            border-bottom: 1px solid #5D4E3F;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .badge {
            padding: 3px 8px;
            border-radius: 20px;
            font-size: 9px;
            font-weight: bold;
        }
        .badge-pendiente { background-color: #FFD97D; color: #8C6F4F; }
        .badge-pagado { background-color: #D1FAE5; color: #065F46; }
    </style>
</head>
<body>

    <div class="header">
        <table style="width: 100%; border: none;">
            <tr>
                <td style="border: none; padding: 0;">
                    <h1 class="titulo">MOUREN FUNERARIA</h1>
                    <p class="subtitulo">Previsión Exequial Familiar</p>
                </td>
                <td style="border: none; padding: 0;" class="text-right">
                    <p><strong>Fecha de Emisión:</strong> {{ $fechaReporte }}</p>
                    <p><strong>Estado:</strong> Cartera General</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="datos-cliente">
        <strong>Titular de Cuenta:</strong> {{ $usuario->nombre ?? $usuario->name }} <br>
        <strong>Correo de Registro:</strong> {{ $usuario->email }} <br>
        <strong>Estado del Servicio:</strong> @if($totalDeuda > 0) Cobro Administrativo @else Cobertura Activa al Día @endif
    </div>

    <table style="width: 100%; border: none; margin-bottom: 20px;">
        <tr>
            <td style="border: none; padding: 0;">
                <div class="card">
                    <p>Total Histórico Abonado</p>
                    <h3>${{ number_format($totalPagado, 2) }}</h3>
                </div>
            </td>
            <td style="border: none; padding: 0;" class="text-right">
                <div class="card card-deuda" style="float: right;">
                    <p>Saldo Pendiente Total</p>
                    <h3>${{ number_format($totalDeuda, 2) }}</h3>
                </div>
            </td>
        </tr>
    </table>

    <h2 style="font-size: 14px; margin-top: 30px; font-style: italic;">Historial Cronológico de Movimientos</h2>
    <table>
        <thead>
            <tr>
                <th>Factura #</th>
                <th>Fecha Emisión</th>
                <th>Fecha Vencimiento</th>
                <th class="text-center">Estado</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
           @foreach($facturas as $factura)
    <tr>
        <td>#{{ $factura->id }}</td>
        <td>{{ $factura->fecha_emision }}</td>
        <td>{{ $factura->fecha_vencimiento }}</td>
        <td class="text-center">
            @if($factura->estado_factura_id == 1)
                <span class="badge badge-pendiente">PENDIENTE</span>
            @else
                <span class="badge badge-pagado">PAGADO</span>
            @endif
        </td>
        <td class="text-right" style="font-weight: bold; color: #A68966;">
            ${{ number_format($factura->total, 2) }}
        </td>
    </tr>
@endforeach
    </table>

</body>
</html>