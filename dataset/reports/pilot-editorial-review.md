# Revisión editorial independiente del piloto

- reviewerId: `/root/editorial_review`
- kind: `editorial`
- method: `ai_assisted`
- model: `null` (identificador efectivo del modelo no comprobable en esta sesión)
- reviewedAt: `2026-09-07T03:52:05Z`
- Alcance: exclusivamente `PGN-SEED-0001` a `PGN-SEED-0005`.

Se revisaron directamente enunciados, opciones, claves, explicaciones y racionales en `dataset/content/questions/diagnostic-seed.json`, contrastando su alcance editorial con `dataset/content/source-units.json` y los criterios de `docs/dataset.md`. Los resultados de revisiones incrustadas no se utilizaron como evidencia aprobatoria. No se consultó el informe factual de otro revisor, otros repositorios ni carpetas privadas excluidas. Este informe no certifica vigencia normativa ni autenticidad de los fragmentos: esa comprobación corresponde a la revisión factual independiente.

Identificación de los archivos leídos, SHA-256:

- `diagnostic-seed.json`: `11ccecd54c3e96a9cbe40b592181d5e43f2f65a21a72e83e30e28def0f39a777`.
- `source-units.json`: `64d56ad9497cdeccf18eabca679c47600f26016bae061bfcd8f12590383f3583`.

`pass` significa que la pregunta es editorialmente utilizable como diagnóstico de dificultad 1, aunque admita mejoras. `needs_changes` indica un problema concreto de precisión, justificación o correspondencia con la habilidad declarada que requiere corregir y revisar de nuevo. `fail` se reserva para un defecto que impida recuperar la pregunta conservando su objetivo. Ningún resultado altera por sí solo el estado de publicación.

| ID | Resultado | Razón determinante |
| --- | --- | --- |
| PGN-SEED-0001 | pass | Enunciado comprensible, una respuesta distinguible y cuatro racionales suficientes para nivel inicial. |
| PGN-SEED-0002 | needs_changes | Alcance de la clasificación sin precisar y ausencia de los cuatro racionales. |
| PGN-SEED-0003 | needs_changes | «Gestionar riesgos» deja indeterminada la actuación esperada y no existe un caso de aplicación. |
| PGN-SEED-0004 | pass | Solo B reproduce el conjunto solicitado; racionales diferencian las opciones. |
| PGN-SEED-0005 | needs_changes | El supuesto presenta un conflicto posible, pero los racionales afirman un deber ya configurado. |

## PGN-SEED-0001 — pass

La clave B es la única opción que responde a la ubicación institucional descrita por la unidad `constitution-1991-art-118`. Las cuatro alternativas son categorías institucionales reconocibles; A y C representan confusiones pertinentes para principiantes. Los racionales justifican B y permiten descartar las demás sin contradicciones internas. El enunciado no exige inferir una situación que no presenta.

Mejora opcional: eliminar «principalmente», porque introduce una gradación innecesaria en una pregunta de pertenencia institucional. En C y D puede precisarse la distinción institucional para aportar algo más que la negación de la alternativa. Son mejoras de redacción y enseñanza, no condiciones que impidan identificar una única respuesta en esta versión.

## PGN-SEED-0002 — needs_changes

A es claramente la mejor de las opciones disponibles, pero «funciones misionales generales» no identifica el criterio de agrupación ni la fuente de esa síntesis. La unidad citada `decree-law-262-2000-art-23` se refiere a procuradurías delegadas y enumera además protección y defensa de los derechos humanos. La pregunta no explica cómo esa enumeración se relaciona con los tres frentes de A. Esto es un desajuste de alcance entre pregunta, explicación y referencia; no demuestra por sí solo que A sea falsa.

Los cuatro `rationale` son `null`, y la explicación simplemente repite la clave. B, C y D agrupan funciones de otras áreas estatales y resultan distinguibles, pero no enseñan por qué cada conjunto es inadecuado. En particular, no debe redactarse un racional de C que infiera que la PGN nunca puede ejercer una actividad administrativa mencionada en esa opción: el criterio de descarte debe ser la clasificación misional preguntada.

Revisiones necesarias:

1. Precisar la clasificación y su alcance institucional con respaldo directo; alternativamente, formular la pregunta sobre las categorías de funciones de las procuradurías delegadas de la unidad citada y ajustar la respuesta a ese alcance.
2. Completar los cuatro racionales con la razón específica de selección o descarte.
3. Explicar la relación entre el conjunto seleccionado y el criterio usado, sin presentar una síntesis no identificada como enumeración exhaustiva.

