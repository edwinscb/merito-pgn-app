# Revisión factual independiente de PGN-SEED-0006 a PGN-SEED-0025

Fecha del informe: 2026-09-07.

Revisor: subagente con identidad de tarea `/root/factual_q6_25`. Método: revisión factual asistida por IA, independiente de la revisión editorial y de las revisiones históricas del registro. Este informe no modifica preguntas, estados, fuentes ni unidades y no constituye aprobación humana ni autorización para publicar.

## Alcance y límites

Se leyeron las veinte preguntas actuales, sus claves, explicaciones y referencias declaradas, además de las unidades y fuentes estructuradas asociadas. Las referencias `pgn-initial-diagnostic` se trataron únicamente como procedencia de la semilla: no son respaldo factual oficial. La comprobación se concentró en si el enunciado, la clave y la explicación están respaldados por la unidad indicada y en qué límites deben conservarse.

Las unidades nuevas están en `pending_review`; por ello, incluso un resultado factual `pass` significa solamente que el contenido resumido coincide con el alcance conceptual de la fuente examinada. No significa que la pregunta esté editorialmente aprobada, que tenga racionales completos, que sea aplicable a una convocatoria o que pueda pasar al banco público. Todas las preguntas permanecen `needs_review`.

Las fuentes técnicas extranjeras o de otras administraciones se usan como referencias conceptuales, no como normas colombianas ni como temario de la PGN. Las normas y guías institucionales pueden requerir una comprobación posterior de vigencia consolidada. Ninguna pregunta recibe una convocatoria por inferencia temática.

## Resultado resumido

| Pregunta | Resultado factual | Clave examinada | Unidad principal | Hallazgo principal |
| --- | --- | --- | --- | --- |
| PGN-SEED-0006 | needs_changes | B | `law-1755-2015-review-unit` | La unidad respalda competencia, contenido y términos, pero no desarrolla reserva de información. |
| PGN-SEED-0007 | pass | C | `law-1712-2014-review-unit` | El acceso parcial y la versión pública están expresamente cubiertos. |
| PGN-SEED-0008 | pass | B | `decree-1080-2015-archives-review-unit` | Clasificación, metadatos, control y disposición respaldan la opción. |
| PGN-SEED-0009 | pass | C | `minvivienda-phva-methodology-review-unit` | La etapa Verificar contrasta ejecución, metas e indicadores. |
| PGN-SEED-0010 | pass | B | `law-80-1993-review-unit` | La planeación y los estudios preceden la selección/contratación, con límite de régimen y reformas. |
| PGN-SEED-0011 | pass | B | `funcion-publica-indicators-review-unit` | La unidad contiene objetivo, fórmula, fuente, periodicidad, meta y responsable. |
| PGN-SEED-0012 | pass | B | `nist-correlation-review-unit` | La correlación no basta para establecer causalidad. |
| PGN-SEED-0013 | pass | B | `cdc-data-analysis-review-unit` | La exclusión sistemática de casos puede producir sesgo de selección. |
| PGN-SEED-0014 | pass | A | `cdc-data-analysis-review-unit` | El análisis descriptivo resume lo observado y su distribución. |
| PGN-SEED-0015 | pass | B | `missouri-db-integrity-review-unit` | La integridad referencial mantiene relaciones válidas y evita huérfanos. |
| PGN-SEED-0016 | pass | A | `nist-acid-review-unit` | Atomicidad describe la operación todo-o-nada. |
| PGN-SEED-0017 | needs_changes | B | `nist-least-privilege-review-unit` | La unidad no respalda la dimensión temporal incluida en la opción y explicación. |
| PGN-SEED-0018 | pass | B | `ncsc-cloud-security-review-unit` | Almacén de secretos y controles de identidad responden al riesgo planteado. |
| PGN-SEED-0019 | pass | B | `homeoffice-api-review-unit` | Versionado, contrato/documentación y pruebas están cubiertos. |
| PGN-SEED-0020 | needs_changes | B | `cisa-ransomware-review-unit` | La secuencia “primera actuación: validar” es demasiado rígida frente a contención urgente. |
| PGN-SEED-0021 | needs_changes | B | `decreto-815-2018-review-unit` | La fuente respalda criterios objetivos y comunicación, pero no una regla completa de priorización. |
| PGN-SEED-0022 | needs_changes | C | `codigo-integridad-review-unit` | El principio de honestidad respalda informar, pero no todas las etapas de corrección/trazabilidad. |
| PGN-SEED-0023 | needs_changes | B | `law-1952-2019-review-unit` | El deber de legalidad está cubierto; alternativa lícita y escalamiento requieren soporte adicional. |
| PGN-SEED-0024 | needs_changes | B | `cdc-data-analysis-review-unit` | La revisión metodológica está respaldada, pero la conducta prescriptiva excede la unidad. |
| PGN-SEED-0025 | needs_changes | B | `dnp-public-innovation-review-unit` | Problema, usuarios y piloto están cubiertos; riesgos e indicadores no son requisitos universales en la unidad. |

