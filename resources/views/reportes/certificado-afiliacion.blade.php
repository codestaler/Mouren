<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: sans-serif;
            color: #5D4E3F;
            padding: 40px;
        }
        .marco {
            border: 3px solid #A68966;
            border-radius: 12px;
            padding: 40px;
        }
        .titulo-principal {
            text-align: center;
            font-size: 26px;
            font-weight: bold;
            color: #5D4E3F;
            margin-bottom: 4px;
        }
        .subtitulo {
            text-align: center;
            font-size: 11px;
            font-style: italic;
            color: #A68966;
            margin-bottom: 30px;
        }
        .cuerpo {
            font-size: 13px;
            line-height: 1.8;
            text-align: justify;
            margin-bottom: 25px;
        }
        .cuerpo strong {
            color: #5D4E3F;
        }
        table.afiliados {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 30px;
        }
        table.afiliados th {
            background: #5D4E3F;
            color: white;
            padding: 8px;
            font-size: 10px;
            text-align: left;
        }
        table.afiliados td {
            padding: 8px;
            border-bottom: 1px solid #E8DFC8;
            font-size: 10px;
        }
        .pie {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #A68966;
        }
        .fecha-emision {
            text-align: right;
            font-size: 10px;
            color: #8C7A67;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="marco">
        <p class="fecha-emision">Emitido el {{ $fecha }}</p>

        <p class="titulo-principal">Certificado de Afiliación</p>
        <p class="subtitulo">"Para que descanses mejor que en vida" — Mouren</p>

        <div class="cuerpo">
            <p>
                Mouren certifica que <strong>{{ $usuario->nombre }}</strong>,
                identificado(a) con cédula <strong>{{ $usuario->cedula }}</strong>,
                se encuentra afiliado(a) activamente al <strong>Plan {{ $plan->nombre ?? 'Personalizado' }}</strong>,
                con una cobertura vigente desde el
                <strong>{{ \Carbon\Carbon::parse($suscripcion->fecha_inicio)->format('d/m/Y') }}</strong>.
            </p>
            <p>
                Este documento certifica la protección funeraria activa del titular y de los siguientes
                beneficiarios registrados bajo su cobertura:
            </p>
        </div>

        <table class="afiliados">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Parentesco</th>
                    <th>Estado</th>
                    <th>Género</th>
                    <th>Documento</th>
                </tr>
            </thead>
            <tbody>
                @foreach($afiliados as $afi)
                    <tr>
                        <td>{{ $afi->nombre }}</td>
                        <td>{{ $afi->parentesco }}</td>
                        <td>{{ $afi->estado }}</td>
                        <td>{{ $afi->genero->nombre ?? 'No especificado' }}</td>
                        <td>{{ $afi->tipoDocumento->nombre ?? 'No especificado' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="pie">
            Este certificado es informativo y no reemplaza los términos y condiciones del contrato de afiliación.<br>
            Mouren — Funeraria y protección familiar.
        </div>
    </div>
</body>
</html>