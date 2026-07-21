<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page {
            margin: 0;
            size: 900pt 700pt;
        }
        * {
            box-sizing: border-box;
        }
        html, body {
            margin: 0;
            padding: 0;
            width: 842pt;
            height: 595pt;
            background: #EDE7DC;
        }
        body {
            font-family: 'DejaVu Serif', serif;
            color: #3A322A;
        }
        .pagina {
            width: 842pt;
            height: 595pt;
            background: #EDE7DC;
            padding: 20pt 40pt;
        }
        .marco {
            border: 2px solid #8A7A5C;
            width: 100%;
            height: 100%;
            padding: 25pt;
            text-align: center;
            position: relative;
        }

        /* Flores decorativas en las esquinas */
        .flor {
            position: absolute;
            width: 90pt;
            height: 90pt;
            opacity: 0.5;
        }
        .flor-tl { top: -8pt; left: -8pt; }
        .flor-tr { top: -8pt; right: -8pt; transform: scaleX(-1); }
        .flor-bl { bottom: -8pt; left: -8pt; transform: scaleY(-1); }
        .flor-br { bottom: -8pt; right: -8pt; transform: scale(-1, -1); }

        .cruz {
            width: 5pt;
            height: 40pt;
            background: #3A322A;
            margin: 15pt auto 0;
            position: relative;
        }
        .cruz::before {
            content: '';
            position: absolute;
            top: 10pt;
            left: -11pt;
            width: 27pt;
            height: 5pt;
            background: #3A322A;
        }

        .en-memoria {
            font-size: 15pt;
            letter-spacing: 4pt;
            text-transform: uppercase;
            color: #6B5B47;
            margin: 22pt 0 8pt;
        }
        .nombre {
            font-size: 38pt;
            font-style: italic;
            font-weight: bold;
            margin-bottom: 10pt;
        }
        .fechas {
            font-size: 15pt;
            color: #6B5B47;
            margin-bottom: 30pt;
        }
        .texto {
            font-size: 16pt;
            line-height: 1.8;
            margin: 0 90pt 25pt;
        }
        .lugar {
            font-size: 14pt;
            color: #6B5B47;
            margin-top: 15pt;
        }
    </style>
</head>
<body>
    <div class="pagina">
        <div class="marco">
            <img src="{{ public_path('images/elementos_dashboard/detalles_plan/flores_colgantes.png') }}" class="flor flor-tl">
            <img src="{{ public_path('images/elementos_dashboard/detalles_plan/flores_colgantes.png') }}" class="flor flor-tr">
            <img src="{{ public_path('images/elementos_dashboard/detalles_plan/flores_colgantes.png') }}" class="flor flor-bl">
            <img src="{{ public_path('images/elementos_dashboard/detalles_plan/flores_colgantes.png') }}" class="flor flor-br">

            <div class="cruz"></div>
            <p class="en-memoria">En memoria de</p>
            <p class="nombre">{{ $nombre }}</p>
            <p class="fechas">
                @if($fechaNac)
                    {{ \Carbon\Carbon::parse($fechaNac)->format('M Y') }} — {{ now()->format('M Y') }}
                @endif
            </p>

            <p class="texto">
                Con profundo cariño despedimos a {{ $nombre }}, cuyo recuerdo permanecerá
                por siempre en el corazón de quienes le conocieron.
            </p>

            @if($ceremonia)
                <p class="lugar">
                    Será velado(a) en {{ $ceremonia->salaVelacion->nombre ?? 'nuestras instalaciones' }}<br>
                    {{ \Carbon\Carbon::parse($ceremonia->fecha_hora)->format('d \d\e F \d\e Y, h:i A') }}
                </p>
            @endif
        </div>
    </div>
</body>
</html>