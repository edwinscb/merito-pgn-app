# Checklist de cierre de la Fase 2

Fecha de corte: 2026-09-07. El cierre se ejecutó contra el estado del repositorio y los documentos oficiales locales disponibles.

## Resultado

La Fase 2 queda **cerrada para el lote actual**. Se incorporaron las fichas oficiales versión 3 de 121, 126 y 127, se corrigieron las 25 semillas, se completaron los racionales y se ejecutaron revisiones factual y editorial finales independientes. Dieciocho preguntas se promueven; siete permanecen en revisión.

| Criterio | Estado | Evidencia |
|---|---|---|
| Fuentes estructuradas e inventario reproducible | Cumplido | 48 fuentes, hashes y 9 `pending_download` |
| Unidades para fuentes nuevas | Cumplido estructuralmente | 31 unidades; 22 `verified`, 9 `pending_review` |
| Revisión factual final independiente | Cumplido con alcance | `phase2-factual-final.json`; 18 `pass`, 7 `needs_changes` |
| Revisión editorial independiente de las 25 corregidas | Cumplido | `dataset/reports/phase2-editorial-final.json`; 25 resultados `pass` editorial |
| Corrección posterior de las 20 preguntas | Cumplido | Se acotaron contexto, respuestas y explicaciones; 18 pasan, 7 requieren corrección |
| Referencias de evidencia en preguntas 6–25 | Cumplido estructuralmente | Cada pregunta enlaza una unidad de respaldo oficial o conceptual |
| Fichas vigentes posteriores a Resolución 212 | Cumplido | Versiones 3 de 121, 126 y 127 incorporadas con hash y unidades verificadas |
| Aplicabilidad temática por convocatoria | Cumplido con límite | `targetCallIds` asignados solo donde la ficha versión 3 respalda el tema; no implica que el ítem aparezca en el examen |
| Banco público seguro | Cumplido con alcance revisado | 18 preguntas `validated_assisted`; 7 fuera del banco |
| Pruebas y privacidad | Cumplido | 31 pruebas; build y comprobación de `dist` correctos |

## Pendientes posteriores

1. Corregir Q6, Q10 y Q21–Q25 según los hallazgos factuales.
2. Repetir ambas revisiones para esas siete nuevas versiones.
3. Mantenerlas en `needs_review` y fuera del banco hasta superar las reglas de publicación.

## Regla vigente

Solo las preguntas con resultado `pass` factual y editorial, y respaldo A/B vigente, pasan a `validated_assisted`. `targetCallIds` expresa pertinencia temática documentada en la ficha vigente, no garantía de que el ítem aparezca en la prueba.
