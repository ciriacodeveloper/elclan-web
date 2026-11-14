# El Clan · Landing de captación

Landing page de alto impacto para **El Clan EAFC S.A.** (fondos colectivos para vehículos), orientada a generar leads por formulario y por WhatsApp.

Hecha en **HTML + CSS + JS puro**, sin dependencias ni build. Se abre directamente con `index.html` o se sube tal cual a cualquier hosting estático (Netlify, Vercel, cPanel, S3, etc.).

## Estructura

```
elclan/
├── index.html          # Página completa (una sola página, secciones ancladas)
├── css/styles.css      # Estilos, animaciones y responsive
├── js/main.js          # Interacciones: preloader, cursor, partículas, simulador, formulario…
└── assets/img/         # Imágenes (hero, tipos de vehículo, banner, logo)
```

## Antes de publicar: 3 cosas que debes configurar

Todo está al inicio de `js/main.js`, en el objeto `CONFIG`:

| Campo | Qué es | Valor actual |
|---|---|---|
| `whatsappNumber` | Número de WhatsApp de ventas en formato internacional sin `+` (ej. `51987654321`) | `51999999999` **(placeholder, cámbialo)** |
| `formEndpoint` | URL que recibe los leads del formulario por `POST` JSON. Si se deja vacío, el formulario abre WhatsApp con los datos ya escritos | vacío |
| `tipoCambio` | Tipo de cambio referencial para mostrar la cuota en soles | `3.72` |

### Opciones para `formEndpoint`

- **Formspree / Getform / Basin**: crea un formulario, copia la URL y pégala. Reciben JSON y envían email.
- **Backend propio / CRM**: cualquier endpoint que acepte `POST` con `Content-Type: application/json` y responda 2xx. Debe permitir CORS desde el dominio del sitio.

Payload que se envía:

```json
{
  "nombres": "…", "apellidos": "…", "celular": "9XXXXXXXX", "email": "…",
  "ciudad": "Lima", "vehiculo": "SUV", "certificado": "18000",
  "comentario": "…", "acepto": "on",
  "origen": "landing-elclan", "fecha": "ISO-8601", "pagina": "URL"
}
```

Si el envío falla, la página muestra un aviso y ofrece WhatsApp y teléfono como alternativa. El formulario incluye un campo honeypot (`website`) contra spam.

## Simulador de cuota

Usa los valores del programa de 80 meses publicados por El Clan:

- Cuota mensual = valor del certificado × `0.0147125`
- Inscripción única = valor × `0.0472` (4% + IGV)

Si el tarifario cambia, ajusta `cuotaFactor` e `inscripcionFactor` en `CONFIG` y las opciones del `<select id="certificado">` en `index.html`.

## Imágenes

Las fotos de vehículos provienen de Unsplash (licencia libre para uso comercial). Se recomienda reemplazarlas por fotografía propia o de las marcas con las que trabaja El Clan. Tamaños sugeridos:

- `hero-car.jpg`: 1800 × 1200 px
- `tipo-*.jpg`: 900 × 600 px
- `cta-road.jpg`: 1800 × 1200 px

El logo en la cabecera es una recreación vectorial del isotipo (`#logo-mark` en el sprite SVG de `index.html`) más el nombre en texto. Si tienes el logo oficial en SVG, reemplaza ese símbolo.

## Secciones

1. Hero con partículas, parallax y titular animado
2. Cinta de beneficios en movimiento
3. Cifras con contadores animados
4. Beneficios (tarjetas 3D con luz que sigue el cursor)
5. Cómo funciona (línea de progreso ligada al scroll)
6. Simulador de cuota interactivo
7. Tipos de vehículo
8. Comparativa El Clan vs. crédito tradicional
9. Respaldo regulatorio (SMV)
10. Banner CTA con parallax
11. Preguntas frecuentes (acordeón)
12. Oficinas con enlace a Google Maps
13. Formulario de cotización + datos de contacto
14. Footer con aviso legal de la SMV
15. Botón flotante de WhatsApp

## Accesibilidad y rendimiento

- Respeta `prefers-reduced-motion` (desactiva animaciones pesadas).
- Cursor personalizado y efectos de tilt solo en dispositivos con mouse.
- Las partículas se pausan cuando el hero sale de pantalla.
- Sin overflow horizontal en móvil (probado a 390 px).
- Metadatos Open Graph y JSON-LD (`FinancialService`) para SEO.
