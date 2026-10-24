<div align="center">

# Mouren

**Plataforma web de previsión funeraria con espacios digitales de memoria para personas y mascotas.**

[Ver demo en línea](https://funerariamouren.site) · [Capturas](#-capturas) · [Instalación](#-instalación-local)

![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php&logoColor=white)
![React](https://img.shields.io/badge/React-Inertia.js-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)

</div>

---

## 📌 ¿Qué es Mouren?

Mouren es una plataforma para planificar con anticipación un servicio funerario, tanto para personas como para mascotas, desde un solo lugar y sin trámites presenciales innecesarios.

Planear estas cosas casi siempre pasa en el peor momento: con prisa, con dolor y con poca información. Mouren busca que esas decisiones se tomen antes, con calma, y que además se pueda dejar algo más que un contrato: fotos, cartas y canciones que acompañen el recuerdo de quienes importan a cada familia.

## ✨ Funcionalidades

**Previsión y afiliación**
- Registro e inicio de sesión de usuarios.
- Planes de previsión funeraria y afiliación de beneficiarios.
- Planes para mascotas.
- Personalización de servicios.

**Pagos**
- Gestión de pagos y facturas.

**Recuerdos digitales**
- Espacios de memoria para cada persona o mascota afiliada.
- Fotografías, cartas y canciones asociadas a cada recuerdo.

**Administración y atención**
- Panel para gestionar usuarios y servicios.
- Roles y permisos.
- Notificaciones relacionadas con los planes.
- Chat de atención dentro de la plataforma.

**General**
- Diseño adaptable a distintos tamaños de pantalla.

## 📸 Capturas

### Página principal
![Captura Home](docs/capturas/home.png)

### Inicio de sesión
![Captura Login](docs/capturas/login.png)

### Proceso de registro
![Captura Registro](docs/capturas/registro.png)

### Panel administrativo
![Captura Panel de Admin](docs/capturas/admin.png)

## 🛠️ Tecnologías

| Área | Tecnología |
| --- | --- |
| Backend | Laravel 12, PHP 8.2 |
| Frontend | React, Inertia.js, Vite |
| Estilos | Tailwind CSS |
| Base de datos | MySQL |
| Autenticación | Laravel Sanctum |
| Imágenes | Intervention Image |
| Pagos | Mercado Pago |
| Correo | Brevo |
| Despliegue | Railway (aplicación y base de datos) |
| Dominio | Cloudflare |
| Control de versiones | Git y GitHub |

## 🏗️ Arquitectura

Mouren es una aplicación monolítica: Laravel maneja la lógica del servidor y React construye la interfaz. **Inertia.js** conecta ambos, así que no hay una API REST separada: Laravel devuelve páginas de React directamente.

```text
   Navegador
       │
       ▼
   Cloudflare  (dominio)
       │
       ▼
┌─────────────────────────────┐
│  Railway                    │
│                             │
│  Laravel (PHP)              │
│    └─ Inertia ─► React/Vite │
│         │                   │
│         ▼                   │
│       MySQL                 │
└─────────────┬───────────────┘
              │
      ┌───────┴────────┐
      ▼                ▼
 Mercado Pago        Brevo
   (pagos)           (correo)
```

## 💻 Instalación local

### Requisitos

- PHP 8.2 o superior
- Composer
- Node.js y npm
- MySQL
- Git

### Pasos

**1. Clonar el repositorio**

```bash
git clone https://github.com/codestaler/Mouren.git
cd Mouren
```

**2. Instalar dependencias**

```bash
composer install
npm install
```

**3. Crear el archivo de entorno**

```bash
cp .env.example .env
```

En Windows puedes copiar `.env.example` y renombrarlo a `.env` a mano.

**4. Generar la clave de la aplicación**

```bash
php artisan key:generate
```

**5. Configurar la base de datos**

Crea una base de datos vacía en MySQL y completa estas variables en tu `.env`:

```env
DB_DATABASE=nombre_de_tu_base
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

Luego ejecuta las migraciones:

```bash
php artisan migrate
```

**6. Enlazar el almacenamiento**

Necesario para que se vean las imágenes y archivos que suben los usuarios:

```bash
php artisan storage:link
```

**7. Ejecutar el proyecto**

En una terminal:

```bash
php artisan serve
```

En otra:

```bash
npm run dev
```

Abre la dirección que muestra `php artisan serve` (normalmente `http://127.0.0.1:8000`).

> **Servicios externos:** los pagos (Mercado Pago) y el correo (Brevo) necesitan credenciales propias en el `.env`. Sin ellas, el resto de la plataforma puede ejecutarse, pero esas funciones no van a responder.

Para generar los archivos de producción: `npm run build`.

## 🔐 Seguridad

Mouren se apoya en los mecanismos que ofrece Laravel y en algunas prácticas básicas:

- Autenticación de usuarios con Laravel.
- Control de acceso por roles y rutas protegidas.
- Validación de los datos que recibe el servidor.
- Credenciales y claves en variables de entorno (`.env`), fuera del repositorio.

Es un proyecto formativo y no ha pasado por una auditoría de seguridad.

## 🌐 Demo y despliegue

**En línea:** [funerariamouren.site](https://funerariamouren.site)

La aplicación y la base de datos están desplegadas en **Railway**, y el dominio se gestiona con **Cloudflare**.

## 👨‍💻 Autor

**Duvan Davilla** · [GitHub](https://github.com/andre05dada-cloud)

Desarrollé Mouren como proyecto formativo del programa de **Análisis y Desarrollo de Software (ADSO)** del **SENA**. Mi trabajo abarcó el diseño y desarrollo de la aplicación (frontend y backend), la base de datos, la integración de servicios externos y el despliegue.

La idea fue explorar cómo combinar la previsión funeraria con herramientas digitales de personalización y memoria, y llevarla hasta una aplicación funcionando en línea.

## 📄 Licencia

Proyecto desarrollado con fines académicos y formativos.
