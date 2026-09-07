# Checklist de cierre de la Fase 2

Fecha de corte: 2026-09-07. El cierre se ejecutó contra el estado del repositorio y los documentos oficiales locales disponibles.

## Resultado

La Fase 2 queda **técnicamente implementada, pero no cerrada para publicación**. El pipeline, las fuentes, las unidades y las revisiones están registrados. El cierre editorial y la asignación oficial a convocatorias permanecen bloqueados por evidencia pendiente.

| Criterio | Estado | Evidencia |
|---|---|---|
| Fuentes estructuradas e inventario reproducible | Cumplido | 45 fuentes, hashes y 9 `pending_download` |
| Unidades para fuentes nuevas | Cumplido estructuralmente | 28 unidades; 23 `pending_review`, 5 `verified` |
| Revisión factual independiente 6–25 | Cumplido como auditoría | 10 `pass` acotados y 10 `needs_changes` |
| Revisión editorial independiente 6–25 | No aprobado | Las 20 quedaron `needs_changes` |
| Corrección posterior de las 20 preguntas | Pendiente | No se deben alterar respuestas sin resolver los hallazgos documentados |
| Referencias de evidencia en preguntas 6–25 | Pendiente | Conservan procedencia de semilla; falta enlazar unidades como respaldo de respuesta |
| Fichas vigentes posteriores a Resolución 212 | Bloqueado | La Resolución 212 modifica 121, 126 y 127, pero no se incorporaron sus fichas resultantes |
| Aplicabilidad oficial por convocatoria | Bloqueado | Solo está confirmada pertinencia temática de las fichas base |
| Banco público seguro | Cumplido con alcance piloto | 2 preguntas `validated_assisted`; 23 fuera del banco |
| Pruebas y privacidad | Cumplido | 31 pruebas; build y comprobación de `dist` correctos |

## Qué falta para cerrar definitivamente

1. Incorporar las fichas oficiales resultantes de la Resolución 212 para 121, 126 y 127, o un acto posterior que las consolide.
2. Corregir las preguntas 6–25 a partir de los informes factual y editorial.
3. Añadir a cada pregunta corregida una referencia a su unidad de respaldo y racionales específicos para las cuatro opciones.
4. Repetir ambas revisiones independientes sobre las versiones corregidas.
5. Asignar `targetCallIds` únicamente donde la ficha vigente respalde el tema de forma explícita.
6. Marcar la Fase 2 como cerrada solo después de que los pasos anteriores no dejen bloqueos.

## Regla vigente

Hasta completar estos pasos, ninguna pregunta adicional puede pasar a `validated_assisted` y ninguna pregunta debe recibir una convocatoria como si su aplicabilidad estuviera confirmada. `targetCallIds: []` significa “no confirmado”, no “irrelevante”.
