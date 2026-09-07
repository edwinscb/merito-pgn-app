# Revisión editorial independiente de las preguntas 6–25

- `reviewerId`: `/root/editorial_q6_25`
- `kind`: `editorial`
- `method`: `ai_assisted`
- `model`: `null` (no se afirma un identificador de modelo no comprobable en esta sesión)
- `reviewedAt`: `2026-09-07T00:00:00-05:00`
- Alcance: preguntas `PGN-SEED-0006` a `PGN-SEED-0025`.

Se revisaron directamente los enunciados, las cuatro opciones, la clave, la explicación, el tipo declarado y las referencias de procedencia en `dataset/content/questions/diagnostic-seed.json`. No se modificaron JSON, código ni estados editoriales. No se utilizó el informe factual de otro revisor y este documento no certifica vigencia normativa, suficiencia de la fuente ni aplicabilidad a una convocatoria; esas cuestiones requieren una revisión factual independiente.

## Resultado resumido

`needs_changes` indica que la pregunta puede conservar su objetivo, pero necesita correcciones antes de una futura aprobación. En esta revisión ninguna pregunta queda editorialmente lista para `validated_assisted`. La razón transversal es que las preguntas 6–25 tienen los cuatro racionales en `null`; además, varias requieren ajustar el tipo de pregunta, concretar el caso o reducir afirmaciones demasiado generales.

| ID | Resultado | Razón editorial determinante |
| --- | --- | --- |
| PGN-SEED-0006 | needs_changes | El enunciado de aplicación es abstracto, «primera evaluación» y «contenido» no delimitan el criterio; faltan los cuatro racionales. |
| PGN-SEED-0007 | needs_changes | La solución C es distinguible, pero «suele» y las alternativas requieren condiciones de acceso parcial; faltan racionales y un caso más concreto. |
| PGN-SEED-0008 | needs_changes | B es la mejor opción, aunque el enunciado es general y la pregunta de aplicación no presenta contexto; faltan racionales. |
| PGN-SEED-0009 | needs_changes | Reconocimiento conceptual claro, pero faltan racionales que diferencien las cuatro fases. |
| PGN-SEED-0010 | needs_changes | La planeación es la intención evaluada, pero «debería comenzar» no precisa el momento ni el alcance de estudios previos; faltan racionales. |
| PGN-SEED-0011 | needs_changes | La lista es plausible, pero se presenta como definición completa de indicador sin precisar marco; faltan racionales y fuente editorial visible. |
| PGN-SEED-0012 | needs_changes | Única mejor respuesta y concepto claro, pero faltan racionales; conviene evitar que «alta correlación» se lea como garantía de asociación sustantiva. |
| PGN-SEED-0013 | needs_changes | El caso identifica bien el sesgo de selección, pero faltan racionales y puede explicitarse que la muestra excluye abandonos o fallos. |
| PGN-SEED-0014 | needs_changes | Pregunta conceptual clara, con distractores distinguibles; faltan racionales y el alcance descriptivo puede expresarse con mayor precisión. |
| PGN-SEED-0015 | needs_changes | B es correcta en términos generales, pero «ayuda a mantener» puede confundirse con otras restricciones; faltan racionales y conviene mencionar la relación clave primaria/foránea. |
| PGN-SEED-0016 | needs_changes | Evalúa atomicidad de forma clara, pero «debe revertirse» no aplica a toda operación que no sea transaccional; faltan racionales y contexto técnico mínimo. |
| PGN-SEED-0017 | needs_changes | La parte espacial del mínimo privilegio es clara, pero «durante el tiempo necesario» agrega una condición temporal que no siempre forma parte de la definición; faltan racionales. |
| PGN-SEED-0018 | needs_changes | B es la mejor práctica entre las opciones, pero «reduce mejor» depende del contexto y no distingue almacenamiento, acceso, rotación y revocación; faltan racionales. |
| PGN-SEED-0019 | needs_changes | El objetivo es identificable, pero versionado, compatibilidad y pruebas de consumidores mezclan prácticas que requieren contexto de cambio; faltan racionales. |
| PGN-SEED-0020 | needs_changes | «Primera actuación» ante cualquier alerta de alta severidad es demasiado amplia y la secuencia validación/preservación/activación puede variar; faltan racionales y caso. |
| PGN-SEED-0021 | needs_changes | B es una respuesta razonable, pero «mejor» depende de autoridad, riesgos y restricciones no descritas; faltan racionales y contexto de rol. |
| PGN-SEED-0022 | needs_changes | La conducta C es editorialmente preferible, pero la corrección puede requerir un canal o procedimiento concreto; faltan racionales y un caso con impacto definido. |
| PGN-SEED-0023 | needs_changes | B es la mejor alternativa, aunque «control obligatorio» y «alternativa lícita» quedan sin contexto; faltan racionales y debe evitarse presentar el escalamiento como universalmente idéntico. |
| PGN-SEED-0024 | needs_changes | El principio de integridad analítica es claro, pero el enunciado no indica si el resultado fue auditado ni qué límite se debe comunicar; faltan racionales. |
| PGN-SEED-0025 | needs_changes | B reúne buenas prácticas, pero el listado es amplio y «conviene» no define una decisión observable; faltan racionales y una situación de innovación pública. |

