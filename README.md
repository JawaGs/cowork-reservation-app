# Cowork Reservation App

Proyecto de portafolio: flujo de reserva de espacios de coworking construido con **Next.js (App Router)**. Sin backend real — todos los datos son mock. El objetivo es demostrar manejo de estado complejo entre pasos multi-step, experimentación A/B real (no simulada), contenido geo-targeted y testing de lógica de negocio.

Público objetivo: clientes/reclutadores freelance (EU/US) evaluando seniority técnico.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 (paleta y escalas propias, sin librería de componentes)
- Vitest + React Testing Library
- Playwright (devDependency) para verificación visual/E2E real en navegador — ver [Testing](#testing)

## Flujo de rutas

```
/                    landing / catálogo de espacios (market)
/espacios/[id]       detalle de un espacio
/reserva/fecha       selección de fecha y hora
/reserva/resumen     resumen de la reserva
/reserva/pago        pago simulado
/reserva/confirmacion  confirmación de la reserva
```

En la **Variante B** del experimento de flujo, `resumen` y `confirmación` se fusionan en una sola pantalla posterior al pago (ver [Experimentación A/B](#experimentación-ab)).

## Arquitectura de estado

- **Datos del flujo de reserva** (espacio, fecha, hora, variante asignada): viven en **URL search params**. Sin `useState` local ni Context para esto.
- **Datos del formulario de pago**: excepción deliberada — estado efímero en memoria (nunca se exponen en la URL, ni siquiera simulados).

## Reglas de negocio (disponibilidad)

- No se permiten fechas pasadas.
- Reservas de más de 6 horas se computan y cobran como día completo.
- Se valida contra horarios ya ocupados en el mock.
- **Explícitamente fuera de alcance:** bloqueo de disponibilidad cross-user (no hay backend que lo sostenga).

## Experimentación A/B

Asignación vía cookie de sesión (`variant`, sin `maxAge`), persistente durante la sesión del usuario:

| Variante | Layout landing | Flujo |
|---|---|---|
| Base (50%) | Grid | 4 pasos independientes (fecha → resumen → pago → confirmación) |
| A (25%) | Lista | 4 pasos independientes (igual que Base, cambia solo el layout) |
| B (25%) | Grid | 3 pasos (fecha → pago → resumen+confirmación fusionados) |

## Diseño visual

Minimalista y fluido: tipografía y espaciado interpolan continuamente con el viewport vía `clamp()` (tokens `text-fluid-*`/`spacing-fluid-*` en `app/globals.css`), en vez de saltar por breakpoints fijos. El grid del catálogo usa `grid-template-columns: repeat(auto-fit, minmax(...))` por la misma razón — reflow continuo de 1 a 4 columnas según el ancho disponible.

- Paleta monocromática (negro/blanco/zinc) con **light + dark mode automático** vía `prefers-color-scheme`.
- `components/Container.tsx` centraliza ancho máximo + padding fluido; clases compartidas (`.field`, `.card`, `.btn-primary`) en `@layer components` evitan repetir estilos entre páginas.
- Accesibilidad: focus ring visible (`focus-visible:ring-2`) en todos los controles, `aria-label` con la fecha completa en cada día del date picker, navegación por teclado completa en el calendario (flechas, Enter/Espacio, Escape).

## Navegación del flujo

- `ReservaStepper` muestra en qué paso se está — 4 pasos en Base/A, 3 en B (sin "Resumen") — y los pasos ya completados son links que preservan la reserva en curso.
- "Inicio" es siempre el primer ítem del stepper (vuelve al catálogo desde cualquier paso), y el nombre del sitio en el header global cumple la misma función en toda la app, no solo dentro del flujo de reserva.

## Geo-targeting

Detección de locale del navegador (`Accept-Language`, región prioritaria sobre idioma) → mercado:

| Mercado | Moneda |
|---|---|
| LATAM | CLP |
| US | USD |
| EU | EUR |

Fallback si el locale no matchea ningún mercado soportado: **USD**. El copy diferenciado por región es **mecánico únicamente** (formato de fecha y moneda vía `Intl`), sin copy editorial distinto por mercado.

## Testing

Vitest cubre, en paralelo a cada fase (no al final):

- **Lógica de negocio:** validación de disponibilidad, cálculo de precio (día completo vs. por hora), asignación de variante A/B, mapeo de locale → mercado.
- **Componentes:** render e interacción de cada paso del flujo, incluyendo ambas variantes de layout.

Para verificación visual/E2E en un navegador real (no simulado por jsdom) — flujo completo, ambas variantes, dark mode, responsive — hay un skill de Claude Code en [`.claude/skills/run-cowork-reservation-app/`](./.claude/skills/run-cowork-reservation-app/SKILL.md) que levanta la app y la maneja con Playwright.

## Fuera de alcance (todo el proyecto)

Backend real, librería de componentes/design system, bloqueo de disponibilidad cross-user, pasarela de pago real.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run test     # suite de Vitest
npm run build    # build de producción
```

## Documentación de planificación

El detalle completo de fases, decisiones de arquitectura y marco de colaboración con IA vive en [`plan-macro-app-reservas-coworking.md`](./plan-macro-app-reservas-coworking.md) y [`project-plan-reserva-coworking.md`](./project-plan-reserva-coworking.md).
