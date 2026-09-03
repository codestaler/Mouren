<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Página no encontrada - 404</title>
    <!-- Si usas Tailwind desde CDN o Vite, puedes incluirlo aquí -->
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#FFFFFF] flex items-center justify-center h-screen m-0">

    <div class="text-center p-6 max-w-md mx-auto">
        <!-- Tu imagen personalizada -->
        <img src="{{ asset('images/error-404.png') }}" alt="Error 404" class="w-48 h-48 mx-auto object-contain mb-6">
        
        <h1 class="text-2xl font-black text-[#60533E] uppercase tracking-wider mb-2">¡Página no encontrada!</h1>
        <p class="text-xs text-gray-500 mb-6 font-medium">Lo sentimos, la ruta que intentas buscar no existe o ha sido movida.</p>
        
        <a href="{{ url('/') }}" class="px-6 py-3 bg-[#60533E] text-white rounded-full font-black uppercase text-xs tracking-widest shadow-md transition-all hover:bg-[#473D2D]">
            Volver al Inicio
        </a>
    </div>

</body>
</html>