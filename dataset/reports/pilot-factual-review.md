# Revisión factual independiente del piloto PGN-SEED-0001 a 0005

Fecha del informe: 2026-09-07T03:54:23Z (2026-09-06T22:54:23-05:00).

Revisor: subagente con identidad de tarea `/root/factual_review`. Método: revisión asistida por IA, independiente del otro revisor. Modelo: no expuesto de forma verificable al subagente; no se atribuye un nombre de modelo. No constituye aprobación humana ni publicación del banco.

## Alcance y evidencia

Se examinaron los cinco registros, sus fuentes y las siete unidades incorporadas. Las revisiones históricas contenidas en los registros se trataron como afirmaciones por comprobar, no como aprobaciones. No se consultaron informes del otro revisor ni carpetas personales excluidas. Solo se escribe este informe; no se modifican preguntas, estados ni fuentes.

Se leyeron íntegramente por extracción las páginas PDF relevantes: Constitución 82, 135 y 170; Decreto Ley 262, 15; Ley 1437, 7, 8 y 9. Se leyó la guía PDF antes de esta operación. Esta revisión comprueba texto y localizadores, no certifica una nueva inspección visual. El extractor recuperó el contenido, pero emitió advertencias de encabezado, EOF y referencia cruzada de los PDF; no se repararon los archivos. Sus SHA-256 coinciden con los hashes registrados. También coincide el hash de la copia HTML del boletín.

Las aperturas web de Función Pública fallaron con 502. Se usaron sus copias locales para cotejo textual; Cancillería permitió contrastar en línea los artículos 11 y 12. La página PGN «Objetivos y funciones» respondió mediante HTTP en una consulta y falló por tiempo de espera al repetirla; el índice web oficial corroboró su clasificación. Estas limitaciones impiden declarar revisada integralmente la vigencia de las normas.

La semilla local identifica expresamente el instrumento como no oficial. Sus preguntas 1–5 y tabla de clave coinciden con la procedencia declarada; esa coincidencia no demuestra corrección normativa.

| Pregunta | Resultado del expediente factual | Clave examinada |
| --- | --- | --- |
| PGN-SEED-0001 | pass | B, correcta |
| PGN-SEED-0002 | needs_changes | A, clasificación institucional correcta; respaldo directo y racionales incompletos |
| PGN-SEED-0003 | fail | B, no sustentada íntegramente por la fuente/unidad citada |
| PGN-SEED-0004 | pass | B, correcta |
| PGN-SEED-0005 | needs_changes | B, mejor conducta; precisión de supuesto y unidad de trámite pendiente |

`pass` se limita al contenido y evidencia examinados. `needs_changes` exige corrección antes de aprobación. En Q3, `fail` califica el respaldo factual atribuido; no significa que se haya probado jurídicamente imposible toda gestión preventiva de riesgos.

## PGN-SEED-0001 — pass

