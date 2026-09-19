# Plan de implementación por fases — Mérito PGN

Estado: **Fase 1 implementada; Fase 2 cerrada para el lote actual; Fase 3 implementada en alcance técnico; Fase 4 desplegada en producción; Fase 5 en progreso**
Fecha: **19 de septiembre de 2026**

Actualización de experiencia de estudio (10 de septiembre de 2026): se implementan
dos simuladores General/Sistemas, estudio de 200 preguntas (18 revisadas y 182
provisionales autorizadas), secuencia aleatoria recuperable, marcas personales,
migración del progreso y contador de inscripción respaldado por Resolución 133. Véase
`docs/experiencia-estudio.md`. Este ajuste no declara completada la revisión
editorial de la expansión ni modifica los objetivos de las fases siguientes.

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

## 2. Fase 0 — Implementada

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
Node/TypeScript.

Estado: **implementada**.

Resultados:

- contratos Zod con tipos TypeScript inferidos;
- 22 fuentes estructuradas, sin declarar verificadas las pendientes de revisión;
- taxonomía y perfiles provisionales para las convocatorias 121, 126 y 127;
- 25 preguntas semilla en `needs_review`, sin respaldo oficial ni publicación;
- validación relacional, banco público reproducible y reporte de cobertura;
- control automático para impedir documentos fuente o rutas sensibles en
  `dist/`.

## 4. Fase 2 — Banco semilla y revisión asistida

Completar la trazabilidad factual de las 25 preguntas ya estructuradas, asignar
fuentes oficiales y unidades verificables, ejecutar dos revisiones asistidas
independientes y publicar solo preguntas `validated_assisted`.

Estado: **cerrada para el lote actual**.

Lote consolidado:

- 48 fuentes y 31 unidades estructuradas; 22 unidades verificadas y 9 pendientes;
- 25 preguntas revisadas por dos roles independientes;
- 18 preguntas en `validated_assisted`;
- Q6, Q10 y Q21–Q25 en `needs_review` por hallazgos factuales documentados.

Auditoría del 6 de septiembre de 2026: los dos roles del lote correspondían
al mismo asistente. Se corrigió el identificador de revisor y se retiraron
las cuatro aprobaciones prematuras. Después se ejecutaron las dos revisiones
independientes autorizadas sobre las versiones corregidas: 18 superaron ambas
y llegan al banco.

Se incorporaron las fichas oficiales versión 3 de 121, 126 y 127, vinculadas a
la Resolución 212; se corrigieron las 25 semillas, se enlazaron unidades de
respaldo y se completaron los racionales. Las revisiones factual y editorial
finales independientes promovieron 18 preguntas a `validated_assisted`; Q6,
Q10 y Q21–Q25 permanecen en `needs_review` por hallazgos factuales. El detalle
reproducible está en `dataset/reports/phase2-closure-checklist.md` y los
informes finales en `dataset/reports/phase2-factual-final.json` y
`dataset/reports/phase2-editorial-final.json`.

## 5. Fase 3 — Entrenador esencial

Implementar práctica, simulacro, confianza, repaso priorizado local, IndexedDB y
exportación/importación. Límite previsto: 10–12 horas de desarrollo.

Estado: **implementada en alcance técnico**.

Resultados: la aplicación carga exclusivamente el banco público aprobado,
ofrece práctica y simulacro breve, registra respuestas y confianza en
IndexedDB (con respaldo en memoria para entornos sin IndexedDB), muestra
precisión y cola de repaso, y valida exportaciones/importaciones mediante
`ProgressExport`. No se inventan parámetros de convocatoria; las siete
preguntas pendientes de Fase 2 quedan fuera del banco hasta una revisión futura.

## 6. Fase 4 — Calidad y publicación

Estado: **desplegada en producción el 19 de septiembre de 2026**.

Se ejecutaron validación del dataset, pruebas automatizadas, compilación PWA,
flujo de simulacro en navegador local y comprobación de privacidad del artefacto.
`vercel.json` fija el build de Vite y `dist` como salida.

El despliegue real se completó: el proyecto está asociado a una cuenta Vercel y
publica [merito-pgn-app.vercel.app](https://merito-pgn-app.vercel.app/) desde
`main`. Los entornos son `dev` (trabajo) y `main` (producción), sin rama
intermedia. El sitio es de acceso público sin autenticación; ver la decisión del
19 de septiembre de 2026 en `docs/producto.md`.

## 7. Fase 5 — Crecimiento y actualización

Estado: **en progreso**.

El dataset contiene 207 registros: 18 conservan revisión asistida independiente
acreditada (`validated_assisted`) y 189 están en `needs_review`. La aplicación
habilita 200 preguntas para estudio — 18 revisadas y 182 provisionales — por
autorización expresa del propietario ligada al hash de su contenido; esa
autorización no equivale a revisión editorial. Las cifras vigentes están en
`dataset/reports/coverage.md`, que es la fuente a consultar: los informes con
fecha en `dataset/reports/` son registros históricos y conservan a propósito los
números del momento en que se escribieron.

La meta original es 200 preguntas útiles, ampliable a 400 si se mantiene la
calidad; 100 fue el hito intermedio, ya superado.
Las fuentes pendientes de descarga y la guía de orientación, si se
publica, deben revisarse antes de ampliar perfiles o afirmar distribución del
examen.

### Convocatoria objetivo: solo 126-2026

La aplicación apunta **exclusivamente a la convocatoria 126-2026**, la de la
candidatura. Está fijada en `src/App.tsx` mediante la constante
`EXAM_PROFILE_ID`, no se ofrece un selector de convocatoria y es el único perfil
con formato oficial respaldado: cargo 3PU-15, prueba de Conocimientos
eliminatoria con corte de 65 sobre 100 y peso del 70%, según los artículos 18 a
21 de la Resolución 076 de 2026.

Los perfiles `121-2026` y `127-2026` **se conservan en el dataset** como registro
editorial, no como opciones de estudio: `topicDistribution` vacío y
`passingKnowledgeScore` en null, porque nunca se verificó a qué nivel de empleo
corresponden sus cargos. Por eso `dataset/reports/coverage.md` les reporta cero
preguntas elegibles; es el estado correcto, no un defecto.

No se eliminan. Dieciséis preguntas los declaran en `targetCallIds`, y ese campo
afirma un hecho —que su contenido cae dentro de ese temario— que no deja de ser
cierto porque el perfil se borre. Además `targetCallIds` entra en el fingerprint
de la pregunta (`scripts/dataset/question-fingerprint.mjs` solo excluye `status`,
`reviews` y `validFrom`), así que editarlo invalidaría la aprobación del
propietario de quince preguntas `validated_assisted` — quince de las dieciocho
revisadas del proyecto — y `dataset:build` fallaría hasta renovarla. El costo es
alto y el beneficio para quien estudia es nulo.
