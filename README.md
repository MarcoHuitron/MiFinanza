# MiFinanza

**MiFinanza** es una aplicación web para la gestión de finanzas personales. Permite a los usuarios registrar ingresos, administrar tarjetas, registrar compras (incluyendo compras a meses), y llevar un historial de gastos. También incluye un sistema de soporte para que los usuarios puedan enviar mensajes de ayuda.

## Características principales

- Registro y login de usuarios
- Gestión de tarjetas (débito y crédito)
- Registro de compras y gastos
- Control de compras a meses
- Visualización de historial de compras
- Envío de mensajes de soporte
- Conexión segura a MongoDB Atlas

## Tecnologías utilizadas

- **Frontend:** HTML, CSS, JavaScript, Bootstrap
- **Backend:** Node.js, Express.js
- **Base de datos:** MongoDB Atlas
- **Despliegue frontend:** Netlify
- **Despliegue backend:** Render

## Instalación y uso local

1. Clona el repositorio.
2. Ejecuta `npm install` para instalar dependencias.
3. Crea un archivo `.env` con tu cadena de conexión de MongoDB.
4. Ejecuta `npm start` para iniciar el servidor backend.
5. Abre `public/index.html` en tu navegador para usar la app localmente.

## Notas

- No subas tu archivo `.env` ni la carpeta `node_modules` al repositorio.
- El frontend debe consumir la API del backend usando la URL pública de Render en producción.

---