## Revisión individual

### PGN-SEED-0006 — needs_changes

La opción B es razonable para una evaluación inicial de una petición: la unidad de la Ley 1755 cubre contenido/modalidad, autoridad competente, traslado cuando corresponda y términos según la modalidad. Sin embargo, la pregunta añade “eventual reserva de la información” y la unidad `law-1755-2015-review-unit` no contiene el régimen de reserva ni remite a una unidad de transparencia. La explicación también afirma “reserva” sin respaldo declarado. Debe incorporarse una unidad oficial que cubra reserva/acceso, o retirar esa parte del enunciado y de la explicación. La respuesta no debe convertir “primera evaluación” en un orden jurídico universal para toda clase de petición. La aplicabilidad a una convocatoria sigue sin estar confirmada.

### PGN-SEED-0007 — pass

La opción C coincide con la unidad `law-1712-2014-review-unit`: cuando un documento mezcla información pública y exceptuada, procede separar la protegida, facilitar versión pública cuando sea posible y motivar la restricción. “Suele ser” evita presentarlo como resultado automático en todos los expedientes. La unidad es suficiente para la clave y la explicación conceptual. Debe conservarse la distinción entre acceso parcial y anonimización concreta: la fuente respalda la separación/versión pública, pero no cualquier técnica de anonimización para cualquier dato. Requiere racionales individuales y referencia factual explícita antes de una eventual aprobación.

### PGN-SEED-0008 — pass

La opción B está respaldada por `decree-1080-2015-archives-review-unit`, que resume clasificación, registro/metadatos, control/seguimiento y disposición mediante instrumentos archivísticos. La pregunta formula una práctica que fortalece la gestión documental, no una lista exhaustiva ni una obligación independiente de cada elemento en todos los casos. La fuente advierte que deben verificarse reformas antes de publicar una pregunta normativa; el resultado factual queda limitado a ese concepto. No se encontró soporte para afirmar que la opción garantiza por sí sola autenticidad o recuperación en toda circunstancia; la explicación debe mantenerse como efecto esperado, no como garantía absoluta.

### PGN-SEED-0009 — pass

La opción C corresponde directamente a `minvivienda-phva-methodology-review-unit`: Verificar contrasta lo ejecutado con lo planeado y las metas mediante indicadores, mientras Actuar orienta ajustes. La clave y la explicación no dependen de una convocatoria concreta. La fuente es una guía institucional conceptual de 2019, por lo que no debe presentarse como reglamento exclusivo de la PGN ni como definición legal inmutable. El localizador debe conservar la página indicada y la pregunta debe seguir siendo conceptual.

### PGN-SEED-0010 — pass

La opción B coincide con `law-80-1993-review-unit`: la planeación exige analizar conveniencia/necesidad y elaborar estudios antes de iniciar la selección o celebrar el contrato, según el procedimiento. “Necesidad tecnológica” no altera el principio general de planeación. La unidad advierte que deben revisarse reformas y régimen especial; por ello no se debe convertir la lista “alternativas, riesgos y estudios previos” en una transcripción completa del artículo 25 ni afirmar que todos los elementos tienen idéntico tratamiento en todo procedimiento. La clave es factual como principio introductorio, no como asesoría exhaustiva de contratación.

### PGN-SEED-0011 — pass

La opción B está cubierta por `funcion-publica-indicators-review-unit`, que enumera objetivo, línea base, fórmula, unidad de medida, fuente, periodicidad, meta y responsable. La pregunta pide los elementos centrales y no afirma que sea la única ficha válida. La unidad señala que no es una ficha oficial exclusiva de la PGN; el resultado no acredita un estándar de convocatoria ni una obligación jurídica universal. La explicación “controlable” es una inferencia razonable, pero conviene sostenerla como utilidad de seguimiento y añadir una referencia factual directa antes de publicación.

### PGN-SEED-0012 — pass