## PGN-SEED-0003 — needs_changes

B es la única alternativa razonable frente a los absolutos «permanentemente», «siempre» y «cualquier». Sin embargo, «gestionar riesgos» puede entenderse como intervenir en su administración operativa, mientras la unidad `pgn-bulletin-107-2026-preventive-scope` habla de vigilancia y advertencia sin intromisión en la gestión. La coletilla «sin coadministrar» reduce la ambigüedad, pero no define qué acción debe escoger o ejecutar el servidor. El racional B habla de vigilancia y advertencia; la explicación vuelve a la expresión más amplia «gestiona riesgos».

Además, `questionType` es `application`, aunque el enunciado solo pide reconocer una regla general: no ofrece una entidad, un riesgo ni una decisión concreta a la que aplicarla. Los racionales de A, C y D son comprensibles, pero sus alternativas son tan extremas que aportan poca capacidad para diagnosticar errores de aplicación.

Revisiones necesarias:

1. Sustituir la expresión ambigua por una actuación precisa coherente con el fragmento usado, por ejemplo vigilancia y advertencia de riesgos dentro de la competencia preventiva; alinear también la explicación.
2. Reclasificar como `conceptual` si se conserva una pregunta de reconocimiento, o incorporar un caso breve con una decisión concreta si se mantiene `application`.
3. Si se convierte en caso, construir distractores plausibles que permitan distinguir advertencia, sustitución de decisiones y actuación disciplinaria por su contenido, sin depender de absolutos evidentes.

## PGN-SEED-0004 — pass

B coincide con el listado presentado en `constitution-1991-art-209`; ninguna otra opción contiene ese conjunto. El formato pide reconocimiento conceptual y coincide con la clasificación `conceptual`. Los cuatro racionales están presentes y vinculan el descarte al listado constitucional; el de B identifica expresamente el artículo y la enumeración. La explicación es breve, pero el racional correcto aporta el fundamento que falta en ella.

Mejoras opcionales: mencionar el artículo 209 en el enunciado para delimitar expresamente el listado; equilibrar la extensión de las opciones, porque B tiene siete elementos y las demás tres o cuatro; sustituir algunos conceptos evidentemente ajenos por confusiones más plausibles. En el racional D conviene atribuir la tensión con publicidad al «secreto» como regla general, evitando sugerir que cada elemento de D contradice por sí mismo ese principio. Estas debilidades reducen discriminación, pero no producen una segunda respuesta ni impiden su uso inicial.

## PGN-SEED-0005 — needs_changes

B es la mejor conducta entre las disponibles, y el caso sí plantea una decisión práctica. No obstante, el enunciado solo afirma un «posible conflicto» entre un «interés personal» y una «decisión oficial». La unidad `law-1437-2011-art-11` describe un interés particular y directo que entra en conflicto; el enunciado no aclara si esa condición se ha identificado o está por evaluarse. El racional A presupone sin matiz el deber de declararse impedido, y el racional B afirma que los artículos exigen declaración y trámite sin ligar esa exigencia a los hechos relevantes. Así, el estudiante recibe una regla más categórica que el supuesto presentado.

A y C son descartables por ocultamiento o informalidad, y D representa una confusión pertinente entre percepción de imparcialidad y procedimiento. Los racionales de C y D son claros; la explicación «con trazabilidad» resulta demasiado genérica para resolver la incertidumbre del supuesto.

Revisiones necesarias:

1. Concretar un caso en el que el servidor deba intervenir y exista un interés particular y directo en conflicto, para que el impedimento sea la respuesta que el caso evalúa; o conservar el carácter posible y formular una respuesta y racionales que distingan informar/evaluar de tramitar un impedimento cuando corresponda.
2. Ajustar los racionales A y B al supuesto elegido y explicar por qué la valoración subjetiva de imparcialidad no resuelve ese caso.
3. Reescribir la explicación para conectar los hechos con la conducta elegida. No introducir plazos o autoridades concretas sin comprobar primero su aplicabilidad factual.

No se modificaron preguntas, claves, metadatos de revisión ni código. Las tres preguntas con `needs_changes` requieren una nueva revisión sobre su versión corregida.
