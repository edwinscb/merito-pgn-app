# Auditoría de perfiles General y 126-2026 — 2026-11-06

## Alcance

- **General:** 120 preguntas del módulo `comun`, incluidas las comportamentales.
- **126-2026:** 173 preguntas en los nueve temas del perfil: 84 generales y 89 técnicas.
- Las 31 preguntas técnicas de `datos_y_analitica` quedan fuera de ambos perfiles del bot.
- Misión Mérito se usó solo para comparar la agrupación pública de cursos; no se copió contenido comercial.

## Método

Cada pregunta recibió dos revisiones independientes sobre la misma huella de contenido:

1. **Factual:** clave, explicación, cuatro racionales, fuente, localizador y vigencia.
2. **Editorial:** respuesta única, claridad, distractores, pistas y duplicación.

Una corrección anuló el dictamen anterior y obligó a revisar la versión nueva. Los `reviewerId`, resultados y huellas quedan registrados en cada pregunta. Las fuentes y unidades se marcaron `verified` únicamente después del cotejo contra el documento primario.

## Resultado

| Conjunto | Revisadas | Doble validación final | Distribución de la clave |
|---|---:|---:|---|
| General | 120 | 120 | A/B/C/D = 30/30/30/30 |
| Técnicas de 126-2026 | 89 | 89 | A/B/C/D = 22/22/22/23 |
| Total validado para los perfiles | 209 | 209 | — |

La primera pasada detectó 65 preguntas General y 26 técnicas con problemas factuales, de evidencia o editoriales. Las versiones corregidas pasaron nuevos dictámenes independientes. El dataset canónico conserva 247 registros: 209 quedan `validated_assisted` para los perfiles y 38 permanecen fuera de esta promoción.

## Autoridad temática

El alcance de 126-2026 se toma de la ficha oficial versión 3 y del Manual Específico de Funciones V10, cargo Profesional Universitario 3PU-15. Los pesos de `topicDistribution` siguen describiendo la cobertura del banco, no una distribución oficial del examen.

## Pendiente de publicación

Los hashes de `owner-approval.json` y `study-authorization.json` corresponden al contenido anterior. No se regeneran ni se atribuye una nueva aprobación al propietario hasta recibir su confirmación expresa sobre las versiones auditadas. Por esa razón, `public/data/study-bank.json` sigue mostrando el banco anterior y el build completo permanecerá bloqueado hasta renovar esa aprobación.