La opción B reproduce el alcance de `nist-correlation-review-unit`: una correlación alta describe asociación y no demuestra por sí sola causalidad; se requiere diseño, contexto y evidencia adicional. Los distractores no introducen una afirmación que cambie la clave. La unidad es conceptual y técnica, no normativa colombiana. Debe evitarse agregar en la explicación que todo análisis correlacional carece de sesgo: la pregunta no lo afirma y la fuente no lo permite.

### PGN-SEED-0013 — pass

La selección exclusiva de usuarios que completaron exitosamente el trámite puede excluir sistemáticamente a quienes abandonaron, fallaron o no pudieron usar el canal. Esto coincide con `cdc-data-analysis-review-unit`, que describe el sesgo producido por exclusiones sistemáticas de participantes. La clave B es adecuada y la explicación identifica correctamente el mecanismo. Es una analogía de análisis de datos, no una conclusión sobre la satisfacción real ni una regla de diseño muestral completa. La fuente no prescribe una corrección específica; no debe añadirse una sin respaldo.

### PGN-SEED-0014 — pass

La opción A coincide con el alcance resumido por `cdc-data-analysis-review-unit`: el análisis descriptivo resume lo observado y sus distribuciones. Las opciones B, C y D pertenecen a predicción, decisión jurídica o seguridad, no a la definición presentada. La explicación delimita correctamente que descripción no garantiza predicción ni causalidad. La unidad es material conceptual; no debe interpretarse como una taxonomía oficial exclusiva ni como prueba de que todo análisis descriptivo carece de inferencia posterior.

### PGN-SEED-0015 — pass

`missouri-db-integrity-review-unit` respalda que las claves/restricciones referenciales mantienen relaciones válidas entre registros y evitan referencias huérfanas. La opción B es la única que describe esa función. La fuente es una guía técnica gubernamental histórica y no una obligación normativa colombiana; la pregunta debe conservarse como concepto de bases de datos y no como requisito de una tecnología concreta. La explicación no debe extenderse a cifrado, compresión o copias de seguridad, que son distractores y no funciones de una clave foránea.

### PGN-SEED-0016 — pass

La definición de atomicidad en `nist-acid-review-unit` corresponde a la opción A: la transacción se trata como todo-o-nada y el conjunto se completa o se revierte. El enunciado plantea el fallo de una operación crítica intermedia como motivo de reversión; esto es consistente con el concepto, aunque una implementación concreta puede tener políticas de recuperación y compensación diferentes. La unidad expresa esa limitación. No debe leerse como afirmación de que todo sistema revierte automáticamente cualquier efecto externo fuera de la transacción.

### PGN-SEED-0017 — needs_changes

La opción B contiene “solo los permisos necesarios”, que sí coincide con `nist-least-privilege-review-unit`. La frase “durante el tiempo necesario” y la explicación temporal, sin embargo, exceden la definición incorporada: la unidad dice expresamente que no impone por sí sola duración temporal ni una tecnología de control. Debe retirarse la dimensión temporal o añadirse una fuente que respalde acceso temporal/just-in-time. La pregunta no debe presentar mínimo privilegio como acceso administrativo excepcional ni como garantía de seguridad completa.

### PGN-SEED-0018 — pass

La opción B coincide con `ncsc-cloud-security-review-unit`: utilizar las capacidades de un almacén de secretos y limitar las identidades de servicio mediante controles de acceso. Las otras opciones son ofuscación, ocultamiento nominal o documentación, no gestión de secretos. La fuente es guía oficial extranjera; respalda un control técnico conceptual, no una política específica de la PGN ni una obligación colombiana. La explicación es correcta si se mantiene acotada a no incluir secretos en código/historial; el almacén no elimina por sí solo el riesgo y requiere control de acceso, rotación y monitoreo conforme al diseño institucional.

### PGN-SEED-0019 — pass

`homeoffice-api-review-unit` cubre versionado, documentación del contrato y pruebas de integraciones, errores y respuestas. La opción B traduce adecuadamente esas prácticas al caso de una API consumida por varios sistemas. La unidad no prescribe una estrategia concreta de versionado, por lo que la pregunta no debe exigir URL versionada, semver u otra técnica no incluida. “Probar consumidores” debe entenderse como comprobar integraciones/compatibilidad, no como una afirmación de que la fuente exige una metodología particular de pruebas. Es guía técnica extranjera, no estándar PGN.

### PGN-SEED-0020 — needs_changes

