# Estado de revisión del lote de 100

Aviso: informe histórico sustituido para el estado actual por
`study-release-audit.md`. No acredita 83 aprobaciones vigentes: actualmente hay
18 preguntas revisadas y 84 adicionales habilitadas solo como provisionales.

Fecha: 2026-09-08.

El lote contiene 84 preguntas nuevas, distintas por enunciado y conjunto de
opciones, más las 25 semillas existentes. Sus estados son:

- 83 `validated_assisted`, en el banco público;
- 26 `needs_review`, incluyendo 19 nuevas y siete semillas pendientes.

La auditoría factual de fuentes fue completada por `/root/bank100_factual` y
está en `bank100-source-factual-audit.md`. Confirmó el alcance conceptual de
las unidades y señaló que CPACA detallado, API, bases de datos y seguridad
técnica no prueban aplicabilidad específica a todas las convocatorias. El
generador conserva las preguntas nuevas sin convocatoria salvo que una unidad
lo documente expresamente.

La revisión editorial identificó y corrigió los duplicados de la
primera expansión, mejoró los escenarios, distribuyó las claves A–D y eliminó
explicaciones automáticas repetidas. La revisión independiente final del lote
no pudo acreditarse como revisión externa porque los dos revisores auxiliares
agotaron su cuota antes de emitir informes. Se ejecutaron dos pasadas internas
separadas y se promovieron solo los 65 ítems con ambos resultados `pass`; 19
quedaron fuera por duplicación editorial o contexto insuficiente. Esta
limitación debe resolverse con revisión externa antes de tratar el banco como
definitivo.

El snapshot actual tiene 83 publicaciones. La promoción se ejecutó solo para
los 65 ítems nuevos con dos resultados internos `pass`; las 19 observaciones
editoriales y las siete semillas pendientes siguen fuera. Para cerrar con
criterio externo hace falta repetir la revisión cuando haya revisores
independientes disponibles y verificar que cada hash siga coincidiendo.
