<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #5D4E3F;">
    <p>¡Hola {{ $usuario->nombre1 ?? $usuario->nombre ?? $usuario->name }}!</p>
    <p>Confirmamos que tu pago fue procesado exitosamente.</p>
    <p><strong>Referencia:</strong> #{{ $paymentId }}<br>
    <strong>Monto total abonado:</strong> ${{ number_format($totalPagado, 0, ',', '.') }}</p>
    <p>Adjunto encontrarás el comprobante en PDF con el detalle completo de tu transacción.</p>
    <p>Gracias por confiar en Mouren.</p>
</body>
</html>