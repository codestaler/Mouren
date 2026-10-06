# Mouren

> Plataforma web de previsión funeraria que combina tecnología, personalización y acompañamiento para facilitar la planificación de servicios funerarios y la creación de recuerdos digitales.

## 📌 El problema

La planificación de servicios funerarios puede ser un proceso difícil y poco accesible, especialmente cuando las personas deben tomar decisiones importantes en momentos emocionalmente complejos.

Además, muchas soluciones tradicionales no ofrecen herramientas digitales para personalizar los planes, gestionar afiliados o conservar recuerdos de las personas y mascotas importantes para cada familia.

## 💡 La solución

**Mouren** es una plataforma web de previsión funeraria que permite gestionar planes de afiliación, beneficiarios, servicios y pagos desde un entorno digital.

El sistema también incorpora espacios de memoria y personalización, permitiendo conservar fotografías, cartas, canciones y otros recuerdos asociados a las personas o mascotas afiliadas.

### ✨ Funcionalidades principales

* Registro e inicio de sesión de usuarios.
* Gestión de planes de previsión funeraria.
* Afiliación y administración de beneficiarios.
* Gestión de planes para mascotas.
* Personalización de servicios.
* Gestión de pagos y facturas.
* Creación y administración de recuerdos digitales.
* Fotografías, cartas y canciones asociadas a recuerdos.
* Panel para la gestión de usuarios y servicios.
* Sistema de roles y permisos.
* Notificaciones relacionadas con los planes.
* Espacios digitales de memoria.
* Chat de atención dentro de la plataforma.
* Diseño adaptable a diferentes dispositivos.

## 🛠️ Tecnologías utilizadas

| Capa                  | Tecnología         |
| --------------------- | ------------------ |
| Backend               | Laravel 12         |
| Lenguaje backend      | PHP 8.2            |
| Frontend              | React              |
| Integración           | Inertia.js         |
| Construcción frontend | Vite               |
| Estilos               | Tailwind CSS       |
| Base de datos         | MySQL              |
| Autenticación         | Laravel Sanctum    |
| Control de versiones  | Git / GitHub       |
| Despliegue            | Railway            |
| Dominio               | Cloudflare         |
| Edición de imágenes   | Intervention Image |
| Pagos                 | Mercado Pago       |
| Correo electrónico    | Brevo              |

## 🏗️ Arquitectura

Mouren utiliza una arquitectura web en la que Laravel se encarga de la lógica del servidor y React de la interfaz de usuario.

La comunicación entre ambas partes se realiza mediante **Inertia.js**, mientras que MySQL almacena la información de usuarios, planes, afiliados, servicios, pagos y recuerdos.

```text
                USUARIO
                   │
                   ▼
              REACT + VITE
                   │
                   ▼
               INERTIA
                   │
                   ▼
             LARAVEL / PHP
                   │
          ┌────────┴────────┐
          ▼                 ▼
       MYSQL          SERVICIOS EXTERNOS
                            │
                 ┌──────────┼──────────┐
                 ▼          ▼          ▼
            Mercado Pago  Brevo    Cloudflare
```

## 🚀 Instalación y ejecución

### Requisitos

Para ejecutar Mouren localmente se requiere:

* PHP 8.2 o superior.
* Composer.
* Node.js y npm.
* MySQL.
* Git.
* Un entorno compatible con Laravel.

### 1. Clonar el repositorio

```bash
git clone https://github.com/codestaler/Mouren.git
cd Mouren
```

### 2. Instalar dependencias de PHP

```bash
composer install
```

### 3. Instalar dependencias de JavaScript

```bash
npm install
```

### 4. Configurar el archivo de entorno

Crear una copia del archivo `.env.example`:

```bash
cp .env.example .env
```

En Windows también puede copiarse manualmente `.env.example` como `.env`.

Configurar en `.env` las credenciales correspondientes de la base de datos y los servicios externos utilizados por el proyecto.

### 5. Generar la clave de la aplicación

```bash
php artisan key:generate
```

### 6. Configurar la base de datos

Crear una base de datos MySQL y configurar sus datos de conexión en el archivo `.env`.

Posteriormente ejecutar las migraciones:

```bash
php artisan migrate
```

### 7. Ejecutar el proyecto

Iniciar el servidor de Laravel:

```bash
php artisan serve
```

En otra terminal ejecutar Vite:

```bash
npm run dev
```

Después de iniciar ambos procesos, acceder a la dirección local indicada por Laravel.

## 🌐 Demo

**Proyecto desplegado:**

https://funerariamouren.site

## 📸 Capturas

Las siguientes capturas muestran algunas de las principales funcionalidades de Mouren.

> Las imágenes pueden agregarse posteriormente dentro de una carpeta `docs/img/` del repositorio.

| Pantalla       | Descripción                                          |
| -------------- | ---------------------------------------------------- |
| Inicio         | Página principal de Mouren                           |
| Planes         | Visualización de los planes disponibles              |
| Inscripción    | Proceso de afiliación de usuarios y beneficiarios    |
| Dashboard      | Panel principal del usuario                          |
| Recuerdos      | Gestión de recuerdos digitales                       |
| Administración | Gestión de información desde el panel administrativo |

## 🔐 Seguridad

Mouren implementa diferentes mecanismos orientados a proteger la información de los usuarios y controlar el acceso a las funcionalidades del sistema.

Entre ellos se encuentran:

* Autenticación de usuarios.
* Control de acceso mediante roles.
* Protección de rutas.
* Validación de información recibida.
* Manejo de sesiones.
* Protección de variables sensibles mediante `.env`.
* Uso de mecanismos de autenticación proporcionados por Laravel.
* Separación de la información sensible de las credenciales del código fuente.

Las credenciales y variables sensibles utilizadas durante el despliegue no forman parte del repositorio público.

## ☁️ Despliegue

El proyecto fue preparado para funcionar en un entorno de producción utilizando **Railway** para el despliegue de la aplicación y la base de datos.

También se configuró un dominio personalizado para facilitar el acceso a la plataforma:

**https://funerariamouren.site**

## 👨‍💻 Autor

### Angel Hung

Desarrollador del proyecto Mouren.

El desarrollo incluyó el diseño y construcción de la aplicación, desarrollo frontend y backend, integración de la base de datos, implementación de funcionalidades, automatización de procesos, integración de servicios externos, pruebas, solución de errores y despliegue del proyecto.

**GitHub:**
https://github.com/codestaler

## 🎓 Contexto del proyecto

Proyecto formativo desarrollado como parte del programa de **Análisis y Desarrollo de Software (ADSO)** del **SENA**.

Mouren fue desarrollado como una propuesta tecnológica orientada a combinar la previsión funeraria con herramientas digitales de personalización y memoria.

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos y formativos.
