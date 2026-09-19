# Mérito PGN

Aplicación personal para estudiar y practicar el examen de la Procuraduría,
pensada para celular. Sitio: https://merito-pgn-app.vercel.app/.

El sitio es de **acceso público y sin autenticación** por decisión del 19 de
septiembre de 2026. No hay cuentas ni datos personales en él, y el progreso sigue
siendo local por dispositivo, pero el banco de preguntas y sus respuestas
correctas los descarga cualquiera que tenga la URL.

## Experiencia

- Dos bloques: **General** (100 preguntas) y **Sistemas** (100).
- El estudio baraja preguntas y opciones al entrar o pulsar «Mezclar de nuevo» y conserva la secuencia en la pestaña.
- Estudiar por bloque/tema, buscar, consultar explicaciones y fuentes.
- Simulacros de 20 preguntas y 30 minutos por defecto, ajustables. Son parámetros
  de práctica, no el formato oficial de una convocatoria.
- La aplicación apunta solo a la **convocatoria 126-2026**, la de la candidatura:
  es el único perfil con formato oficial respaldado (cargo 3PU-15, corte 65 sobre
  100). No hay selector de convocatoria. Los perfiles 121-2026 y 127-2026 siguen
  en el dataset como registro editorial, sin pesos y sin preguntas elegibles.
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

Las 200 preguntas disponibles cuentan con aprobación expresa del propietario,
registrada por ID y hash en `dataset/content/owner-approval.json`. La aplicación
muestra «Aprobada por el propietario». Un cambio de contenido exige renovar esa
aprobación. La aprobación personal no constituye aval de la PGN ni añade revisiones
factuales o editoriales independientes a los registros del dataset.

El dataset conserva 207 registros: 18 `validated_assisted` y 189 `needs_review`.
La aplicación habilita **200 preguntas: 18 revisadas y 182 provisionales**, por
autorización expresa del propietario ligada al hash de su contenido. No se
atribuyen revisiones inexistentes. Las semillas 6, 10 y 21–25 siguen excluidas.

- `public/data/question-bank.json`: 18 preguntas exclusivamente revisadas.
- `public/data/study-bank.json`: 200 preguntas disponibles, con condición visible.
- `dataset/content/study-authorization.json`: autorizaciones provisionales ligadas al hash.
- `dataset/content/registration.json`: cierre oficial, evidencia y portal.
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

El workflow `.github/workflows/verificacion.yml` corre `npm test` y `npm run build`
en cada push y PR contra `dev` y `main`. Es una alarma, no una compuerta: avisa si
algo se rompió, pero no bloquea la fusión ni sustituye la revisión del cambio.

## Publicación y privacidad

Los entornos de este proyecto son dos: `dev`, la rama base de trabajo, y `main`,
producción, que Vercel despliega. No existe rama intermedia de pruebas, así que
la promoción es `dev → main` y se hace por fusión, sin commits directos en `main`.

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
