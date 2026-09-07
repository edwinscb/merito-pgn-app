# Checklist de cierre de la Fase 2

Fecha de corte: 2026-09-07. El cierre se ejecutó contra el estado del repositorio y los documentos oficiales locales disponibles.

## Resultado

La Fase 2 queda **técnicamente consolidada, pero no cerrada para publicación**. Se incorporaron las fichas oficiales versión 3 de 121, 126 y 127, se corrigieron las 25 semillas, se completaron los racionales y se ejecutó una nueva revisión editorial. El cierre factual final de las versiones corregidas sigue pendiente de una segunda revisión independiente.

| Criterio | Estado | Evidencia |
|---|---|---|
| Fuentes estructuradas e inventario reproducible | Cumplido | 48 fuentes, hashes y 9 `pending_download` |
| Unidades para fuentes nuevas | Cumplido estructuralmente | 31 unidades; 22 `pending_review`, 9 `verified` |
| Revisión factual independiente 6–25 | Cumplido como auditoría | 10 `pass` acotados y 10 `needs_changes` |
| Revisión editorial independiente de las 25 corregidas | Cumplido | `dataset/reports/phase2-editorial-final.json`; 25 resultados `pass` editorial |
| Corrección posterior de las 20 preguntas | Cumplido | Se acotaron contexto, respuestas y explicaciones; todas siguen `needs_review` |
| Referencias de evidencia en preguntas 6–25 | Cumplido estructuralmente | Cada pregunta enlaza una unidad de respaldo oficial o conceptual |
| Fichas vigentes posteriores a Resolución 212 | Cumplido | Versiones 3 de 121, 126 y 127 incorporadas con hash y unidades verificadas |
| Aplicabilidad temática por convocatoria | Cumplido con límite | `targetCallIds` asignados solo donde la ficha versión 3 respalda el tema; no implica que el ítem aparezca en el examen |
| Banco público seguro | Cumplido con alcance piloto | 2 preguntas `validated_assisted`; 23 fuera del banco |
| Pruebas y privacidad | Cumplido | 31 pruebas; build y comprobación de `dist` correctos |

## Qué falta para cerrar definitivamente

1. Ejecutar y registrar una segunda revisión factual independiente sobre las 25 versiones corregidas.
2. Marcar como `validated_assisted` únicamente las preguntas que superen esa revisión factual y la editorial, con fuente A o B vigente cuando corresponda.
3. Mantener las restantes en `needs_review` y fuera del banco público.

## Regla vigente

Hasta completar la revisión factual final, ninguna pregunta adicional puede pasar a `validated_assisted`. `targetCallIds` ahora expresa pertinencia temática documentada en la ficha vigente, no garantía de que el ítem aparezca en la prueba.
