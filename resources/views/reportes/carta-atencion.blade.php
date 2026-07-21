<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #333; padding: 20px; }
        .header { border-bottom: 3px solid #56473A; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { color: #56473A; font-size: 20px; margin: 0; }
        .header p { color: #8F7E54; font-size: 10px; margin: 4px 0 0; }
        .info-box { background: #F4EDE6; padding: 12px; border-radius: 6px; margin-bottom: 20px; }
        .info-box p { margin: 3px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #56473A; color: white; padding: 8px; text-align: left; font-size: 10px; }
        td { padding: 8px; border-bottom: 1px solid #E8DFC8; font-size: 10px; }
        .firma { margin-top: 50px; text-align: center; }
        .firma-linea { border-top: 1px solid #333; width: 200px; margin: 0 auto; padding-top: 6px; font-size: 10px; }
    </style>
</head>
<head>
</head>
<body>
    <div class="header">
        <h1>MOUREN — Certificado de Atención del Servicio</h1>
        <p>Documento generado el {{ $fecha }}</p>
    </div>

    <div class="info-box">
        <p><strong>Beneficiario:</strong> {{ $sujeto->nombre ?? 'N/A' }}</p>
        <p><strong>Tipo:</strong> {{ $servicio->afiliado ? 'Persona' : 'Mascota' }}</p>
        @if($servicio->afiliado)
            <p><strong>Documento:</strong> {{ $sujeto->tipoDocumento->nombre ?? '' }} {{ $sujeto->cedula ?? 'N/A' }}</p>
        @endif
        @if($servicio->ceremonias->first())
            <p><strong>Sala de velación:</strong> {{ $servicio->ceremonias->first()->salaVelacion->nombre ?? 'N/A' }}</p>
            <p><strong>Fecha ceremonia:</strong> {{ \Carbon\Carbon::parse($servicio->ceremonias->first()->fecha_hora)->format('d/m/Y H:i') }}</p>
        @endif
    </div>

    <h3 style="color:#56473A;">Trazabilidad del Servicio</h3>
    <table>
        <thead>
            <tr><th>Etapa</th><th>Descripción</th><th>Fecha</th><th>Responsable</th></tr>
        </thead>
        <tbody>
            @foreach($servicio->trazabilidades->sortBy('fecha') as $t)
                <tr>
                    <td>{{ $t->etapa->nombre ?? '' }}</td>
                    <td>{{ $t->descripcion }}</td>
                    <td>{{ \Carbon\Carbon::parse($t->fecha)->format('d/m/Y H:i') }}</td>
                    <td>{{ $t->responsable->nombre ?? 'N/A' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="firma">
        <div class="firma-linea">Firma y sello — Mouren</div>
    </div>
</body>
</html>