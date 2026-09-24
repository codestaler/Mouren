import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
// 🆕 Red de seguridad: si algo se rompe en cualquier parte del sitio,
// esto evita que TODA la pantalla se quede en blanco (ver ErrorBoundary.jsx).
import ErrorBoundary from './ErrorBoundary';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // 🆕 Antes: root.render(<App {...props} />);
        // Ahora envolvemos la app en la red de seguridad. Cuando todo
        // funciona bien, esto no cambia nada — solo actúa si algo se rompe.
        root.render(
            <ErrorBoundary>
                <App {...props} />
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
