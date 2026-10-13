# Diseño: <Nombre de la feature>

| | |
|---|---|
| Estado | borrador |
| Spec | `specs/<slug>/spec.md` (revisión <AAAA-MM-DD>) |
| Creado | <AAAA-MM-DD> |
| Última revisión | <AAAA-MM-DD> |

> Estados: `borrador` → `aprobado`. Solo una persona cambia el estado.

## 1. Resumen

<!-- 3 a 5 frases: cómo se construye la feature y qué pieza nueva aparece. Un lector tiene que entender la forma de la solución antes de ver el detalle. -->

## 2. Restricciones aplicadas

<!-- Una línea por restricción, con su origen: spec §3, documentos vinculantes, AGENTS.md, guías de Next leídas. -->

-

### Guías de Next consultadas

<!-- Ruta dentro de node_modules/next/dist/docs/ y qué se confirmó en cada una. -->

-

## 3. Archivos

| Archivo | Nuevo o modificado | Responsabilidad en una frase |
|---|---|---|

## 4. Componentes y módulos

<!--
Una subsección por pieza nueva o modificada. Solo firmas, nunca cuerpos.
Para componentes: si es de servidor o de cliente y por qué.
-->

### <Nombre>

- Tipo: <componente de servidor | componente de cliente | función pura | route handler>
- Firma:

```ts
```

- Qué decide o calcula:
- Criterios que sostiene: AC-..

## 5. Estado

<!-- Cada dato que cambia mientras la feature está en pantalla. Una sola fuente de verdad por dato. -->

| Dato | Dónde vive | Quién lo escribe | Quién lo lee | Por qué ahí |
|---|---|---|---|---|

## 6. Flujo de datos

<!-- Qué dispara cada petición, cómo se descartan las obsoletas, cómo se traducen los errores a estados de la spec. Un diagrama de secuencia en texto basta. -->

## 7. Accesibilidad y foco

<!-- Cómo se cumple cada fila de §7 de la spec: qué elemento recibe foco, cómo se mueve, qué región anuncia qué. Incluye aquí lo que la spec dejó abierto a propósito. -->

## 8. Pruebas

### Herramientas

<!-- Con qué se simulan red, tiempo y navegación en los tests. Si hace falta una dependencia nueva, va también en §9. -->

### Cobertura

<!-- Una fila por cada criterio activo de la spec. Ninguno puede faltar. -->

| AC | Nivel | Archivo de test | Qué se simula |
|---|---|---|---|

## 9. Decisiones

<!-- Solo las que tienen una alternativa razonable. -->

| # | Decisión | Alternativa descartada | Por qué |
|---|---|---|---|

## 10. Riesgos

<!-- Lo que puede salir mal durante la implementación y cómo se detectaría antes. -->

-

## 11. Registro de cambios

| Fecha | Cambio |
|---|---|
| <AAAA-MM-DD> | Versión inicial |
