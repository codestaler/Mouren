<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #5D4E3F; background-color: #F4F1ED; padding: 20px; }
        .card { background: white; padding: 30px; border-radius: 20px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        h2 { color: #5D4E3F; margin-top: 0; }
        .btn { display: inline-block; padding: 12px 24px; background: #302A1D; color: white; text-decoration: none; border-radius: 10px; font-weight: bold; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="card">
        <h2>Hola, {{ $factura->suscripcion->usuario->name }}</h2>
        <p>Te hacemos llegar tu estado de cuenta mensual correspondiente a tu plan de previsión exequial en <strong>Mouren</strong>.</p>
        <p><strong>Total a pagar:</strong> ${{ number_format($factura->total) }}</p>
        <p><strong>Fecha límite:</strong> {{ $factura->fecha_vencimiento }}</p>
        <p>Adjunto a este correo encontrarás el PDF oficial de tu cobro. Puedes realizar tu pago seguro ingresando a tu portal de clientes.</p>
        <a href="{{ url('/pagos') }}" class="btn">Ir a Pagar mi Cuota</a>
        <br><br>
        <small style="opacity: 0.6;">Atentamente,<br>El equipo de soporte de Mouren.</small>
    </div>
</body>
</html>