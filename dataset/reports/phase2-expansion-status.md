# Estado del banco de expansión

Fecha de corte: 2026-09-07.

Se generaron 84 preguntas originales adicionales a partir de las unidades
verificables locales y del alcance temático confirmado en fuentes oficiales
consultadas en internet. El dataset contiene ahora 109 preguntas:

- 18 `validated_assisted`, publicables;
- 7 semillas en `needs_review` por hallazgos factuales;
- 84 preguntas nuevas en `needs_review`.

Las 84 nuevas preguntas tienen cuatro opciones, clave, explicación, referencia
a una unidad y racionales estructurales. No tienen todavía revisión factual ni
editorial independiente, por lo que no se incorporan al banco público. El
generador reproducible es `scripts/dataset/generate-expansion.mjs` y el lote
resultante es `dataset/content/questions/expansion-draft.json`.

La ampliación debe revisarse por lotes antes de cambiar estados. No se usaron
preguntas copiadas de bancos comerciales, preparadores o influencers.
