import React from 'react';

// 🆕 Red de seguridad para toda la app: React, por defecto, si algo se
// rompe en CUALQUIER parte del sitio (cualquier botón, cualquier página),
// deja TODA la pantalla en blanco. Este componente lo evita: si algo
// se rompe, en vez de la pantalla blanca se muestra este aviso con un
// botón para recargar, y el resto del sitio sigue disponible.
//
// No cambia absolutamente nada de cómo se ve o funciona el sitio cuando
// todo va bien — solo entra en acción cuando algo ya se iba a romper de
// todas formas (que es justo cuando antes se ponía en blanco).
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tieneError: false };
    }

    static getDerivedStateFromError() {
        return { tieneError: true };
    }

    componentDidCatch(error, info) {
        // Queda registrado en la consola del navegador para poder
        // diagnosticar qué falló, sin afectar al usuario.
        console.error('Mouren: error atrapado por la red de seguridad.', error, info);
    }

    render() {
        if (this.state.tieneError) {
            return (
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '24px',
                        fontFamily: "'Hepta Slab', serif",
                        backgroundColor: '#FDFBF9',
                        color: '#5D4E3F',
                    }}
                >
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>🕊️</div>
                    <h1 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '8px' }}>
                        Algo salió mal
                    </h1>
                    <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '24px', maxWidth: '320px', lineHeight: 1.5 }}>
                        Ocurrió un error inesperado en la página. Intenta recargar — tu información no se pierde. Si el problema sigue, cuéntanos qué estabas haciendo.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            backgroundColor: '#A68966',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '12px 28px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                        }}
                    >
                        Recargar página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
