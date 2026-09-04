# Mérito PGN

Base técnica y documental de un aplicativo personal para preparar el Concurso
Abierto de Méritos de la Procuraduría General de la Nación 2026.

## Estado

La **fase 0** está implementada. El repositorio contiene la aplicación React,
la configuración inicial de PWA y un inventario de fuentes. Todavía no incluye
práctica, simulacros, persistencia, generación de preguntas ni despliegue.

## Comandos

```bash
npm install
npm run dataset:inventory
npm test
npm run build
npm run dev
```

## Privacidad

`dataset/raw/` conserva documentos de trabajo dentro del repositorio privado,
pero no forma parte de `public/` ni del artefacto generado en `dist/`. Este
proyecto no debe recibir hojas de vida, certificados profesionales, datos de
contacto, análisis salariales, archivos de postulación ni secretos.

La futura URL del sitio y el banco compilado serán públicos. Por eso solo el
contenido expresamente generado dentro de `public/data/` podrá llegar al sitio.

## Documentación

- `docs/producto.md`: definición completa del aplicativo.
- `docs/plan_implementacion_por_fases.md`: alcance autorizado y fases futuras.
- `docs/dataset.md`: procedencia, estados y política editorial del dataset.
- `dataset/catalog/source-inventory.json`: inventario reproducible con hashes.

