# Plan de implementación por fases — Mérito PGN

Estado: **Fase 0 autorizada**  
Fecha: **3 de septiembre de 2026**

## 1. Decisiones confirmadas

- Aplicativo de uso personal para preparar el Concurso PGN 2026.
- Desarrollo nuevo, sin copiar código del proyecto Euroinnova.
- PWA responsive para computador y celular.
- Alcance funcional inicial: entrenador esencial.
- Progreso local por dispositivo, sin backend ni sincronización.
- Publicación futura como sitio estático gratuito.
- Repositorio de aplicación separado, personal y privado.
- IA permitida únicamente en el proceso editorial; no habrá IA en tiempo de
  ejecución.
- Las preguntas usarán revisión asistida y se identificarán como
  `validated_assisted`, no como revisión humana.

## 2. Fase 0 — Autorizada

### Objetivo

Preparar el repositorio independiente `merito-pgn-app`, la base React/TypeScript,
la configuración inicial de PWA y un dataset documental seguro. Esta fase no
implementa todavía el entrenador.

### Entregables

1. Aplicación base React, TypeScript y Vite.
2. Configuración inicial de PWA, sin completar todavía la experiencia offline.
3. Portada de “Mérito PGN” que informe que el dataset está en preparación.
4. Repositorio Git independiente con rama principal.
5. Documentación de producto, dataset y fases posteriores.
6. Inventario documental con hashes SHA-256.
7. Copia interna de fuentes oficiales disponibles y 25 preguntas semilla.

### Dataset incluido

- Índice y registro normativo existentes.
- Resolución 076 de 2026 disponible localmente.
- Compilado oficial de convocatorias.
- Fichas locales 121, 126 y 127.
- Documentación del aplicativo.
- Plan transversal de preparación.
- Diagnóstico inicial de 25 preguntas, conservado como borrador sin aprobar.

Las fuentes identificadas pero no disponibles localmente, incluidas las
Resoluciones 108 y 133, se registran con URL y estado `pending_download`.

### Exclusiones de privacidad

No se copiarán archivos ni contenidos procedentes de:

- `01_perfil/`;
- `04_analisis/`;
- `05_postulacion/`;
- hojas de vida, certificados, COPNIA o datos de contacto;
- análisis salariales o de convalidación;
- variables de entorno, tokens o respaldos personales.

Los archivos de `dataset/raw/` son internos al repositorio y nunca deben
copiarse al directorio público ni al artefacto web.

### Criterios de aceptación

- Instalación, pruebas iniciales y compilación correctas.
- Aplicación base accesible localmente.
- Inventario completo de los documentos incorporados con hash SHA-256.
- Las 25 preguntas aparecen solo como material semilla.
- `public/data/` no contiene documentos fuente.
- El artefacto compilado no contiene datos privados ni nombres de archivos
  sensibles.
- `.gitignore` cubre secretos, archivos temporales y respaldos.
- El historial inicial no incluye rutas de perfil, análisis o postulación.
- No se realiza despliegue en Vercel durante esta fase.

## 3. Fase 1 — Contratos y fuentes estructuradas

Definir `Source`, `SourceUnit`, `Question`, `ExamProfile`, `Attempt` y
`ProgressExport`; normalizar fuentes y crear validadores y reportes en
Node/TypeScript. Solo se ejecutará con autorización posterior.

## 4. Fase 2 — Banco semilla y revisión asistida

Convertir las 25 preguntas en registros trazables, asignar fuentes y
localizadores, ejecutar dos revisiones asistidas independientes y publicar solo
preguntas `validated_assisted`. Solo se ejecutará con autorización posterior.

## 5. Fase 3 — Entrenador esencial

Implementar práctica, simulacro, confianza, repaso espaciado, IndexedDB y
exportación/importación. Límite previsto: 10–12 horas de desarrollo. Solo se
ejecutará con autorización posterior.

## 6. Fase 4 — Calidad y publicación

Completar pruebas de escritorio, celular y funcionamiento offline; revisar el
artefacto por privacidad y conectar el repositorio personal privado con Vercel
Hobby. Solo se ejecutará con autorización posterior.

## 7. Fase 5 — Crecimiento y actualización

Ampliar el banco en lotes de 25 hasta 200 preguntas útiles y, si la calidad se
mantiene, hasta 400 antes de la prueba. Adaptar perfiles y preguntas cuando la
PGN publique la guía de orientación.

