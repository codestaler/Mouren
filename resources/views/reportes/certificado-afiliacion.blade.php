<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 0; }
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            color: #5D4E3F;
            margin: 0;
            padding: 0;
        }

        .pagina {
            padding: 50px 55px;
            position: relative;
        }

        /* Marco doble, más ceremonioso que un simple borde */
        .marco-externo {
            border: 1px solid #A68966;
            padding: 6px;
        }
        .marco-interno {
            border: 2px solid #5D4E3F;
            border-radius: 6px;
            padding: 40px 45px;
            position: relative;
            overflow: hidden;
        }

        /* Marca de agua sutil, centrada */
        .marca-agua {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);
            font-size: 70px;
            font-weight: bold;
            color: #5D4E3F;
            opacity: 0.035;
            letter-spacing: 8px;
            white-space: nowrap;
        }

        .encabezado {
            text-align: center;
            margin-bottom: 6px;
        }
        .marca {
            font-size: 12px;
            letter-spacing: 6px;
            text-transform: uppercase;
            color: #A68966;
            font-weight: bold;
            margin-bottom: 14px;
        }
        .titulo-principal {
            font-size: 28px;
            font-weight: bold;
            color: #5D4E3F;
            margin: 0 0 6px;
            letter-spacing: 1px;
        }
        .linea-decorativa {
            width: 70px;
            height: 2px;
            background: #A68966;
            margin: 12px auto 14px;
        }
        .subtitulo {
            font-size: 11px;
            font-style: italic;
            color: #A68966;
            margin-bottom: 8px;
        }

        .fecha-emision {
            text-align: right;
            font-size: 10px;
            color: #8C7A67;
            margin-bottom: 18px;
        }

        .cuerpo {
            font-size: 13px;
            line-height: 1.9;
            text-align: justify;
            margin: 22px 0 26px;
            position: relative;
        }
        .cuerpo strong {
            color: #5D4E3F;
        }

        .franja-titulo {
            background: #5D4E3F;
            color: #F4EDE6;
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            padding: 8px 14px;
            border-radius: 4px 4px 0 0;
            margin-top: 10px;
        }

        table.afiliados {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            border: 1px solid #E8DFC8;
        }
        table.afiliados th {
            background: #F4EDE6;
            color: #5D4E3F;
            padding: 9px 8px;
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: left;
            border-bottom: 2px solid #A68966;
        }
        table.afiliados td {
            padding: 9px 8px;
            border-bottom: 1px solid #E8DFC8;
            font-size: 10.5px;
        }
        table.afiliados tr:nth-child(even) td {
            background: #FBF8F2;
        }

        /* Sello circular de "vigente", estilo timbre oficial */
        .sello {
            position: absolute;
            top: 36px;
            right: 40px;
            width: 78px;
            height: 78px;
            border-radius: 50%;
            border: 3px double #5D4E3F;
            display: table;
            text-align: center;
            transform: rotate(8deg);
        }
        .sello-texto {
            display: table-cell;
            vertical-align: middle;
            font-size: 9px;
            font-weight: bold;
            color: #5D4E3F;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.4;
        }

        .pie {
            margin-top: 35px;
            padding-top: 18px;
            border-top: 1px solid #E8DFC8;
            text-align: center;
            font-size: 9.5px;
            color: #A68966;
            line-height: 1.7;
        }
        .pie .marca-pie {
            font-weight: bold;
            color: #5D4E3F;
            letter-spacing: 1px;
        }
    </style>
</head>
<body>
    <div class="pagina">
        <div class="marco-externo">
            <div class="marco-interno">
                <div class="marca-agua">MOUREN</div>

                <div class="sello">
                    <div class="sello-texto">Afiliación<br>Activa</div>
                </div>

                <p class="fecha-emision">Emitido el {{ $fecha }}</p>

                <div class="encabezado">
                    <p class="marca">Mouren</p>
                    <h1 class="titulo-principal">Certificado de Afiliación</h1>
                    <div class="linea-decorativa"></div>
                    <p class="subtitulo">"Para que descanses mejor que en vida"</p>
                </div>

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

                <div class="franja-titulo">Beneficiarios Registrados</div>
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
                        @forelse($afiliados as $afi)
                            <tr>
                                <td>{{ $afi->nombre }}</td>
                                <td>{{ $afi->parentesco }}</td>
                                <td>{{ $afi->estado }}</td>
                                <td>{{ $afi->genero->nombre ?? 'No especificado' }}</td>
                                <td>{{ $afi->tipoDocumento->nombre ?? 'No especificado' }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" style="text-align:center; opacity:0.6; font-style:italic;">
                                    Sin beneficiarios registrados actualmente.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>

                <div class="pie">
                    Este certificado es informativo y no reemplaza los términos y condiciones del contrato de afiliación.<br>
                    <span class="marca-pie">MOUREN</span> — Funeraria y protección familiar.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
