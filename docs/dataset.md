# Dataset estructurado — Fases 1, 2 y 3

Corrección de la expansión: 18 preguntas publicables y 91 pendientes. Las 84
nuevas preguntas tienen enunciados originales y explicaciones específicas, pero
requieren doble revisión independiente antes de publicarse. La auditoría está
en `dataset/reports/expansion-quality-audit.md`.

## Propósito y límites

La Fase 1 convirtió el inventario documental de la Fase 0 en registros tipados,
validó sus relaciones y creó artefactos reproducibles. La Fase 2 está
cerrada para el lote actual: incorporó las fichas vigentes versión 3 de 121, 126
y 127, corrigió las 25 semillas y registró revisiones factual y editorial
finales independientes.

El inventario canónico permanece en
`dataset/catalog/source-inventory.json`. Los datos estructurados están en
`dataset/content/`:

- `sources.json`: fuentes y documentos de referencia;
- `taxonomy.json`: módulos y temas;
- `exam-profiles.json`: perfiles provisionales 121, 126 y 127;
- `source-units.json`: fragmentos verificables con fuente, hash y localizador;
- `questions/*.json`: preguntas editoriales publicables o pendientes. Además de
  las 25 semillas, `expansion-draft.json` contiene 84 preguntas originales de
  trabajo, para un total de 109 registros.

## Contratos

Los esquemas Zod y sus tipos TypeScript inferidos se exportan desde
`src/domain/dataset/contracts.ts`.

- `Source`: autoridad, procedencia, URL o ruta, hash, versión, vigencia,
  redistribución y estado de revisión.
- `SourceUnit`: fragmento verificable enlazado a una fuente y un localizador.
- `Question`: enunciado, cuatro opciones, clave, explicación, temas,
  convocatorias, referencias y estado editorial.
- `ExamProfile`: convocatoria y parámetros de simulacro; los valores aún no
  publicados permanecen en `null`.
- `Attempt`: respuesta, confianza, tiempo y modo.
- `ProgressExport`: envoltura versionada para una futura exportación.

Los estados de pregunta permitidos son:

- `draft_ai`;
- `validated_assisted`;
- `needs_review`;
- `rejected`;
- `retired`.

`approved` no es un estado válido. Una pregunta `validated_assisted` exige una
revisión factual y otra editorial con resultado `pass`, vigencia, racionales de
sus cuatro opciones y respaldo de la respuesta correcta mediante una unidad
verificada de una fuente A o B verificada y vigente.

Se considera la última revisión de cada tipo según su fecha; una revisión
posterior adversa bloquea la publicación. Los IDs deben ser únicos y las
últimas fechas no pueden ser ambiguas. Los revisores deben ser distintos:
renombrar dos roles del mismo asistente no constituye independencia. El
contrato comprueba metadatos; la evidencia de quién revisó debe auditarse.

## Fuentes, autoridad y vigencia

La transformación conserva identificadores, títulos, rutas, URL, hashes,
procedencia, estados y restricciones del inventario. La autoridad se representa
como:

- **A:** fuentes oficiales específicas del Concurso PGN 2026;
- **B:** normativa o contenido oficial general;
- **C:** referencias educativas institucionales;
- **D:** páginas, cursos o influencers, únicamente para descubrimiento;
- **N/A:** índices internos, documentos de diseño y material semilla.

Las fuentes pendientes conservan `pending_download`, sin ruta local, MIME ni
hash. La vigencia se mantiene como `unknown` mientras no exista evidencia de
revisión. El lote piloto verificó la Constitución Política, el Decreto Ley 262
de 2000, la Ley 1437 de 2011 y un boletín oficial de la PGN de 2026.

Los documentos locales siguen bajo `dataset/raw/` y nunca deben importarse
desde el frontend. Las rutas originales se conservan como trazabilidad, pero el
pipeline solo comprueba archivos locales dentro de este repositorio.

## Preguntas semilla

El diagnóstico inicial se conserva como fuente de procedencia y se representa
mediante 25 registros `Question`:

- usan `seed_import` como método de creación;
- mantienen cuatro opciones, clave y explicación del documento original;
- apuntan al diagnóstico mediante una referencia `provenance` y localizador;
- se asignan a convocatorias solo con pertinencia temática documentada en las
  fichas versión 3;
- las 25 cuentan con racionales para las cuatro opciones y referencias de respaldo;
- las 25 recibieron revisión factual y editorial final; solo 18 superaron ambas;
- 18 fueron promovidas a `validated_assisted` y 7 permanecen en `needs_review`
  por hallazgos factuales de la revisión final;
- las fichas vigentes no implican que una pregunta concreta aparezca en la prueba.

La procedencia interna no convierte la pregunta en verificable ni publicable.
Las 84 preguntas de expansión fueron redactadas a partir de unidades oficiales
o institucionales locales y consultas web documentadas, pero permanecen en
`needs_review` hasta completar revisión independiente.

