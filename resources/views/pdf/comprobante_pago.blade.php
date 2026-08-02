<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; color: #5D4E3F; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #5D4E3F; padding-bottom: 10px; }
        .header h1 { font-size: 20px; margin: 0; }
        .badge { display: inline-block; padding: 4px 12px; background: #d1fae5; color: #065f46; border-radius: 12px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; }
        th { background: #F4F1ED; }
        .total-row { font-weight: bold; font-size: 14px; }
        .footer { margin-top: 30px; font-size: 10px; text-align: center; opacity: 0.6; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Comprobante de Pago - Mouren</h1>
        <p><span class="badge">✔ Pago Aprobado</span></p>
    </div>

    <p><strong>Cliente:</strong> {{ $usuario->nombre ?? $usuario->name }}</p>
    <p><strong>Correo:</strong> {{ $usuario->email }}</p>
    <p><strong>Fecha:</strong> {{ $fecha }}</p>
    <p><strong>Referencia Mercado Pago:</strong> #{{ $paymentId }}</p>

    <table>
    <thead>
        <tr>
            <th>Fecha</th>
            <th>Factura #</th>
            <th>Monto Abonado</th>
            <th>Referencia MP</th>
            <th>Estado Actual</th>
        </tr>
    </thead>
    <tbody>
        @foreach($pagosCreados as $item)
            <tr>
                <td>{{ \Carbon\Carbon::parse($item['pago']->fecha_pago)->format('d/m/Y h:i A') }}</td>
                <td>#{{ $item['factura']->id }}</td>
                <td>${{ number_format($item['pago']->monto, 0, ',', '.') }}</td>
                <td>{{ $item['pago']->referencia_mercadopago ?? 'N/A' }}</td>
                <td>{{ $item['factura']->estado_factura_id == 2 ? 'Pagada Completamente' : 'Abonada Parcialmente' }}</td>
            </tr>
        @endforeach
        <tr class="total-row">
            <td colspan="3">TOTAL PAGADO</td>
            <td colspan="2">${{ number_format($totalPagado, 0, ',', '.') }}</td>
        </tr>
    </tbody>
</table>

    <div class="footer">
        Este comprobante fue generado automáticamente por Mouren Previsión Exequial.
    </div>
</body>
</html>