La fuente `cisa-ransomware-review-unit` respalda determinar impacto, aislar sistemas cuando sea posible, preservar evidencia volátil y activar el procedimiento. La formulación actual afirma que la “primera actuación” es validar, preservar y activar en ese orden. En un incidente de alta severidad, contención urgente puede ser simultánea o prioritaria según el plan; CISA no permite una regla universal que retrase el aislamiento hasta completar una validación. Debe concretarse el escenario, por ejemplo ransomware, y formular una respuesta coordinada que preserve evidencia y contemple contención/activación conforme al procedimiento institucional. No debe decirse “validar siempre antes de aislar”.

### PGN-SEED-0021 — needs_changes

La unidad `decreto-815-2018-review-unit` respalda analizar información válida, usar criterios objetivos, diferenciar decisiones y comunicar al responsable. Eso apoya la parte de evaluar y proponer prioridades, pero no establece una regla oficial completa de “impacto y urgencia” ni exige siempre dejar acuerdos documentados. La opción B es una buena conducta de gestión, pero debe presentarse como respuesta razonada y no como mandato extraído del Decreto 815. Añadir fuente específica sobre priorización/gestión o reducir el enunciado y la explicación a análisis objetivo, comunicación de la restricción y coordinación con el responsable. No hay evidencia de aplicabilidad a un cargo/convocatoria concreto.

### PGN-SEED-0022 — needs_changes

El `codigo-integridad-review-unit` respalda honestidad, transparencia, diligencia y decisiones basadas en información confiable. Es coherente informar un error propio, pero la opción C agrega una secuencia concreta —evaluar impacto, emitir corrección trazable y prevenir recurrencia— que la unidad no formula como procedimiento. Debe añadirse una fuente de gestión de incidentes/control documental o acotar la opción a informar oportunamente, preservar el registro y corregir por el canal institucional. “Corregir silenciosamente” también debe tratarse con cuidado: podría existir un procedimiento formal de reemplazo, por lo que la crítica debe ser ocultar el cambio y romper la trazabilidad, no cualquier edición del archivo.

### PGN-SEED-0023 — needs_changes

`law-1952-2019-review-unit` cubre el deber general de cumplir Constitución, ley y reglamentos y actuar con diligencia. No basta para demostrar que ante cualquier solicitud de un superior se debe seguir exactamente la secuencia “explicar riesgo, proponer alternativa lícita y escalar”. Esa respuesta es prudente, pero requiere apoyo normativo/organizacional adicional y un supuesto más definido, por ejemplo que el control es obligatorio y la omisión contraviene una regla vigente. Debe evitarse sugerir que toda diferencia con un superior constituye ilícito manifiesto o que escalar siempre tiene un único canal. La clave B no debe publicarse mientras la regla y el contexto no estén delimitados.

### PGN-SEED-0024 — needs_changes

La unidad de análisis del CDC respalda revisar datos y método y reconocer que una conclusión puede estar limitada por calidad o diseño. El Código de Integridad también puede sostener comunicar información confiable. Sin embargo, la pregunta es conductual y la opción B añade una pauta prescriptiva completa sin una unidad que establezca el procedimiento de presentación de resultados contrarios a la expectativa. Debe definirse si se evalúa integridad de datos, reproducibilidad o comunicación responsable y aportar la fuente correspondiente. La clave B es razonable, pero la revisión factual no basta para aprobarla.

### PGN-SEED-0025 — needs_changes

La unidad `dnp-public-innovation-review-unit` respalda comprender problema y usuarios, explorar alternativas y probar soluciones mediante prototipos, pilotos o experimentos acotados. Eso sustenta buena parte de la opción B. La unidad dice expresamente que no convierte indicadores específicos en requisito universal y no desarrolla de forma suficiente “restricciones” y “riesgos”. Debe añadirse evidencia para esos elementos o reducir la opción a problema, usuarios, alternativas y prueba controlada con aprendizaje. La opción B no debe presentarse como fórmula obligatoria para toda innovación pública ni como soporte de una convocatoria PGN.

## Recomendación transversal

Las veinte preguntas siguen siendo semillas no aprobadas. Antes de cualquier cambio de estado, cada pregunta debe recibir referencias estructuradas de respaldo —no solo `provenance`—, racionales para las cuatro opciones, revisión editorial independiente y verificación de aplicabilidad temática/convocatoria. Las preguntas con `needs_changes` requieren corrección y una nueva revisión factual; los resultados `pass` requieren igualmente revisión editorial y comprobación de vigencia limitada de sus unidades. Ninguna de las veinte debe convertirse en `validated_assisted` basándose únicamente en este informe.
