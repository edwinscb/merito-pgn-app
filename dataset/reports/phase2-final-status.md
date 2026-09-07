# Estado de cierre de la Fase 2

Fecha de corte: 2026-09-07.

La consolidación documental y editorial de la Fase 2 quedó implementada:

- el inventario contiene 48 fuentes, incluidas las fichas oficiales versión 3
  de las convocatorias 121, 126 y 127, vinculadas a la Resolución 212;
- existen 31 unidades: 9 verificadas y 22 pendientes de revisión;
- las 25 preguntas tienen cuatro racionales, referencias de respaldo y una
  revisión editorial final independiente registrada en
  `phase2-editorial-final.json`;
- `targetCallIds` expresa pertinencia temática documentada en las fichas
  vigentes; no significa que el ítem vaya a aparecer en la prueba;
- el banco público conserva únicamente Q1 y Q4.

El cierre editorial factual del lote corregido todavía no se acredita. Los
informes factuales anteriores revisaron versiones previas de varias preguntas y
no deben reutilizarse como aprobación automática de la versión corregida. Por
esta razón, las otras 23 preguntas permanecen en `needs_review` y no se
promueven a `validated_assisted`.

Para cerrar completamente la fase falta ejecutar una segunda revisión factual
independiente sobre estas versiones exactas, comprobar sus hashes de contenido
y promover solo las que superen ambas pasadas. El pipeline permanece válido y
reproducible mientras tanto.