## Observaciones por pregunta

### PGN-SEED-0006 — needs_changes

B es la única respuesta razonable, pero el enunciado combina competencia, contenido, términos y reserva como si siempre fueran una única lista de revisión inicial. «Contenido» no indica si se refiere a claridad, alcance o materia de la solicitud. `questionType: application` tampoco está respaldado por un caso: no hay solicitud, entidad competente ni información concreta. Debe añadirse una situación breve o cambiarse a `conceptual`; luego completar los cuatro racionales explicando por qué A, C y D no son criterios de trámite.

### PGN-SEED-0007 — needs_changes

C es la mejor respuesta y los distractores son fáciles de descartar. Sin embargo, «suele ser» deja abierta la regla y «anonimización» no es sinónimo automático de acceso parcial: depende de la naturaleza de los datos y de la decisión motivada. Conviene formular un caso con datos personales separables y exigir versión pública o acceso parcial cuando sea jurídicamente procedente. Deben completarse los racionales de las cuatro opciones.

### PGN-SEED-0008 — needs_changes

B es clara y las otras opciones describen malas prácticas inequívocas. La pregunta se declara de aplicación, pero no ofrece expediente, sistema ni decisión concreta. Puede mantenerse como conceptual o incorporar un escenario documental. Los racionales deben distinguir clasificación, metadatos, trazabilidad y retención, y explicar por qué las demás alternativas comprometen control o recuperación.

### PGN-SEED-0009 — needs_changes

La pregunta conceptual tiene una única mejor respuesta: C. El enunciado ya contiene la operación de comparar indicadores con metas, por lo que no necesita un caso. La corrección necesaria es completar racionales que distingan planear, hacer, verificar y actuar; no basta repetir que C es correcta.

### PGN-SEED-0010 — needs_changes

B expresa la planeación previa a la contratación, pero «comenzar por» puede confundirse con una secuencia jurídica exhaustiva. La opción mezcla definición de necesidad, alcance, alternativas, riesgos y estudios previos sin precisar que el detalle depende del proceso. Debe ajustarse el alcance y completar racionales evitando presentar una lista parcial como regla absoluta.

### PGN-SEED-0011 — needs_changes

B es la única opción semánticamente pertinente, pero la frase «debe conectar correctamente» no indica si se evalúa una ficha técnica, un indicador de gestión o un marco específico. La lista puede ser útil como diagnóstico, no como definición universal. Deben completarse los racionales y aclararse el producto que se espera reconocer.

### PGN-SEED-0012 — needs_changes

La clave B es inequívoca y la pregunta conceptual está bien enfocada. Aun así, «permite concluir que existe asociación» debe entenderse como asociación estadística observada, no como ausencia de sesgo ni relación causal. Completar racionales, especialmente para explicar que correlación no prueba causalidad, identidad ni ausencia de sesgo.

### PGN-SEED-0013 — needs_changes

El caso sí justifica `technical_analysis`: seleccionar solo usuarios que completaron el trámite excluye sistemáticamente otros resultados. B es la única respuesta pertinente. Falta explicar en los racionales cómo A, C y D no describen el problema y puede añadirse que la satisfacción estimada no representa necesariamente a quienes abandonaron o fallaron.

### PGN-SEED-0014 — needs_changes

A es la única respuesta compatible con análisis descriptivo. Los distractores son muy heterogéneos y fáciles, pero no generan ambigüedad. Completar los racionales y, si se busca mayor valor diagnóstico, contrastar descripción de datos observados con predicción, decisión normativa y seguridad informática sin sugerir que toda descripción responde solo «qué ocurrió».

### PGN-SEED-0015 — needs_changes

B es correcta como función general de una clave foránea. El verbo «ayuda» es prudente, pero la opción podría ser más precisa: una restricción de clave foránea mantiene referencias válidas entre una columna hija y una clave referenciada; no reemplaza respaldo, cifrado o compresión. Completar racionales y agregar esa precisión a la explicación.

