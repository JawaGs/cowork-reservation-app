@AGENTS.md

# Desarrollo guiado por specs

## Decisiones vinculantes

Estos documentos fijan la arquitectura, el alcance y las reglas de colaboración del proyecto. Léelos antes de especificar o diseñar cualquier cosa:

- `plan-macro-app-reservas-coworking.md`
- `project-plan-reserva-coworking.md`

Una spec aprobada puede cambiar una de esas decisiones solo si lo declara en su sección "Enmendadas". Nunca en silencio.

## Flujo

- Una feature nueva o un cambio de comportamiento pasa por tres documentos en `specs/<slug>/`, cada uno aprobado antes de empezar el siguiente:
  1. `/spec` escribe `spec.md`: qué tiene que pasar. Se aprueba con Estado `aprobada`.
  2. `/design` escribe `design.md`: cómo se construye. Se aprueba con Estado `aprobado`.
  3. `/tasks` escribe `tasks.md`: en qué orden. Se aprueba con Estado `aprobado`.
- No se escribe código de una feature hasta que los tres estén aprobados. Solo una persona cambia esos estados.
- Con los tres aprobados, `/build <slug> <T-NN>` implementa una tarea por vez, con tests primero. `/verify <slug>` comprueba la feature terminada contra la spec; si cumple, la persona pasa la spec a `implementada`.
- Los criterios de aceptación se identifican como `AC-NN`. Cada test que cubre un criterio lleva su ID al inicio del título: `it("AC-03: ...")`.
- Si durante la implementación el comportamiento tiene que ser distinto al de la spec, primero se cambia la spec con `/spec`, después el diseño y las tareas afectadas, y al final el código.
- No pasan por spec: correcciones de texto, estilos sin cambio de comportamiento, dependencias, y arreglos de bugs en código anterior a este flujo, que llevan su test de regresión.
- El código anterior a este flujo no tiene spec y no se le escribe una retroactiva.

## Comprobaciones

```bash
npm run test       # Vitest
npm run lint       # ESLint
npm run typecheck  # tipos, con los tipos de rutas de Next generados
node scripts/spec-trace.mjs <slug>   # cada criterio de la spec tiene un test que pasa
```
