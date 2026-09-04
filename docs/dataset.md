# Dataset estructurado — Fase 1

## Propósito y límites

La Fase 1 convierte el inventario documental de la Fase 0 en registros
tipados, valida sus relaciones y genera artefactos reproducibles. No extrae aún
unidades normativas, no revisa con IA y no aprueba preguntas.

El inventario canónico permanece en
`dataset/catalog/source-inventory.json`. Los datos estructurados están en
`dataset/content/`:

- `sources.json`: fuentes y documentos de referencia;
- `taxonomy.json`: módulos y temas;
- `exam-profiles.json`: perfiles provisionales 121, 126 y 127;
- `source-units.json`: unidades verificables, vacío en esta fase;
- `questions/*.json`: preguntas editoriales no publicadas.

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

`approved` no es un estado válido. Una pregunta `validated_assisted` exige
metadatos de revisión, racionales de sus cuatro opciones y respaldo de la
respuesta correcta mediante una fuente A o B verificada y vigente.

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
revisión. En esta fase no hay fuentes `verified`.

Los documentos locales siguen bajo `dataset/raw/` y nunca deben importarse
desde el frontend. Las rutas originales se conservan como trazabilidad, pero el
pipeline solo comprueba archivos locales dentro de este repositorio.

## Preguntas semilla

El diagnóstico inicial se conserva sin alterar y además se representa mediante
25 registros `Question`:

- todos tienen estado `needs_review`;
- usan `seed_import` como método de creación;
- mantienen cuatro opciones, clave y explicación del documento original;
- apuntan al diagnóstico mediante una referencia `provenance` y localizador;
- no declaran respaldo factual oficial;
- no se asignan todavía a convocatorias;
- pueden omitir racionales individuales hasta la revisión de Fase 2.

La procedencia interna no convierte la pregunta en verificable ni publicable.

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
`validated_assisted`. En la Fase 1 su contenido esperado es:

```json
{
  "schemaVersion": 1,
  "questions": []
}
```

## Cobertura y limitaciones reales

`dataset/reports/coverage.md` informa cantidades por estado de fuente y
pregunta, nivel de autoridad, tema y convocatoria, incluyendo categorías en
cero y preguntas sin convocatoria.

Limitaciones vigentes:

- no se han extraído unidades verificables;
- ninguna fuente ha sido declarada verificada o vigente;
- 11 fuentes continúan pendientes de descarga;
- las 25 semillas requieren respaldo oficial y revisión asistida;
- los perfiles de simulacro no tienen todavía duración, cantidad ni
  distribución oficial;
- no existe persistencia, entrenador, simulacro, backend ni despliegue.

## Privacidad

El build inspecciona `dist/` y falla si encuentra `dataset/raw`, las carpetas
privadas excluidas o documentos fuente con extensiones PDF, DOC, DOCX, CSV o
Markdown. No se incorporan CV, COPNIA, salario, contacto, convalidación, tokens
ni secretos, y no se copia contenido de bancos comerciales, Misión Mérito o
influencers.
