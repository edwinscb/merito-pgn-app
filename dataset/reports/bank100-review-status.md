# Estado de revisión del lote de 100

Fecha: 2026-09-08.

El lote contiene 84 preguntas nuevas, distintas por enunciado y conjunto de
opciones, más las 25 semillas existentes. Sus estados son:

- 18 `validated_assisted`, en el banco público;
- 91 `needs_review`, incluyendo las 84 nuevas y siete semillas pendientes.

La auditoría factual de fuentes fue completada por `/root/bank100_factual` y
está en `bank100-source-factual-audit.md`. Confirmó el alcance conceptual de
las unidades y señaló que CPACA detallado, API, bases de datos y seguridad
técnica no prueban aplicabilidad específica a todas las convocatorias. El
generador conserva las preguntas nuevas sin convocatoria salvo que una unidad
lo documente expresamente.

La revisión editorial preliminar identificó y corrigió los duplicados de la
primera expansión, mejoró los escenarios, distribuyó las claves A–D y eliminó
explicaciones automáticas repetidas. La revisión independiente final del lote
no pudo completarse en esta ejecución porque los dos revisores auxiliares
agotaron su cuota antes de emitir los informes hashados. Por esa razón ninguna
pregunta nueva se promovió a `validated_assisted`.

El siguiente paso reproducible es ejecutar las revisiones finales sobre el
snapshot actual y promover únicamente los registros cuyo hash coincida y cuyo
resultado factual y editorial sea `pass`.
