# Mérito PGN

Aplicación personal para estudiar y practicar el examen de la Procuraduría,
pensada para celular. Sitio: https://merito-pgn-app.vercel.app/.

## Experiencia

- Dos bloques: **General** (46 preguntas) y **Sistemas** (56).
- Estudiar por bloque/tema, buscar, consultar explicaciones y fuentes.
- Simulacros de 20 preguntas y 30 minutos por defecto, ajustables. Son parámetros
  de práctica, no el formato oficial de una convocatoria.
- Cambiar respuestas, marcar para volver, recuperar una sesión tras recargar y
  revisar resultados, errores y omitidas al terminar. El reloj no se pausa al salir.
- Guardadas, revisión personal y problemas con notas en el dispositivo.
- Progreso en IndexedDB, exportación v2 e importación v1/v2. Si falla el guardado,
  se informa que el progreso es temporal. No hay sincronización entre dispositivos.
- PWA con aplicación y banco precargados para uso sin conexión después de la
  primera carga completa. Los enlaces a fuentes y al curso requieren conexión.
- Modo oscuro predeterminado, con selector en el encabezado. El modo claro usa
  azul para acciones/selección y reserva el verde para respuestas correctas;
  la elección se guarda únicamente en este dispositivo.

## Banco y honestidad editorial

El dataset conserva 109 registros: 18 `validated_assisted` y 91 `needs_review`.
La aplicación habilita **102 preguntas: 18 revisadas y 84 provisionales**, por
autorización expresa del propietario ligada al hash de su contenido. No se
atribuyen revisiones inexistentes. Las semillas 6, 10 y 21–25 siguen excluidas.

- `public/data/question-bank.json`: 18 preguntas exclusivamente revisadas.
- `public/data/study-bank.json`: 102 preguntas disponibles, con condición visible.
- `dataset/content/study-authorization.json`: autorización de las 84 provisionales.
- `dataset/reports/study-release-audit.md`: correcciones y hallazgos pendientes.

## Desarrollo y validación

```bash
npm ci
npm run dataset:inventory
npm run dataset:validate
npm run dataset:build
npm run dataset:coverage
npm test
npm run build
npm run dev
```

`dataset:build` valida el dataset, genera el banco revisado y comprueba hashes
antes de generar el de estudio. `build` ejecuta ese pipeline, comprueba TypeScript,
genera la PWA e inspecciona la privacidad de `dist`. La generación es determinista.
`dataset:coverage` describe estados editoriales, no autorizaciones de uso.
No ejecutar `dataset:generate-expansion` sobre el lote corregido: es una
herramienta histórica que puede sobrescribir las correcciones editoriales.

La única nueva dependencia de pruebas es `fake-indexeddb`, para comprobar la
migración y transacciones sin depender del navegador del usuario.

## Publicación y privacidad

Vercel usa `npm run build` y `dist`. Primero se revisa una preview; después se
publica la rama principal. No necesita variables secretas ni backend.
Nunca se copian `dataset/raw`, documentos completos ni carpetas privadas al sitio.
No se guardan credenciales. Misión Mérito se enlaza como recurso externo y su
temario orienta vacíos; no se reproducen sus cuestionarios, videos ni guías.
Los respaldos de progreso contienen notas personales: consérvalos en privado.

## Documentación

- `docs/experiencia-estudio.md`: decisiones, uso, migración y aceptación.
- `docs/dataset.md`: contratos y flujo editorial.
- `docs/producto.md`: definición del producto.
- `docs/plan_implementacion_por_fases.md`: historial y alcance de fases.
- `dataset/catalog/source-inventory.json`: fuentes y hashes.
- `dataset/reports/coverage.md`: cobertura editorial.
