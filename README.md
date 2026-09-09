# Mérito PGN

Estado actual: 109 registros, 18 publicables y 91 pendientes de revisión. Las
84 preguntas nuevas tienen enunciados originales y explicaciones específicas,
pero todavía no cuentan con doble revisión independiente. Todavía no existe un
banco público de 100 preguntas aprobadas.
Véase `dataset/reports/expansion-quality-audit.md`.

Base técnica y documental de un aplicativo personal para preparar el Concurso
Abierto de Méritos de la Procuraduría General de la Nación 2026.

## Estado

Las **fases 0 y 1** están implementadas, la **Fase 2 está cerrada para el lote actual** y la
**Fase 3 está implementada en su alcance técnico**. El
repositorio contiene la aplicación React, la configuración inicial de PWA y un
dataset estructurado con contratos Zod, validación relacional, compilación
reproducible y reporte de cobertura.

Las 25 semillas fueron corregidas y revisadas por dos roles independientes.
Dieciocho preguntas son publicables; Q6, Q10 y Q21–Q25 permanecen en
`needs_review` por hallazgos factuales.
La Fase 3 añade práctica, simulacro breve, confianza, repaso local, IndexedDB y
exportación/importación validada. No incluye generación automática de preguntas,
backend ni despliegue.

## Comandos

```bash
npm install
npm run dataset:inventory
npm run dataset:generate-expansion
npm run dataset:validate
npm run dataset:build
npm run dataset:coverage
npm test
npm run build
npm run dev
```

Para preparar Vercel, importa este repositorio y conserva `npm run build` como
comando de construcción y `dist` como directorio de salida. El archivo
`vercel.json` deja esa configuración versionada; no contiene credenciales ni
realiza el despliegue. La publicación requiere asociar el proyecto a una cuenta
Vercel autorizada.

- `dataset:inventory` regenera el inventario documental y sus hashes.
- `dataset:generate-expansion` regenera el lote original de 84 preguntas de
  trabajo, siempre en `needs_review`.
- `dataset:validate` valida contratos, referencias y reglas de publicación.
- `dataset:build` escribe `public/data/question-bank.json` solo con preguntas
  `validated_assisted`.
- `dataset:coverage` actualiza `dataset/reports/coverage.md`.
- `build` comprueba TypeScript, construye la PWA y verifica que `dist/` no
  contenga documentos fuente ni rutas sensibles.

El entrenador muestra exclusivamente preguntas `validated_assisted` del banco
público (actualmente 18). No inventa duración ni distribución de convocatoria.
El progreso permanece en IndexedDB y usa el contrato `ProgressExport` para
exportar o importar datos.

## Dataset

Los contratos compartidos `Source`, `SourceUnit`, `Question`,
`ExamProfile`, `Attempt` y `ProgressExport` se definen con Zod en
`src/domain/dataset/contracts.ts`. Los registros editables están bajo
`dataset/content/`.

Las 25 preguntas diagnósticas conservan su procedencia: 18 están en
`validated_assisted` y 7 en `needs_review`. El banco público contiene Q1–Q5,
Q7–Q9 y Q11–Q20, con informes finales independientes en
`dataset/reports/phase2-factual-final.json` y
`dataset/reports/phase2-editorial-final.json`. La asignación por convocatoria
es conservadora y solo expresa pertinencia temática documentada. El dataset
incluye además 84 preguntas originales de expansión en `needs_review` (109
registros estructurados en total); no se publican hasta superar doble revisión.

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
