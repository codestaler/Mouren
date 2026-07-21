<?php

namespace App\Exports;

use App\Models\Pagos\Factura;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class FacturasExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return Factura::with([
            'suscripcion.usuario',
            'suscripcion.plan',
            'estado'
        ])
        ->get()
        ->map(function ($f) {

            return [

                $f->id,

                $f->suscripcion?->usuario?->nombre,

                $f->suscripcion?->plan?->nombre,

                $f->fecha_emision,

                $f->fecha_vencimiento,

                $f->total,

                $f->estado?->nombre,

            ];

        });

    }

    public function headings(): array
    {
        return [

            'Factura',

            'Cliente',

            'Plan',

            'Emisión',

            'Vencimiento',

            'Valor',

            'Estado',

        ];
    }
}