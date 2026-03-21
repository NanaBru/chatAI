# Isopaneles — Asistente IA

Chat de inteligencia artificial para atención al cliente de una empresa de isopaneles. Responde consultas técnicas y comerciales de forma automática, actuando como un filtro de ventas inteligente que guía al usuario hacia la cotización final y deriva el pedido estructurado directamente a WhatsApp.

---

## Estructura del proyecto

\`\`\`text
/proyecto
 ├── index.html      → Estructura HTML del chat
 ├── style.css       → Estilos y diseño responsive
 ├── script.js       → Lógica de UI, parseo de Markdown e integración con WhatsApp
 └── README.md       → Este archivo
 └── /assets         → Imágenes y archivos estáticos
\`\`\`

---

## Flujo de Venta y Arquitectura

\`\`\`text
Cliente (Navegador)
       ↓
 GitHub Pages (index.html / script.js)
       ↓
 Backend serverless (Cloudflare Worker)
       ↓
 API de IA (OpenRouter)
       ↓
 Respuesta al cliente (Asesoramiento / Guía a Cotización)
       ↓
 Cliente presiona "Cotizar" 
       ↓
 IA genera Resumen Técnico del chat
       ↓
 Script pide Nombre/Teléfono en el chat
       ↓
 Redirección a WhatsApp (Mensaje pre-formateado)
\`\`\`

> El frontend nunca expone la clave de API. Toda comunicación con la IA pasa por el Worker.

---

## Funcionalidades Principales

- **Cierre de Ventas Inteligente:** La IA está instruida para responder dudas técnicas, pero en cuanto el usuario muestra intención de compra, lo guía al botón "Cotizar" sin alucinar intervenciones humanas.
- **Generación de Resumen Técnico:** Al solicitar una cotización, la IA analiza el historial y extrae un listado limpio de productos, ubicación y envío.
- **Integración Directa con WhatsApp:** El sistema toma el resumen de la IA, lo formatea nativamente para WhatsApp (convirtiendo markdown web a asteriscos `*negrita*`) y abre un enlace `wa.me` precompletado con los datos del cliente.
- **Renderizado Markdown:** El chat web interpreta respuestas enriquecidas de la IA (títulos `###`, negritas `**`, listas de viñetas) para una lectura más cómoda y profesional.

---

## Stack Tecnológico

| Capa        | Tecnología                          |
|-------------|-------------------------------------|
| Frontend    | HTML · CSS · Vanilla JavaScript     |
| Deploy      | GitHub Pages                        |
| Backend     | Cloudflare Workers                  |
| IA          | OpenRouter (Nvidia Nemotron 120b)   |

---

## Seguridad

- La clave de API **nunca** está en el frontend ni en el repositorio.
- El Worker actúa como proxy seguro entre el navegador y la API de IA.