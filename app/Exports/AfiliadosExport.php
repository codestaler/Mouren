<?php

namespace App\Exports;

use App\Models\Afiliado;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AfiliadosExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Afiliado::with(['usuario', 'genero', 'tipoDocumento', 'suscripcion.plan'])->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nombre',
            'Parentesco',
            'Estado',
            'Género',
            'Tipo de Documento',
            'Cédula',
            'Fecha de Nacimiento',
            'Titular (Usuario)',
            'Plan',
        ];
    }

    public function map($afiliado): array
    {
        return [
            $afiliado->id,
            $afiliado->nombre,
            $afiliado->parentesco,
            $afiliado->estado,
            $afiliado->genero->nombre ?? 'No especificado',
            $afiliado->tipoDocumento->nombre ?? 'No especificado',
            $afiliado->cedula ?? 'No registrada',
            $afiliado->fecha_nacimiento ? \Carbon\Carbon::parse($afiliado->fecha_nacimiento)->format('d/m/Y') : 'No registrada',
            $afiliado->usuario->nombre ?? 'Sin usuario',
            $afiliado->suscripcion->plan->nombre ?? 'Sin plan',
        ];
    }
}