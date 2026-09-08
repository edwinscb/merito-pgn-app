# Auditoría factual acotada para la ampliación del banco

Revisor independiente: `/root/bank100_factual`. Consulta: 8 de septiembre de 2026 UTC. Se revisó el contenido de las fuentes que sustentan las unidades, sin consultar el informe editorial ni modificar preguntas. Esta auditoría verifica los conceptos indicados, no la vigencia integral de normas, la cobertura del concurso o la calidad de preguntas todavía no revisadas.

| Fuente | Evidencia comprobada | Alcance y cautelas |
| --- | --- | --- |
| Constitución, copia local Función Pública | Páginas PDF 82, 135 y 170; artículos 118, 209 y 275 | Integrantes del Ministerio Público, principios administrativos y dirección suprema. La consulta web devolvió 502; se contrastó la copia local inventariada. |
| CPACA, copia local Función Pública | Páginas PDF 7–9; artículos 11 y 12 | Conflicto particular/directo, impedimento y trámite. Art. 12 distingue remisión de tres días, decisión de diez y manifestación del recusado de cinco; no confundir plazos ni sustituir la autoridad competente. Web 502. |
| Funciones generales PGN | HTML local, funciones misionales y función preventiva | Presenta prevención, intervención y disciplina. Vigilar y advertir no autoriza coadministración. Web no accesible en esta comprobación. |
| Ley 1712, Función Pública | HTML local, artículos 18 y 21 | Motivación escrita y versión pública con exclusión indispensable. No asumir que todo dato personal es automáticamente reservado; atender excepciones y condiciones. Web agotó tiempo. |
| Decreto 1080, ANCP-CCE | HTML local y página oficial web; artículos 2.8.2.5.9, 2.8.2.6.1 y 2.8.2.7.9 | Registro y trámite, organización, disposición conforme a TRD/TVD y metadatos. Las reglas no garantizan por sí solas trazabilidad perfecta. |
| Metodología PHVA Minvivienda | PDF local, página 2, introducción | Verificar compara ejecución con planeación y metas, y orienta acciones. Guía histórica institucional; no demuestra adopción obligatoria PGN. |
| Indicadores Función Pública | HTML local, lineamientos de seguimiento | Lista línea base, meta, fórmula, unidad, fuente, periodicidad y responsable. Evitar atribuir formato exclusivo PGN. Web no accesible. |
| NIST correlación | Web, Handbook 3.1.3.6 | Asociación positiva/negativa no demuestra causalidad; posibles factores terceros y diseño experimental. |
| CDC análisis | Web, análisis e interpretación, selección y datos | Descripción de observaciones, sesgo por selección y necesidad de conocer calidad de los datos. Ejemplos administrativos son aplicaciones conceptuales. |
| Missouri integridad | PDF local, página 2 | PK/FK y conservación de relaciones ante INSERT/UPDATE/DELETE; prevención de huérfanos. No es norma colombiana y no prescribe una política de cascada universal. |
| NIST ACID | PDF local, página 18 | Atomicidad todo-o-nada; distingue consistencia, aislamiento y durabilidad. Unidad vigente solo desarrolla atomicidad; para preguntar otras propiedades hay que ampliar el respaldo estructurado. |
| NIST mínimo privilegio | Glosario oficial web | Permisos y recursos mínimos necesarios para funciones. No exige por sí mismo expiración automática ni una tecnología específica. |
| NCSC nube | Web, identidades, controles y secretos | Identidad diferenciada, acceso granular, almacén gestionado de secretos y cambio/invalidez ante sospecha. Guía extranjera; evitar presentarla como mandato PGN. |
| Home Office API | Web, Designing and Maintaining an API | Versionado, comunicar deprecación, especificación y pruebas de integración/errores. No es obligación jurídica colombiana ni exige siempre versión en URL. |
| CISA ransomware | HTML local, Detection and Analysis y Reporting | Aislamiento, evidencia volátil, restauración según criticidad y coordinación. Apagar es alternativa si no se logra desconectar, no primera acción universal. Web no accesible. |

Los PDF normativos emitieron advertencias de cabecera/xref ya conocidas; el texto de las páginas citadas fue legible. No se reescribieron los archivos ni se alteraron hashes. Las unidades de fichas v3 dan pertinencia temática, no prueban que una pregunta aparezca en examen ni una distribución concreta.

Fuentes web consultadas: [NIST correlación](https://www.itl.nist.gov/div898/handbook/ppc/section1/ppc136.htm), [CDC](https://www.cdc.gov/field-epi-manual/php/chapters/analyze-interpret-data.html), [NIST mínimo privilegio](https://csrc.nist.gov/glossary/term/least_privilege), [NCSC](https://www.ncsc.gov.uk/collection/cloud/using-cloud-services-securely/using-a-cloud-platform-securely), [Home Office API](https://engineering.homeoffice.gov.uk/standards/designing-and-maintaining-an-api/), [Decreto 1080 ANCP-CCE](https://relatoria.colombiacompra.gov.co/normativa/decreto-1080-de-2015/).
