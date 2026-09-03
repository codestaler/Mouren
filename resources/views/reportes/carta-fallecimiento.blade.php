<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page {
            margin: 0;
            size: 842pt 595pt; /* A4 landscape exacto — igual al setPaper('A4','landscape') del controlador */
        }
        * {
            box-sizing: border-box;
        }
        html, body {
            margin: 0;
            padding: 0;
            width: 842pt;
            height: 595pt;
            background: #2B1F16;
        }
        body {
            font-family: 'DejaVu Serif', serif;
            color: #EFE3CE;
        }

        /* Marco exterior: SIN height (nada de 100%, nada de absolute).
           Su alto lo define únicamente su contenido -> jamás puede
           generar una segunda página por sí solo. */
        .marco {
            border: 2pt solid #C9A24A;
            margin: 24pt;
            background: #362719;
        }
        .marco-interior {
            border: 0.75pt solid #8A6E3F;
            margin: 8pt;
            padding: 50pt 130pt;
            text-align: center;
        }

        .ornamento {
            display: block;
            margin: 0 auto 22pt;
            width: 200pt;
            white-space: nowrap;
        }
        .ornamento-linea {
            display: inline-block;
            width: 75pt;
            height: 0;
            border-top: 0.75pt solid #8A6E3F;
            vertical-align: middle;
        }
        .ornamento-rombo {
            display: inline-block;
            width: 7pt;
            height: 7pt;
            background: #C9A24A;
            transform: rotate(45deg);
            vertical-align: middle;
            margin: 0 8pt;
        }

        .en-memoria {
            font-size: 13pt;
            letter-spacing: 5pt;
            text-transform: uppercase;
            color: #C9A24A;
            margin: 0 0 10pt;
        }
        .nombre {
            font-size: 40pt;
            font-style: italic;
            font-weight: bold;
            color: #FBF3E3;
            margin: 0 0 8pt;
        }
        .fechas {
            font-size: 13pt;
            letter-spacing: 1.5pt;
            color: #C9A24A;
            margin: 0 0 18pt;
        }
        .divisor {
            width: 80pt;
            border: none;
            border-top: 0.75pt solid #8A6E3F;
            margin: 0 auto 18pt;
        }
        .texto {
            font-size: 14.5pt;
            font-style: italic;
            line-height: 1.7;
            color: #E4D6B8;
            margin: 0 0 20pt;
        }
        .lugar {
            font-size: 12.5pt;
            color: #C9A24A;
            line-height: 1.6;
        }
        .lugar strong {
            color: #FBF3E3;
        }
        .ornamento-bottom {
            margin-top: 24pt;
            margin-bottom: 0;
        }
    </style>
</head>
<body>
    <div class="marco">
        <div class="marco-interior">

            <div class="ornamento">
                <span class="ornamento-linea"></span><span class="ornamento-rombo"></span><span class="ornamento-linea"></span>
            </div>

            <p class="en-memoria">En memoria de</p>
            <p class="nombre">{{ $nombre }}</p>

            @if($fechaNac)
                <p class="fechas">{{ \Carbon\Carbon::parse($fechaNac)->format('M Y') }} — {{ now()->format('M Y') }}</p>
            @endif

            <hr class="divisor">

            <p class="texto">
                Con profundo cariño despedimos a {{ $nombre }}, cuyo recuerdo permanecerá
                por siempre en el corazón de quienes le conocieron.
            </p>

            @if($ceremonia)
                <p class="lugar">
                    Será velado(a) en <strong>{{ $ceremonia->salaVelacion->nombre ?? 'nuestras instalaciones' }}</strong><br>
                    {{ \Carbon\Carbon::parse($ceremonia->fecha_hora)->format('d \d\e F \d\e Y, h:i A') }}
                </p>
            @endif

            <div class="ornamento ornamento-bottom">
                <span class="ornamento-linea"></span><span class="ornamento-rombo"></span><span class="ornamento-linea"></span>
            </div>

        </div>
    </div>
</body>
</html>