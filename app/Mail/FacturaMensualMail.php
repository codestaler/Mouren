<?php

namespace App\Mail;

use App\Models\Pagos\Factura;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class FacturaMensualMail extends Mailable
{
    use Queueable, SerializesModels;

    public $factura;

    public function __construct(Factura $factura)
    {
        $this->factura = $factura;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu Factura de Previsión Exequial - Mouren #' . $this->factura->id,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.factura', // Crearemos esta vista en el paso 3
        );
    }

    public function attachments(): array
{
    $pdf = Pdf::loadView('pdf.factura_comprobante', ['factura' => $this->factura]);
    
    return [
        Attachment::fromData(function() use ($pdf) {
            return $pdf->output();
        }, "factura-mouren-{$this->factura->id}.pdf")
        ->withMime('application/pdf'),
    ];
}
}