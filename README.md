# Mérito PGN

Base técnica y documental de un aplicativo personal para preparar el Concurso
Abierto de Méritos de la Procuraduría General de la Nación 2026.

## Estado

Las **fases 0 y 1** están implementadas. El repositorio contiene la aplicación
React, la configuración inicial de PWA y un dataset estructurado con contratos
Zod, validación relacional, compilación reproducible y reporte de cobertura.

Todavía no incluye práctica, simulacros, IndexedDB, generación o revisión de
preguntas con IA, backend ni despliegue.

## Comandos

```bash
npm install
npm run dataset:inventory
npm run dataset:validate
npm run dataset:build
npm run dataset:coverage
npm test
npm run build
npm run dev
```

- `dataset:inventory` regenera el inventario documental y sus hashes.
- `dataset:validate` valida contratos, referencias y reglas de publicación.
- `dataset:build` escribe `public/data/question-bank.json` solo con preguntas
  `validated_assisted`.
- `dataset:coverage` actualiza `dataset/reports/coverage.md`.
- `build` comprueba TypeScript, construye la PWA y verifica que `dist/` no
  contenga documentos fuente ni rutas sensibles.

## Dataset

Los contratos compartidos `Source`, `SourceUnit`, `Question`,
`ExamProfile`, `Attempt` y `ProgressExport` se definen con Zod en
`src/domain/dataset/contracts.ts`. Los registros editables están bajo
`dataset/content/`.

Las 25 preguntas diagnósticas son material semilla con estado
`needs_review`. Su referencia al diagnóstico registra procedencia, no respaldo
oficial; por eso el banco público de esta fase está vacío.

## Privacidad

`dataset/raw/` conserva documentos de trabajo dentro del repositorio privado,
pero no forma parte de `public/` ni del artefacto generado en `dist/`. Este
proyecto no debe recibir hojas de vida, certificados profesionales, datos de
contacto, análisis salariales, archivos de postulación ni secretos.

La futura URL del sitio y el banco compilado serán públicos. Solo el contenido
generado expresamente dentro de `public/data/` podrá llegar al sitio; nunca se
publican documentos fuente completos.

## Documentación

- `docs/producto.md`: definición completa del aplicativo.
- `docs/plan_implementacion_por_fases.md`: alcance ejecutado y fases futuras.
- `docs/dataset.md`: contratos, procedencia, estados y flujo editorial.
- `dataset/catalog/source-inventory.json`: inventario reproducible con hashes.
- `dataset/reports/coverage.md`: cobertura actual del dataset.
