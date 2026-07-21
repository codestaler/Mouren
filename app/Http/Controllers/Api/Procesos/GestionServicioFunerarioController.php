<?php

namespace App\Http\Controllers\Api\Procesos;

use App\Http\Controllers\Controller;
use App\Models\Afiliado;
use App\Models\Mascota;
use App\Models\ServicioFunerario;
use App\Models\SalaVelacion;
use App\Models\Pagos\Factura;
use App\Models\Ceremonia;
use App\Models\Procesos\EtapaServicio;
use App\Models\Procesos\TrazabilidadServicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GestionServicioFunerarioController extends Controller
{
    /**
     * Renderiza la página completa del panel de Servicios Funerarios.
     */
    public function index()
    {
        return Inertia::render('Admin/ServiciosFunerarios', [
            'serviciosEnProceso'  => $this->obtenerServicios(false),
            'serviciosFinalizados' => $this->obtenerServicios(true),
            'etapas'              => EtapaServicio::all(),
            'salasDisponibles'    => SalaVelacion::where('estado', 'Disponible')->get(),
            'todasLasSalas'       => SalaVelacion::all(),
            'estadisticas'        => $this->calcularEstadisticasServicios(),
        ]);
    }

    /**
     * Versión JSON de lo mismo (por si la necesitas para otra cosa).
     */
    public function serviciosEnProceso()
    {
        // 4. SERVICIOS EN PROCESO REALES: conectado al sistema de trazabilidad
        $serviciosEnProceso = \App\Models\ServicioFunerario::with([
                'afiliado', 'mascota', 'ceremonias.salaVelacion',
                'trazabilidades' => fn($q) => $q->orderByDesc('fecha')->orderByDesc('id'),
                'trazabilidades.etapa',
            ])
            ->whereHas('afiliado', fn($q) => $q->where('estado', 'Fallecido'))
            ->orWhereHas('mascota', fn($q) => $q->where('estado', 'Fallecido'))
            ->get()
            ->filter(function ($s) {
                $ultima = $s->trazabilidades->first();
                return !$ultima || $ultima->etapa->nombre !== 'Servicio Finalizado';
            })
            ->take(6)
            ->map(function ($s) {
                $sujeto = $s->afiliado ?? $s->mascota;
                $ceremonia = $s->ceremonias->first();
                return [
                    'id'          => $s->id,
                    'nombre'      => $sujeto->nombre ?? 'Sin nombre',
                    'tipo'        => $s->afiliado ? 'Humano' : 'Mascota',
                    'sala'        => $ceremonia->salaVelacion->nombre ?? 'No asignada',
                    'hora_inicio' => $ceremonia ? \Carbon\Carbon::parse($ceremonia->fecha_hora)->format('H:i') : '--:--',
                    'etapa'       => $s->trazabilidades->first()->etapa->nombre ?? 'Sin iniciar',
                ];
            })
            ->values();
    }

    private function obtenerServicios($finalizados = false)
    {
        return ServicioFunerario::with([
                'afiliado.genero',
                'afiliado.tipoDocumento',
                'mascota.especie',
                'mascota.raza',
                'trazabilidades' => function ($q) {
                    $q->orderByDesc('fecha')->orderByDesc('id');
                },
                'trazabilidades.etapa',
                'ceremonias.salaVelacion',
            ])
            ->whereHas('afiliado', fn($q) => $q->where('estado', 'Fallecido'))
            ->orWhereHas('mascota', fn($q) => $q->where('estado', 'Fallecido'))
            ->get()
            ->filter(function ($servicio) use ($finalizados) {
                $ultimaEtapa = $servicio->trazabilidades->first();
                $estaFinalizado = $ultimaEtapa && $ultimaEtapa->etapa->nombre === 'Servicio Finalizado';
                return $finalizados ? $estaFinalizado : !$estaFinalizado;
            })
            ->values();
    }

    public function marcarFallecido(Request $request)
    {
        $request->validate([
            'afiliado_id' => 'required_without:mascota_id|nullable|exists:afiliados,id',
            'mascota_id'  => 'required_without:afiliado_id|nullable|exists:mascotas,id',
            'observacion' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $servicioFunerario = null;

            if ($request->afiliado_id) {
                $afiliado = Afiliado::findOrFail($request->afiliado_id);

                if (strtolower($afiliado->estado) === 'fallecido') {
                    return back()->with('error', 'Este afiliado ya está marcado como fallecido.');
                }

                $afiliado->update(['estado' => 'Fallecido']);
                $servicioFunerario = ServicioFunerario::where('afiliado_id', $afiliado->id)->latest()->first();
            } else {
                $mascota = Mascota::findOrFail($request->mascota_id);

                if (strtolower($mascota->estado) === 'fallecido') {
                    return back()->with('error', 'Esta mascota ya está marcada como fallecida.');
                }

                $mascota->update(['estado' => 'Fallecido']);
                $servicioFunerario = ServicioFunerario::where('mascota_id', $mascota->id)->latest()->first();
            }

            if (!$servicioFunerario) {
                throw new \Exception('No se encontró un servicio funerario asociado.');
            }

            $etapaInicial = EtapaServicio::where('nombre', 'Fallecimiento Registrado')->firstOrFail();

            TrazabilidadServicio::create([
                'servicio_funerario_id' => $servicioFunerario->id,
                'etapa_id'              => $etapaInicial->id,
                'descripcion'           => $request->observacion ?? 'Fallecimiento registrado en el sistema.',
                'fecha'                 => now(),
                'usuario_responsable'   => auth()->id(),
            ]);

            DB::commit();

            return back()->with('message', 'Fallecimiento registrado y trazabilidad iniciada.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'No se pudo procesar: ' . $e->getMessage());
        }
    }

    public function programarCeremonia(Request $request)
    {
        $request->validate([
            'servicio_funerario_id' => 'required|exists:servicios_funerarios,id',
            'sala_velacion_id'      => 'required|exists:salas_velacion,id',
            'fecha_hora'            => 'required|date',
            'observaciones'         => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $sala = SalaVelacion::findOrFail($request->sala_velacion_id);

            if (strtolower($sala->estado) !== 'disponible') {
                return back()->with('error', 'La sala seleccionada no está disponible.');
            }

            Ceremonia::create([
                'servicio_funerario_id' => $request->servicio_funerario_id,
                'sala_velacion_id'      => $request->sala_velacion_id,
                'fecha_hora'            => $request->fecha_hora,
                'observaciones'         => $request->observaciones,
            ]);

            $sala->update(['estado' => 'Ocupada']);

            $etapa = EtapaServicio::where('nombre', 'Ceremonia Programada')->firstOrFail();

            TrazabilidadServicio::create([
                'servicio_funerario_id' => $request->servicio_funerario_id,
                'etapa_id'              => $etapa->id,
                'descripcion'           => 'Ceremonia programada en sala: ' . $sala->nombre,
                'fecha'                 => now(),
                'usuario_responsable'   => auth()->id(),
            ]);

            DB::commit();

            return back()->with('message', 'Ceremonia programada con éxito.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'No se pudo programar: ' . $e->getMessage());
        }
    }

    public function agregarEtapa(Request $request)
    {
        $request->validate([
            'servicio_funerario_id' => 'required|exists:servicios_funerarios,id',
            'etapa_id'              => 'required|exists:etapas_servicio,id',
            'descripcion'           => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            $etapa = EtapaServicio::findOrFail($request->etapa_id);

            TrazabilidadServicio::create([
                'servicio_funerario_id' => $request->servicio_funerario_id,
                'etapa_id'              => $etapa->id,
                'descripcion'           => $request->descripcion,
                'fecha'                 => now(),
                'usuario_responsable'   => auth()->id(),
            ]);

            if ($etapa->nombre === 'Servicio Finalizado') {
                $servicio = ServicioFunerario::with('ceremonias')->find($request->servicio_funerario_id);
                foreach ($servicio->ceremonias as $ceremonia) {
                    $sala = SalaVelacion::find($ceremonia->sala_velacion_id);
                    if ($sala) {
                        $sala->update(['estado' => 'Disponible']);
                    }
                }
            }

            DB::commit();

            return back()->with('message', 'Etapa agregada correctamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'No se pudo agregar la etapa: ' . $e->getMessage());
        }
    }

    private function calcularEstadisticasServicios()
    {
        $todos = ServicioFunerario::with(['trazabilidades.etapa'])->get();

        // Conteo por etapa actual
        $conteoPorEtapa = [];
        foreach ($todos as $servicio) {
            $ultima = $servicio->trazabilidades->sortByDesc('fecha')->first();
            $nombreEtapa = $ultima->etapa->nombre ?? 'Sin iniciar';
            $conteoPorEtapa[$nombreEtapa] = ($conteoPorEtapa[$nombreEtapa] ?? 0) + 1;
        }

        // Finalizados por mes (últimos 6 meses)
        $finalizadosPorMes = [];
        for ($i = 5; $i >= 0; $i--) {
            $mes = now()->subMonths($i);
            $total = TrazabilidadServicio::whereHas('etapa', fn($q) => $q->where('nombre', 'Servicio Finalizado'))
                ->whereMonth('fecha', $mes->month)
                ->whereYear('fecha', $mes->year)
                ->count();
                

            $finalizadosPorMes[] = [
                
                'mes'   => $mes->translatedFormat('M'),
                'total' => $total,
            ];
        }

        // Tiempo promedio desde "Fallecimiento Registrado" hasta "Servicio Finalizado" (en horas)
        $tiempos = [];
        foreach ($todos as $servicio) {
            $inicio = $servicio->trazabilidades->firstWhere('etapa.nombre', 'Fallecimiento Registrado');
            $fin = $servicio->trazabilidades->firstWhere('etapa.nombre', 'Servicio Finalizado');
            if ($inicio && $fin) {
                $tiempos[] = \Carbon\Carbon::parse($inicio->fecha)->diffInHours(\Carbon\Carbon::parse($fin->fecha));
            }
        }
        $tiempoPromedioHoras = count($tiempos) > 0 ? round(array_sum($tiempos) / count($tiempos), 1) : 0;

        // Salas más usadas (por cantidad de ceremonias)
        $salasMasUsadas = Ceremonia::selectRaw('sala_velacion_id, count(*) as total')
            ->groupBy('sala_velacion_id')
            ->with('salaVelacion')
            ->orderByDesc('total')
            ->get()
            ->map(fn($c) => [
                'sala'  => $c->salaVelacion->nombre ?? 'Sala eliminada',
                'total' => $c->total,
            ]);

        // Servicios por tipo (persona vs mascota)
        $serviciosPorTipo = [
            'personas'  => ServicioFunerario::whereNotNull('afiliado_id')->count(),
            'mascotas'  => ServicioFunerario::whereNotNull('mascota_id')->count(),
        ];

        // Etapas con más demora: tiempo promedio entre una etapa y la siguiente
        $demoraPromedioPorEtapa = [];
        foreach ($todos as $servicio) {
            $pasos = $servicio->trazabilidades->sortBy('fecha')->values();
            for ($i = 1; $i < $pasos->count(); $i++) {
                $nombreEtapa = $pasos[$i]->etapa->nombre ?? 'Desconocida';
                $horas = \Carbon\Carbon::parse($pasos[$i - 1]->fecha)->diffInHours(\Carbon\Carbon::parse($pasos[$i]->fecha));
                $demoraPromedioPorEtapa[$nombreEtapa][] = $horas;
            }
        }
        $demoraPromedioPorEtapa = collect($demoraPromedioPorEtapa)->map(function ($horas) {
            return round(array_sum($horas) / count($horas), 1);
        })->sortDesc();

        return [
            'conteoPorEtapa'         => $conteoPorEtapa,
            'finalizadosPorMes'      => $finalizadosPorMes,
            'tiempoPromedioHoras'    => $tiempoPromedioHoras,
            'totalEnProceso'         => $this->obtenerServicios(false)->count(),
            'totalFinalizados'       => $this->obtenerServicios(true)->count(),
            'salasMasUsadas'         => $salasMasUsadas,
            'serviciosPorTipo'       => $serviciosPorTipo,
            'demoraPromedioPorEtapa' => $demoraPromedioPorEtapa,
        ];
    }

    public function datosFormulario()
    {
        return response()->json([
            'etapas' => EtapaServicio::all(),
            'salasDisponibles' => SalaVelacion::where('estado', 'Disponible')->get(),
        ], 200);
    }

    public function buscarTitular(Request $request)
    {
        $query = trim($request->input('query', ''));

        if (strlen($query) < 2) {
            return response()->json([], 200);
        }

        $usuarios = \App\Models\User::with([
        'suscripciones' => function ($q) {
            $q->where('estado', 'activo');
        },
        'suscripciones.plan',
        'suscripciones.afiliados.genero',
        'suscripciones.mascotas.especie',
        'suscripciones.recuerdos',
        'suscripciones.serviciosExtras',
    ])
            ->where(function ($q) use ($query) {
    $q->where('cedula', 'like', "%{$query}%")
      ->orWhere('nombre', 'like', "%{$query}%")
      ->orWhereHas('afiliados', function ($qq) use ($query) {
          $qq->where('nombre', 'like', "%{$query}%")
             ->orWhere('cedula', 'like', "%{$query}%");
      });
})
            ->limit(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id'      => $user->id,
                    'nombre'  => $user->nombre,
                    'cedula'  => $user->cedula,
                    'suscripciones' => $user->suscripciones->map(function ($s) {
                        return [
                            'id'   => $s->id,
                            'plan' => $s->plan->nombre ?? 'Sin plan',
                            'afiliados' => $s->afiliados->map(fn($a) => [
                                'id'         => $a->id,
                                'nombre'     => $a->nombre,
                                'parentesco' => $a->parentesco,
                                'estado'     => $a->estado,
                                'genero'     => $a->genero->nombre ?? 'N/A',
                            ]),
                            'mascotas' => $s->mascotas->map(fn($m) => [
                                'id'      => $m->id,
                                'nombre'  => $m->nombre,
                                'estado'  => $m->estado,
                                'especie' => $m->especie->nombre ?? 'N/A',
                            ]),
                            'recuerdos' => $s->recuerdos->map(fn($r) => [
                                'nombre' => $r->nombre,
                                'costo_unitario' => $r->pivot->costo_unitario ?? 0,
                            ]),
                            'serviciosExtras' => $s->serviciosExtras->map(fn($se) => [
                                'nombre' => $se->nombre,
                                'precio_pagado' => $se->pivot->precio_pagado ?? 0,
                            ]),
                            'facturas' => \App\Models\Pagos\Factura::where('suscripcion_id', $s->id)
                                ->orderByDesc('fecha_emision')
                                ->get()
                                ->map(fn($f) => [
                                    'id'               => $f->id,
                                    'fecha_emision'    => $f->fecha_emision,
                                    'fecha_vencimiento' => $f->fecha_vencimiento,
                                    'total'            => $f->total,
                                    'monto_pagado'     => $f->monto_pagado,
                                    'saldo_pendiente'  => $f->saldo_pendiente,
                                    'estado'           => $f->estado_factura_id == 2 ? 'Pagada' : ($f->estado_factura_id == 3 ? 'Abonada' : 'Pendiente'),
                                ]),
                                'total_deuda' => \App\Models\Pagos\Factura::where('suscripcion_id', $s->id)
                                ->get()
                                ->sum('saldo_pendiente'),
                        ];
                    }),
                ];
            })
            ->filter(fn($u) => $u['suscripciones']->isNotEmpty())
            ->values();

        return response()->json($usuarios, 200);
    }
    public function cartaFallecimiento($servicioId)
    {
        $servicio = ServicioFunerario::with(['afiliado.genero', 'mascota.especie', 'ceremonias.salaVelacion'])
            ->findOrFail($servicioId);

        $sujeto = $servicio->afiliado ?? $servicio->mascota;
        $ceremonia = $servicio->ceremonias->first();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reportes.carta-fallecimiento', [
            'nombre'    => $sujeto->nombre ?? 'N/A',
            'fechaNac'  => $sujeto->fecha_nacimiento ?? null,
            'ceremonia' => $ceremonia,
        ])->setPaper('A4', 'landscape');

        return $pdf->download('carta-fallecimiento-' . ($sujeto->nombre ?? 'servicio') . '.pdf');
    }
    public function cartaAtencion($servicioId)
    {
        $servicio = ServicioFunerario::with([
                'afiliado.genero',
                'afiliado.tipoDocumento',
                'mascota.especie',
                'trazabilidades.etapa',
                'trazabilidades.responsable',
                'ceremonias.salaVelacion',
            ])->findOrFail($servicioId);

        $sujeto = $servicio->afiliado ?? $servicio->mascota;

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reportes.carta-atencion', [
            'servicio' => $servicio,
            'sujeto'   => $sujeto,
            'fecha'    => now()->format('d/m/Y H:i'),
        ]);

        return $pdf->download('carta-atencion-' . ($sujeto->nombre ?? 'servicio') . '.pdf');
    }

    public function imagenWhatsapp($ceremoniaId)
{
    $ceremonia = Ceremonia::with([
        'servicioFunerario.afiliado',
        'servicioFunerario.mascota',
        'salaVelacion'
    ])->findOrFail($ceremoniaId);

    $sujeto = $ceremonia->servicioFunerario->afiliado
        ?? $ceremonia->servicioFunerario->mascota;

    $manager = new \Intervention\Image\ImageManager(
        new \Intervention\Image\Drivers\Gd\Driver()
    );

    $imagen = $manager->read(
        public_path('images/Admin/Servicios_funerarios/fondo_img_w.png')
    );

    $ancho = $imagen->width();

    /*
    |--------------------------------------------------------------------------
    | Nombre
    |--------------------------------------------------------------------------
    */

    $imagen->text(
        $sujeto->nombre ?? 'N/A',
        $ancho / 2,
        700,
        function ($font) {
            $font->file(public_path('fonts/HeptaSlab-Bold.ttf'));
            $font->size(90);
            $font->color('#3A322A');
            $font->align('center');
            $font->valign('middle');
        }
    );

    /*
    |--------------------------------------------------------------------------
    | Fechas
    |--------------------------------------------------------------------------
    */

    $fechaTexto = '';

    if ($sujeto->fecha_nacimiento) {
        $fechaTexto =
            \Carbon\Carbon::parse($sujeto->fecha_nacimiento)->format('M Y')
            .'  —  '.
            now()->format('M Y');
    }

    $imagen->text(
        $fechaTexto,
        $ancho / 2,
        790,
        function ($font) {
            $font->file(public_path('fonts/HeptaSlab-Bold.ttf'));
            $font->size(60);
            $font->color('#ffd22f');
            $font->align('center');
            $font->valign('middle');
        }
    );

    /*
    |--------------------------------------------------------------------------
    | Texto
    |--------------------------------------------------------------------------
    */

    $imagen->text(
        'Será velado(a) en',
        $ancho / 2,
        1315,
        function ($font) {
            $font->file(public_path('fonts/HeptaSlab-VariableFont_wght.ttf'));
            $font->size(46);
            $font->color('#5A4A3A');
            $font->align('center');
            $font->valign('middle');
        }
    );

    /*
    |--------------------------------------------------------------------------
    | Sala
    |--------------------------------------------------------------------------
    */

    $imagen->text(
        $ceremonia->salaVelacion->nombre ?? 'Nuestras Instalaciones',
        $ancho / 2,
        1390,
        function ($font) {
            $font->file(public_path('fonts/HeptaSlab-Bold.ttf'));
            $font->size(70);
            $font->color('#3A322A');
            $font->align('center');
            $font->valign('middle');
        }
    );

    /*
    |--------------------------------------------------------------------------
    | Fecha
    |--------------------------------------------------------------------------
    */

    $imagen->text(
        \Carbon\Carbon::parse($ceremonia->fecha_hora)
            ->translatedFormat('d \d\e F \d\e Y'),
        $ancho / 2,
        1480,
        function ($font) {
            $font->file(public_path('fonts/HeptaSlab-Bold.ttf'));
            $font->size(48);
            $font->color('#3A322A');
            $font->align('center');
            $font->valign('middle');
        }
    );

    /*
    |--------------------------------------------------------------------------
    | Hora
    |--------------------------------------------------------------------------
    */

    $imagen->text(
        \Carbon\Carbon::parse($ceremonia->fecha_hora)->format('h:i A'),
        $ancho / 2,
        1560,
        function ($font) {
            $font->file(public_path('fonts/HeptaSlab-VariableFont_wght.ttf'));
            $font->size(46);
            $font->color('#6E5D4C');
            $font->align('center');
            $font->valign('middle');
        }
    );

    return response($imagen->toPng())
        ->header('Content-Type', 'image/png');
}

    // ==========================
    // CRUD: ETAPAS DE SERVICIO
    // ==========================

    public function crearEtapa(Request $request)
    {
        $request->validate(['nombre' => 'required|string|max:50|unique:etapas_servicio,nombre']);
        EtapaServicio::create(['nombre' => $request->nombre]);
        return back()->with('message', 'Etapa creada correctamente.');
    }

    public function actualizarEtapa(Request $request, $id)
    {
        $request->validate(['nombre' => 'required|string|max:50|unique:etapas_servicio,nombre,' . $id]);
        $etapa = EtapaServicio::findOrFail($id);
        $etapa->update(['nombre' => $request->nombre]);
        return back()->with('message', 'Etapa actualizada correctamente.');
    }

    public function eliminarEtapa($id)
    {
        $etapa = EtapaServicio::findOrFail($id);

        if ($etapa->trazabilidades()->exists()) {
            return back()->with('error', 'No se puede eliminar esta etapa: ya tiene historial de trazabilidad asociado.');
        }

        $etapa->delete();
        return back()->with('message', 'Etapa eliminada correctamente.');
    }

    // ==========================
    // CRUD: SALAS DE VELACIÓN
    // ==========================

    public function crearSala(Request $request)
    {
        $request->validate(['nombre' => 'required|string|max:100|unique:salas_velacion,nombre']);
        SalaVelacion::create(['nombre' => $request->nombre, 'estado' => 'Disponible']);
        return back()->with('message', 'Sala creada correctamente.');
    }

    public function actualizarSala(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:100|unique:salas_velacion,nombre,' . $id,
            'estado' => 'required|in:Disponible,Ocupada,Mantenimiento',
        ]);

        $sala = SalaVelacion::findOrFail($id);
        $sala->update(['nombre' => $request->nombre, 'estado' => $request->estado]);
        return back()->with('message', 'Sala actualizada correctamente.');
    }

    public function eliminarSala($id)
    {
        $sala = SalaVelacion::findOrFail($id);

        if ($sala->ceremonias()->exists()) {
            return back()->with('error', 'No se puede eliminar esta sala: tiene ceremonias asociadas en el historial.');
        }

        $sala->delete();
        return back()->with('message', 'Sala eliminada correctamente.');
    }

    // ==========================
    // EDITAR CEREMONIA
    // ==========================

    public function editarCeremonia(Request $request, $id)
    {
        $request->validate([
            'sala_velacion_id' => 'required|exists:salas_velacion,id',
            'fecha_hora'       => 'required|date',
            'observaciones'    => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $ceremonia = Ceremonia::findOrFail($id);
            $salaAnteriorId = $ceremonia->sala_velacion_id;

            if ($salaAnteriorId != $request->sala_velacion_id) {
                $nuevaSala = SalaVelacion::findOrFail($request->sala_velacion_id);

                if (strtolower($nuevaSala->estado) !== 'disponible') {
                    return back()->with('error', 'La nueva sala seleccionada no está disponible.');
                }

                $salaAnterior = SalaVelacion::find($salaAnteriorId);
                if ($salaAnterior) {
                    $salaAnterior->update(['estado' => 'Disponible']);
                }

                $nuevaSala->update(['estado' => 'Ocupada']);
            }

            $ceremonia->update([
                'sala_velacion_id' => $request->sala_velacion_id,
                'fecha_hora'       => $request->fecha_hora,
                'observaciones'    => $request->observaciones,
            ]);

            DB::commit();
            return back()->with('message', 'Ceremonia actualizada correctamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'No se pudo actualizar la ceremonia: ' . $e->getMessage());
        }
    }
    
}