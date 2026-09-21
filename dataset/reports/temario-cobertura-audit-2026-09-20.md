# Cobertura del banco frente al temario oficial del cargo (2026-09-20)

Auditoría de los temas del banco de estudio contra los conocimientos que el
Manual Específico de Funciones exige para el empleo de la convocatoria a la que
se presenta la candidatura. Números medidos sobre `public/data/study-bank.json`
en `dev` (200 preguntas), no estimados.

## Fuente del temario

Manual Específico de Funciones por Competencias Laborales y Requisitos de los
Empleos de la Planta de Personal, **versión 10**, código MC-M-01, fecha
10/08/2026, páginas 972 a 974 de 1156. Ficha «PROFESIONAL UNIVERSITARIO
(3PU-15) — OFICINA DE TECNOLOGÍA, INNOVACIÓN Y TRANSFORMACIÓN DIGITAL», la que
corresponde a la convocatoria 126-2026 por coincidencia literal de propósito y
de las doce funciones esenciales.

Descarga: <https://www.procuraduria.gov.co/Documents/2026/8.%20Agosto/Manual%20de%20Funciones_V10.pdf>

El artículo 18 de la Resolución 076 de 2026 ordena que las pruebas se diseñen
«de acuerdo con lo previsto en el Manual Específico de Funciones y Requisitos
por Competencias Laborales». Por eso este Manual, y no la ficha de convocatoria,
es la fuente de autoridad del alcance temático.

## Mapeo del temario a los temas del banco

| Conocimiento del Manual V10 | Clase | Tema del banco | Preguntas |
|---|---|---|---|
| Redes informáticas | específico | infraestructura_nube_y_ciberseguridad | 34 (compartido) |
| Sistemas de información | específico | software_e_interoperabilidad | 35 |
| Seguridad informática | específico | infraestructura_nube_y_ciberseguridad | 34 (compartido) |
| Sistemas operativos | específico | sistemas_operativos | **0** |
| Soporte y mantenimiento (software y hardware) | específico | soporte_y_mantenimiento | **0** |
| Conocimientos específicos del área disciplinar | específico | sin tema asignado | — |
| Atención al usuario | común | atencion_transparencia_y_datos | 10 |
| Elaboración de documentos de oficina | común | ofimatica_y_sistemas_de_gestion | 12 (compartido) |
| Estructura y funciones de la PGN | común | procuraduria_y_estado | 8 |
| Sistemas de gestión | común | ofimatica_y_sistemas_de_gestion | 12 (compartido) |
| Gestión documental | común | gestion_documental | 9 |
| Gestión pública y funcionamiento del Estado | común | gestion_publica_y_mipg | 25 |

## Hallazgos

**1. Dos de los seis conocimientos específicos no tienen ni una pregunta.**
`sistemas_operativos` y `soporte_y_mantenimiento` existen en la taxonomía con
cero preguntas. El perfil 126-2026 lo declara deliberado, para que la cobertura
muestre el hueco. El efecto práctico es que un tercio del núcleo específico del
cargo no se puede practicar.

**2. Un tercio del banco está fuera del temario.** 67 de las 200 preguntas caen
en temas que el Manual no lista para este cargo: datos y analítica (31),
derecho disciplinario (14), contratación estatal (12) y competencias
comportamentales (10). Las 133 restantes son las del perfil.

La aplicación **ya las distingue**: `isOutOfScope` en
`src/domain/study-selectors.ts` marca toda pregunta cuyo tema no esté en el
perfil, y `BEHAVIORAL_TOPIC` aparta las comportamentales con la nota de prueba
clasificatoria. Ambos comportamientos tienen prueba en `src/App.test.tsx`. Así
que el problema no es que engañen al estudiar, sino que ocupan un tercio del
banco sin servir a la prueba de conocimientos de este cargo.

Las 10 comportamentales, además, no son ajenas al concurso sino a esta prueba:
pertenecen a la clasificatoria del 20 %, psicotécnica y evaluada contra el
diccionario de competencias de la entidad.

**3. Cuatro conocimientos comparten dos temas, y eso impide medirlos.** Redes
informáticas y seguridad informática caen ambos en
`infraestructura_nube_y_ciberseguridad`; elaboración de documentos de oficina y
sistemas de gestión caen ambos en `ofimatica_y_sistemas_de_gestion`. No se puede
saber cuántas preguntas cubren cada conocimiento ni ponderarlos por separado.

**4. Los pesos del perfil son circulares.** `topicDistribution` es proporcional
al número de preguntas que el banco ya tiene en cada tema (35, 34, 25, 12, 10,
9 y 8 sobre 133). El perfil lo dice con claridad, pero conviene explicitar la
consecuencia: el peso describe el banco, no el examen, así que añadir preguntas
a un tema aumenta su peso sin que nada haya cambiado en la convocatoria. Ningún
artículo de la Resolución 076 distribuye la prueba por tema.

**5. «Conocimientos específicos del área disciplinar» no tiene tema asignado.**
Es el sexto conocimiento específico del Manual y queda sin mapear. El tema
`datos_y_analitica`, con 31 preguntas —el segundo más grande del banco—, está
fuera del perfil sin que conste por qué, cuando es el candidato natural para
ese conocimiento en un cargo de ingeniería de sistemas. Decisión no registrada.

**6. El Manual nunca se incorporó como fuente.** La fuente
`pgn-specific-functions-manual` está en `pending_download` desde el 3 de
septiembre de 2026, sin `contentHash`, sin `version` y con una URL que apunta a
una página de normatividad, no al documento. La fuente que gobierna el temario
por mandato del artículo 18 es la única que no está verificada. La URL directa
y la versión quedan arriba.

**7. Faltan dos resoluciones del Manual.** La Resolución 211 del 6 de agosto de
2026 —la única modificatoria nueva del Manual, coetánea a la V10— no existe como
fuente. La Resolución 056 de 2026, que adoptó la V9, sigue en
`pending_download`.

**8. El perfil cita la ficha vieja.** `exam-profiles.json` lista
`pgn-call-126-2026` en `sourceIds` y su nota dice que la ficha local es versión
2 y que falta incorporar la vigente. El inventario ya tiene
`pgn-call-126-2026-v3` con `status: verified` y `sha256`, cotejada contra la
Resolución 212. La nota del perfil quedó atrás.

## Lo que no se verificó

- La cantidad de preguntas y la duración de la prueba siguen sin publicarse. El
  artículo 18 remite ese detalle a la Guía de Orientación al Aspirante, que
  **no existe para este concurso**: no está entre los documentos oficiales
  publicados del proceso. Los 20 ítems y 30 minutos de los simulacros siguen
  siendo parámetros de práctica.
- La penalización por respuesta incorrecta.
- El contenido del núcleo general: el artículo 19 no lo enumera.
- Si los 31 ítems de datos y analítica caben en «conocimientos específicos del
  área disciplinar». Es una decisión editorial, no un dato que se pueda medir.

## Qué no se tocó y por qué

Ningún archivo del dataset. Los hallazgos 5 a 8 se corrigen editando
`dataset/content/exam-profiles.json`, `dataset/content/sources.json` y
`dataset/catalog/source-inventory.json`, lo que exige regenerar el dataset y
recomprobar hashes, y en el caso de los pesos exige además una decisión
editorial previa sobre el alcance de `datos_y_analitica`. No es trabajo de
documentación.
