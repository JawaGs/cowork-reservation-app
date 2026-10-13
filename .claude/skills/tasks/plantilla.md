# Tareas: <Nombre de la feature>

| | |
|---|---|
| Estado | borrador |
| Spec | `specs/<slug>/spec.md` (revisión <AAAA-MM-DD>) |
| Diseño | `specs/<slug>/design.md` (revisión <AAAA-MM-DD>) |
| Creado | <AAAA-MM-DD> |

> Estados: `borrador` → `aprobado`. Solo una persona cambia el estado. Cada tarea se marca `[x]` cuando su criterio de terminado se cumple.

## Orden

<!-- Una línea por tarea, en el orden en que se hacen. Indica cuáles dependen de cuáles. -->

1. T-01 — <título>
2. T-02 — <título> (depende de T-01)

## Tareas

### [ ] T-01 — <título>

- **Objetivo:** <qué existe o funciona al terminar, en una frase>
- **Criterios que cierra:** AC-..
- **Archivos:** <rutas, nuevas o modificadas>
- **Tests primero:**
  - `<archivo de test>`: `it("AC-NN: <comportamiento>")`
- **Terminado cuando:** los tests de arriba pasan, y `npm run test`, `npm run lint` y `npm run typecheck` terminan sin errores.

## Cobertura

<!-- Una fila por cada criterio activo de la spec. Ninguno puede faltar. -->

| AC | Tarea que lo cierra |
|---|---|