### PGN-SEED-0016 — needs_changes

A evalúa correctamente atomicidad. El enunciado debe acotarse a una transacción que usa semántica transaccional; de lo contrario «debe revertirse» puede leerse como propiedad universal de cualquier conjunto de operaciones. Completar racionales y diferenciar atomicidad de latencia, disponibilidad y compresión.

### PGN-SEED-0017 — needs_changes

B es la mejor opción, pero incorpora simultáneamente mínimo alcance y duración temporal. La definición central es otorgar solo los permisos necesarios para la tarea; la limitación temporal puede ser una medida adicional, no necesariamente parte de toda definición. Debe eliminarse o contextualizarse la frase temporal y completarse los racionales.

### PGN-SEED-0018 — needs_changes

B es claramente superior a codificar o esconder secretos, pero «mejor» requiere contexto y el control descrito no cubre por sí solo rotación, revocación ni auditoría. Conviene presentar un escenario de aplicación y pedir la práctica base: almacén de secretos con identidad de mínimo privilegio. Completar racionales para explicar que Base64 y renombrar variables no son controles de confidencialidad.

### PGN-SEED-0019 — needs_changes

B resume una práctica razonable para evolución de APIs. La pregunta debe indicar si existe un cambio incompatible y qué consumidores están afectados; de lo contrario versionar no siempre es necesario. «Probar consumidores» también requiere definir si se trata de pruebas de integración o de contrato. Completar racionales y ajustar la explicación al escenario escogido.

### PGN-SEED-0020 — needs_changes

La formulación general presenta un problema de secuencia: ante una alerta, validar, preservar evidencia, contener y activar respuesta pueden ordenarse de manera distinta según el incidente y el riesgo inmediato. En particular, no debe enseñarse que siempre se valida antes de toda contención. Debe reemplazarse por un caso delimitado —por ejemplo, incidente confirmado de ransomware— y describir la prioridad compatible con el procedimiento aplicable. Completar racionales.

### PGN-SEED-0021 — needs_changes

B representa una conducta organizacional razonable, pero «la mejor» depende del impacto, urgencia, autoridad del responsable y posibilidad de renegociar plazos. Añadir un rol y un canal de decisión haría observable la competencia evaluada. Completar racionales sin convertir la priorización en una fórmula universal.

### PGN-SEED-0022 — needs_changes

C promueve transparencia y trazabilidad, pero el enunciado no establece el impacto del error ni el procedimiento de corrección. «Corregir» puede significar emitir una nueva versión, notificar destinatarios o activar control de cambios. Añadir contexto mínimo y completar racionales; B debe explicar por qué modificar silenciosamente el original destruye trazabilidad.

### PGN-SEED-0023 — needs_changes

B es la mejor alternativa entre las ofrecidas. No obstante, un «control obligatorio» puede ser legal, contractual o interno, y la alternativa lícita dependerá de la situación. Debe aclararse que la orden no autoriza omitir un requisito obligatorio y que el escalamiento sigue el canal institucional aplicable. Completar racionales y evitar que «abandonar la tarea» sea el único contraste de C.

### PGN-SEED-0024 — needs_changes

B evalúa integridad y pensamiento crítico de forma clara. Conviene añadir que la revisión de calidad y método debe hacerse sin manipular datos ni excluir observaciones sin criterio documentado. Completar racionales y precisar qué límites se comunican: cobertura, incertidumbre, sesgo o calidad de datos según el caso.

### PGN-SEED-0025 — needs_changes

B es la única alternativa que contempla problema, usuarios, restricciones, riesgos, indicadores y prueba controlada. La lista es amplia y la pregunta no define una decisión concreta ni el contexto del proceso público. Puede mantenerse como diagnóstico de innovación responsable si se completa el caso y se explican los cuatro distractores; de lo contrario conviene cambiar el tipo a conceptual.

## Correcciones requeridas antes de una nueva revisión

1. Completar los cuatro racionales de cada pregunta, con una razón específica para la clave y para cada distractor.
2. Añadir referencias estructuradas de respaldo cuando la pregunta deje de ser solo semilla; la referencia de procedencia no sustituye evidencia factual.
3. Cambiar a `conceptual` las preguntas que solo reconocen una regla o incorporar un caso realista cuando se conserve `application` o `behavioral`.
4. Revisar especialmente las formulaciones absolutas o dependientes del contexto en 10, 17, 18, 19 y 20.
5. Mantener todas las preguntas en `needs_review` hasta que exista una revisión factual independiente, se corrijan los hallazgos y se repita esta revisión editorial.

