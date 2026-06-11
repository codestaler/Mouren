<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Factura;
use App\Models\User;

class InvoicePendingMail extends Mailable
{
    use Queueable, SerializesModels;

    public $factura;
    public $usuario;

    public function __construct(Factura $factura, User $usuario)
    {
        $this->factura = $factura;
        $this->usuario = $usuario;
    }

    public function build()
    {
        return $this->subject('Tienes una nueva factura pendiente - Mouren')
                    ->view('emails.invoice_pending'); // Crearemos esta vista HTML ahora
    }
}