## Comandos y flujo

```bash
npm run dataset:inventory
npm run dataset:validate
npm run dataset:build
npm run dataset:coverage
```

1. `dataset:inventory` recalcula el inventario y hashes de archivos locales.
2. `dataset:validate` aplica esquemas y validaciones relacionales.
3. `dataset:build` valida de nuevo y genera un banco estable ordenado por ID.
4. `dataset:coverage` valida y genera un reporte Markdown sin fecha dinámica.

La validación falla ante IDs duplicados, archivos o fuentes inexistentes,
localizadores vacíos, estados inválidos, opciones distintas de cuatro,
opciones vacías o repetidas, claves inexistentes, referencias inválidas y
preguntas publicables sin fuente oficial A o B verificada y vigente.

`public/data/question-bank.json` contiene exclusivamente preguntas
`validated_assisted`. Actualmente contiene 18 preguntas (Q1–Q5, Q7–Q9 y
Q11–Q20). El conjunto estructurado contiene 109 preguntas; las 91 restantes
no llegan al banco público. Los informes
independientes y sus límites están en `dataset/reports/phase2-factual-final.json`
y `dataset/reports/phase2-editorial-final.json`.

## Cobertura y limitaciones reales

`dataset/reports/coverage.md` informa cantidades por estado de fuente y
pregunta, nivel de autoridad, tema y convocatoria, incluyendo categorías en
cero y preguntas sin convocatoria.

Limitaciones vigentes:

- existen 31 unidades: 22 verificadas y nueve en `pending_review`;
- cuatro fuentes tienen procedencia/contenido comprobados para el alcance
  puntual indicado en sus notas; esto no certifica todos sus artículos;
- nueve fuentes continúan pendientes de descarga;
- 91 preguntas todavía no son publicables: las siete semillas pendientes y 84
  preguntas de expansión;
- la unidad del artículo 12 requiere completar el alcance del trámite;
- la unidad del boletín se corrigió como resumen contextual y requiere nueva
  revisión; no respalda por sí sola una potestad general de gestionar riesgos;
- la aplicabilidad temática está asignada de forma conservadora mediante
  `targetCallIds`, sin afirmar distribución del examen;
- algunos PDF oficiales descargados contienen bytes iniciales no canónicos;
  los hashes se preservan y las páginas usadas se comprobaron visualmente,
  pero otros procesadores PDF pueden emitir advertencias;
- los perfiles de simulacro no tienen todavía duración, cantidad ni
  distribución oficial;
- las siete preguntas no promovidas requieren corrección y nueva revisión factual;
- Fase 3 implementa práctica, simulacro breve, captura de confianza, una cola
  local de repaso priorizada por errores/confianza baja, IndexedDB y
  exportación/importación validada; no crea un calendario espaciado ni usa
  servidores.

El frontend lee exclusivamente `public/data/question-bank.json`, por lo que las
siete semillas y las preguntas de expansión en `needs_review` nunca aparecen en práctica. El banco actual
contiene las 18 preguntas `validated_assisted` disponibles.

## Privacidad

El build inspecciona `dist/` y falla si encuentra `dataset/raw`, las carpetas
privadas excluidas o documentos fuente con extensiones PDF, DOC, DOCX, CSV o
Markdown. No se incorporan CV, COPNIA, salario, contacto, convalidación, tokens
ni secretos, y no se copia contenido de bancos comerciales, Misión Mérito o
influencers.

El control también compara hashes para detectar copias completas de fuentes
inventariadas, incluido HTML renombrado. No identifica automáticamente toda
paráfrasis o copia modificada; la revisión del artefacto sigue siendo necesaria.
`.gitattributes` conserva los bytes de `dataset/raw/` y los documentos internos
inventariados para evitar cambios de hash por conversión de saltos de línea.

## Decisiones de la auditoría del 6 de septiembre de 2026

Se corrigieron los IDs de las primeras pasadas: ambos roles pertenecían a
`codex` y no eran independientes. Se conservan como historial, sin usarlos
para acreditar independencia. Los nuevos informes provienen de los subagentes
`/root/factual_review` y `/root/editorial_review`, con fechas reales y evidencia.
Solo 1 y 4 obtuvieron `pass` en ambos; la validación anterior de cuatro
preguntas fue prematura y quedó sustituida por estos resultados.

`Source.status: verified` identifica comprobación acotada de procedencia y
contenido, no auditoría integral. `effective` para normas se limita a las
disposiciones utilizadas; no certifica todas las competencias actuales. El
boletín institucional tiene vigencia `unknown`: no es una norma jurídica.
Toda modificación del contenido de una pregunta exige volver a `needs_review`
y obtener revisiones de la nueva versión; el contrato no identifica por sí solo
una edición semántica que conserve indebidamente los metadatos antiguos.