La opción B y su explicación son correctas: el artículo 118 incluye al Procurador en el ejercicio del Ministerio Público. El artículo 117, en la misma página 82, identifica al Ministerio Público como órgano de control. El artículo 275, página 170, confirma la dirección suprema. Los racionales A, C y D descartan ubicaciones institucionales incorrectas; B explica la clave. La exclusión de las ramas se refuerza con la caracterización constitucional de autonomía recogida por la Corte en C-030/2023. [Constitución, artículos 117–118 y 275](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4125), [C-030/2023, texto oficial PGN](https://apps.procuraduria.gov.co/gd_1952/docs/sc030_23.htm).

Fuente, unidad y página 82 son coherentes. La unidad 118 es una paráfrasis abreviada, no transcripción literal: comprime la expresión relativa a los agentes ante autoridades jurisdiccionales. Para una pregunta introductoria no cambia la clave. Conviene incorporar 117/275 como apoyo adicional de la explicación, sin presentar la paráfrasis como cita textual. El resultado se limita a esta organización constitucional, no a certificar todas las competencias actuales de la PGN.

## PGN-SEED-0002 — needs_changes

La clave A y la explicación breve corresponden a la clasificación institucional de tres funciones misionales principales que utiliza la propia PGN. Por tanto, no procede declararlas falsas solo porque el artículo 23 también menciona protección y defensa de derechos humanos. Se están comparando una clasificación institucional y una enumeración normativa de funciones de las procuradurías delegadas. [PGN, Objetivos y funciones](https://www.procuraduria.gov.co/procuraduria/conozca-entidad/Pages/objetivos-funciones.aspx).

El artículo 23 está efectivamente en la página 15 y la unidad resume correctamente sus grupos funcionales. Sin embargo, la pregunta solo lo vincula como `context`; no tiene referencia directa `correct_answer` para la clasificación utilizada. Los cuatro racionales están en `null` y no pueden aprobarse como explicaciones inexistentes. B, C y D no describen los tres frentes misionales de la PGN. [Decreto Ley 262, artículo 23](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=40618).

Cambio necesario: agregar fuente/unidad institucional directa, formular el enunciado como las tres funciones misionales principales identificadas por la PGN y explicar cada opción. Aclarar que la defensa de derechos humanos no queda excluida por esa agrupación. No extender esta validación a reglas actuales de investigación, juzgamiento o sanción, que la pregunta no desarrolla.

## PGN-SEED-0003 — fail

La copia HTML vinculada por su hash trata del seguimiento al cumplimiento de la Ley 2492 de 2025. Su párrafo final comienza «La Procuraduría General de la Nación reiteró» y señala ausencia de coadministración, prejuzgamiento y control disciplinario en esa actuación. No existe el localizador «A través de la función preventiva». El artículo no expone la definición sobre anticipación, vigilancia y advertencia que la unidad le atribuye, ni sostiene la expresión “gestionar riesgos”. [Boletín oficial del 6 de febrero de 2026](https://www.procuraduria.gov.co/Pages/procuraduria-vigila-cumplimiento-ley-fortalece-convivencia-paz-municipios.aspx).

La clave B mezcla un límite respaldado (no coadministrar) con una actuación cuyo sentido no está delimitado ni respaldado allí. Su racional solo explica vigilancia/advertencia, por lo que tampoco justifica el verbo “gestionar”; la explicación repite el salto. A, C y D describen excesos incompatibles con el alcance preventivo, pero distractores inadecuados no subsanan el respaldo insuficiente de B.

Una fuente institucional más pertinente describe la vigilancia de servidores y la advertencia de posibles infracciones sin intromisión; la Guía Preventiva describe detección y advertencia temprana de riesgos. [PGN, función preventiva](https://www.procuraduria.gov.co/procuraduria/conozca-entidad/Pages/objetivos-funciones.aspx), [Guía Preventiva, caracterización y focalización](https://apps.procuraduria.gov.co/gp/gp/procedimientos_previos_a_actuacion_preventiva.html). Son fundamentos para una corrección, no fuentes ya incorporadas al registro.

Cambio necesario: retirar `verified` de la unidad actual hasta corregirla y revisarla; corregir fuente/localizador y reformular clave y explicación alrededor de detectar/advertir riesgos en el ámbito de las competencias. Si se conserva “gestionar”, aportar una fuente que defina esa gestión y su límite frente a la responsabilidad de la entidad vigilada; no inferir una potestad general de administración del riesgo. El boletín puede conservarse como ejemplo contextual, con su párrafo real y alcance concreto.

## PGN-SEED-0004 — pass

La opción B reproduce los siete principios enumerados en el primer inciso del artículo 209; los racionales A, C y D rechazan conjuntos que no corresponden a esa enumeración. La explicación es breve pero correcta. Fuente, unidad y localizador en página 135 coinciden. [Constitución, artículo 209](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4125).

El resultado valida la enumeración consultada. No convierte la publicidad en prohibición absoluta de reservas legalmente previstas, ni afirma que esos siete agoten todos los principios aplicables a cualquier procedimiento administrativo. El racional D debe leerse como rechazo del conjunto propuesto, no como esa prohibición universal.

## PGN-SEED-0005 — needs_changes

La opción B es la mejor conducta: revelar el conflicto y seguir el trámite aplicable. Los artículos 11 y 12 respaldan declaración y procedimiento. A y C no resuelven el conflicto y D no reemplaza la evaluación de la causal. Las páginas 7–9 y 9 son correctas. [Ley 1437, artículos 11–12, Función Pública](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=41249), [contraste oficial en Cancillería](https://www.cancilleria.gov.co/normograma/compilacion/docs/ley_1437_2011.htm).

Se requieren dos precisiones antes de aprobar el expediente completo. El enunciado plantea un conflicto “posible” e interés “personal”, mientras el racional A y la explicación dan por establecido el deber jurídico; el artículo 11 se refiere al conflicto con un interés particular y directo. Es preferible describir ese supuesto en una actuación administrativa o explicar la evaluación de la causal, evitando convertir toda apariencia o duda en impedimento jurídicamente demostrado. Además, la unidad 12 omite la ruta subsidiaria al Procurador General o procurador regional cuando faltan superior y cabeza de sector. Su actual formulación parece una regla completa de destinatario.

La fuente también dispone escrito motivado, decisión de la autoridad competente y suspensión del procedimiento; “trazabilidad” es una síntesis razonable de esas formalidades, no una palabra de la disposición. No se valida aquí su aplicación indiscriminada a decisiones judiciales u otros procedimientos especiales.

## Auditoría de las siete SourceUnits

Los estados siguientes son recomendaciones semánticas del informe; deben mapearse a los valores admitidos por el esquema antes de cualquier edición.

| SourceUnit | Texto y localizador comprobados | Recomendación |
| --- | --- | --- |
| constitution-1991-art-118 | Página 82 correcta. Paráfrasis abreviada de integrantes; no literal y omite el ámbito jurisdiccional al comprimir “agentes”. | pass; conservar verificación limitada a la paráfrasis. Si se desea cita literal, restituir el texto exacto. |
| constitution-1991-art-209 | Página 135 correcta. El contenido conserva los siete principios; es extracto/paráfrasis del primer inciso. | pass; sin cambio obligatorio. |
| constitution-1991-art-275 | Página 170 correcta. Contenido coincidente con el artículo. | pass; sin cambio obligatorio. |
| decree-law-262-2000-art-23 | Página 15 correcta. Resume fielmente los grupos enumerados, no todas las condiciones ni apoyo/asesoría del segundo inciso. | pass para ese resumen; no usarlo como prueba exclusiva de tres funciones misionales. |
| law-1437-2011-art-11 | Páginas 7–9 correctas; regla del primer inciso en página 7. Preserva interés particular y directo. | pass; el localizador podría estrecharse a página 7, primer inciso, si solo se sostiene esa regla. |
| law-1437-2011-art-12 | Página 9 correcta. Resumen incompleto del destinatario: faltan las dos rutas subsidiarias de la PGN. | needs_changes; completar la ruta o declarar expresamente el alcance parcial; nueva revisión antes de mantener `verified`. |
| pgn-bulletin-107-2026-preventive-scope | Hash coincide, pero párrafo indicado inexistente y contenido atribuido no está en el boletín. | fail; retirar `verified`; corregir unidad y localizador o sustituir la fuente. |

## Alcance de Source.status y Source.validity

Los cuatro hashes cotejados son los registrados: Constitución `6250cd4c…0dd225`, Decreto 262 `1b83f756…c949`, Ley 1437 `da12ad29…42f7` y boletín `d6e6bc4d…fefa`. Esto prueba identidad con los archivos auditados; no autentica retrospectivamente la descarga ni certifica vigencia integral.

En las tres normas, `status: verified` solo es defendible si el sistema lo define como verificación acotada de procedencia/contenido y registra artículos, fecha y método. No debe significar que todo el texto consolidado fue auditado. Esta revisión no corroboró por separado el artículo 7 del Decreto 262 mencionado en las notas. `validity: effective` a nivel de norma completa no demuestra vigencia individual de cada disposición, versión o competencia: deben registrarse el alcance y la fecha comprobados; si el campo exige validación integral, dejarlo pendiente/desconocido hasta cumplirla.

El boletín es contenido institucional fechado, no norma que entre en vigor. `validity: effective` no debe interpretarse como vigencia normativa. Su procedencia puede conservarse como comprobada, pero `status: verified` y sus notas no pueden avalar la unidad errónea ni la definición que se le atribuye. Corregir esa asociación y describir su alcance como ejemplo de actuación preventiva del 6 de febrero de 2026.

Los `validFrom: null` y `targetCallIds: []` no permiten afirmar aplicabilidad certificada a una convocatoria específica de 2026. Ningún resultado de este informe altera ese alcance ni autoriza publicar las preguntas.
