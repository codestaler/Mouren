<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #5D4E3F; }
        h1 { font-size: 18px; color: #56473A; margin-bottom: 0; }
        p.subtitulo { font-size: 10px; color: #8F7E54; margin-top: 2px; }
        .metricas { display: table; width: 100%; margin: 15px 0; }
        .metrica-item { display: table-cell; width: 25%; padding: 8px; background: #F4EDE6; border-radius: 8px; }
        table.detalle { width: 100%; border-collapse: collapse; margin-top: 20px; }
        table.detalle th { background: #56473A; color: white; padding: 6px; text-align: left; font-size: 9px; }
        table.detalle td { padding: 6px; border-bottom: 1px solid #E8DFC8; font-size: 9px; }
        table.detalle tr:nth-child(even) { background: #FAF4EA; }
        .fallecido { color: #8A6B22; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Mouren — Informe de Gestión de Usuarios</h1>
    <p class="subtitulo">Generado el {{ $fecha }}</p>

    <div class="metricas">
        <div class="metrica-item">
            <strong>{{ $datos['totalAfiliados'] }}</strong><br>
            Total de usuarios afiliados
        </div>
        <div class="metrica-item">
            <strong>{{ $datos['personasAtendidas'] }}</strong><br>
            Personas atendidas
        </div>
        <div class="metrica-item">
            <strong>{{ $datos['nuevosAfiliadosMes'] }}</strong><br>
            Nuevos afiliados este mes
        </div>
    </div>

    <h3>Fallecimientos por género</h3>
    <p>
        Mujeres: {{ $datos['fallecimientosGenero']['mujeres'] }}% —
        Hombres: {{ $datos['fallecimientosGenero']['hombres'] }}% —
        No especificado: {{ $datos['fallecimientosGenero']['noEspecificado'] }}%
    </p>

    <h3>Afiliados por tipo</h3>
    <p>
        Personas: {{ $datos['afiliadosTipo']['personas'] }}% —
        Mascotas: {{ $datos['afiliadosTipo']['mascotas'] }}%
    </p>

    <h3>Planes más elegidos</h3>
    <p>
        @foreach($datos['planesMasElegidos'] as $plan)
            {{ $plan['nombre'] }} ({{ $plan['pct'] }}%){{ !$loop->last ? ' — ' : '' }}
        @endforeach
    </p>

    <h3>Detalle de afiliados</h3>
    <table class="detalle">
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Parentesco</th>
                <th>Estado</th>
                <th>Género</th>
                <th>Documento</th>
                <th>Cédula</th>
                <th>Fecha Nac.</th>
                <th>Titular</th>
                <th>Plan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($afiliados as $afi)
                <tr>
                    <td>{{ $afi->nombre }}</td>
                    <td>{{ $afi->parentesco }}</td>
                    <td class="{{ strtolower($afi->estado) === 'fallecido' ? 'fallecido' : '' }}">{{ $afi->estado }}</td>
                    <td>{{ $afi->genero->nombre ?? 'N/A' }}</td>
                    <td>{{ $afi->tipoDocumento->nombre ?? 'N/A' }}</td>
                    <td>{{ $afi->cedula ?? 'N/A' }}</td>
                    <td>{{ $afi->fecha_nacimiento ? \Carbon\Carbon::parse($afi->fecha_nacimiento)->format('d/m/Y') : 'N/A' }}</td>
                    <td>{{ $afi->usuario->nombre ?? 'N/A' }}</td>
                    <td>{{ $afi->suscripcion->plan->nombre ?? 'N/A' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>