# Isopaneles — Asistente IA

Chat de inteligencia artificial para atención al cliente de una empresa de isopaneles. Responde consultas técnicas y comerciales de forma automática: tipos de panel, espesores, instalación, precios y logística.

---

## Estructura del proyecto

```
/proyecto
 ├── index.html      → Estructura HTML del chat
 ├── style.css       → Estilos y diseño responsive
 ├── script.js       → Lógica de UI + punto de conexión con la API
 └── README.md       → Este archivo
```

---

## Arquitectura

```
Cliente (Navegador)
       ↓
  GitHub Pages
  index.html / style.css / script.js
       ↓
  Backend serverless
  Cloudflare Worker
       ↓
  API de IA
  (OpenAI / OpenRouter / etc.)
       ↓
  Respuesta al cliente
```

> El frontend nunca expone la clave de API. Toda comunicación con la IA pasa por el Worker.

---

## Stack

| Capa        | Tecnología              |
|-------------|-------------------------|
| Frontend    | HTML · CSS · JavaScript |
| Deploy      | GitHub Pages            |
| Backend     | Cloudflare Workers      |
| IA          | OpenAI API (GPT-4o mini)|

---

## Seguridad

- La clave de API **nunca** está en el frontend ni en el repositorio
- El Worker actúa como proxy seguro entre el navegador y la API de IA
- Se recomienda restringir el header `Access-Control-Allow-Origin` al dominio de producción una vez desplegado