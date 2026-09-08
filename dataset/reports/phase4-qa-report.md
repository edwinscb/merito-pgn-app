# QA local de Fase 4

Fecha: 2026-09-08.

Comprobaciones ejecutadas:

- `npm run dataset:validate`: dataset válido, 48 fuentes, 31 unidades y 109 preguntas.
- `npm run dataset:build`: banco determinista de 83 preguntas.
- `npm run dataset:coverage`: reporte determinista generado.
- `npm test -- --run`: 33 pruebas exitosas.
- `npm run build`: TypeScript, Vite, PWA y comprobación de privacidad exitosos.
- `git diff --check`: sin errores de whitespace.

El build no contiene `dataset/raw`, documentos fuente ni carpetas privadas.
La publicación externa queda pendiente de autorización y de la revisión
independiente externa del lote promovido.
