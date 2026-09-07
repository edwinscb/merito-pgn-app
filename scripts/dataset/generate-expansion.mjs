import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const units = JSON.parse(await readFile(resolve(root, 'dataset/content/source-units.json'), 'utf8'))
const unitsById = new Map(units.map((unit) => [unit.id, unit]))

// Banco de trabajo original: las afirmaciones se derivan de unidades verificables
// locales, pero cada ítem exige revisión factual/editorial antes de publicarse.
const cards = [
  ['constitution-1991-art-118', 'procuraduria_y_estado', '¿Quiénes ejercen el Ministerio Público según el artículo 118?', 'El Procurador General, el Defensor del Pueblo, los procuradores delegados y agentes, los personeros y los demás funcionarios que determine la ley.', ['Los ministros y gobernadores exclusivamente.', 'La Rama Judicial por medio de sus jueces.', 'La Registraduría y los partidos políticos.']],
  ['constitution-1991-art-209', 'gestion_publica_y_mipg', '¿Qué conjunto reúne principios constitucionales de la función administrativa?', 'Igualdad, moralidad, eficacia, economía, celeridad, imparcialidad y publicidad.', ['Secreto, jerarquía, discrecionalidad, reserva y rentabilidad.', 'Competencia electoral, autonomía judicial y soberanía popular.', 'Innovación, meritocracia, descentralización y estabilidad fiscal únicamente.']],
  ['constitution-1991-art-275', 'procuraduria_y_estado', '¿Qué posición constitucional ocupa el Procurador General frente al Ministerio Público?', 'Es el supremo director del Ministerio Público.', ['Es un delegado subordinado al alcalde de Bogotá.', 'Es el jefe de la Rama Judicial.', 'Es el director de la organización electoral.']],
  ['decree-law-262-2000-art-23', 'procuraduria_y_estado', '¿Qué grupos funcionales contempla el artículo 23 del Decreto Ley 262?', 'Funciones preventivas y de control de gestión, disciplinarias, de derechos humanos e intervención.', ['Solo funciones presupuestales y de contratación.', 'Únicamente funciones electorales y notariales.', 'Solo funciones de policía administrativa.']],
  ['pgn-bulletin-107-2026-preventive-scope', 'procuraduria_y_estado', '¿Qué límite debe respetar la actuación preventiva de la Procuraduría?', 'Acompañar y advertir sin sustituir la decisión administrativa ni coadministrar.', ['Ordenar directamente el gasto de la entidad vigilada.', 'Reemplazar al ordenador del gasto en cada decisión.', 'Aprobar todos los contratos antes de su suscripción.']],
  ['law-1755-2015-review-unit', 'atencion_transparencia_y_datos', 'Ante una petición, ¿qué debe analizarse para determinar la respuesta institucional?', 'El contenido y modalidad de la petición, la competencia y los términos aplicables.', ['Solo el tamaño del documento recibido.', 'La preferencia personal del funcionario que la recibe.', 'El número de páginas del expediente sin revisar la competencia.']],
  ['law-1712-2014-review-unit', 'atencion_transparencia_y_datos', '¿Qué permite el acceso parcial a un documento público?', 'Entregar la parte pública y reservar únicamente la información protegida, justificándolo.', ['Negar todo el documento sin motivación.', 'Publicar también los datos sometidos a reserva.', 'Eliminar el documento del archivo institucional.']],
  ['decree-1080-2015-archives-review-unit', 'gestion_documental', '¿Qué relación existe entre clasificación documental y disposición final?', 'La clasificación y valoración orientan la disposición y conservación de los documentos.', ['La disposición se decide sin valorar series documentales.', 'Todo documento debe destruirse al finalizar el trámite.', 'La clasificación solo sirve para nombrar carpetas personales.']],
  ['minvivienda-phva-methodology-review-unit', 'gestion_publica_y_mipg', '¿Qué caracteriza la etapa verificar del ciclo PHVA?', 'Contrastar resultados y evidencias frente a lo planificado para identificar desviaciones.', ['Ejecutar actividades sin comparar resultados.', 'Definir el problema sin recoger evidencias.', 'Cerrar el ciclo antes de medir los resultados.']],
  ['funcion-publica-indicators-review-unit', 'gestion_publica_y_mipg', '¿Qué elementos hacen interpretable un indicador de seguimiento?', 'Una definición, fórmula, fuente, línea base, meta, periodicidad y responsable.', ['Solo un nombre llamativo y un color.', 'Únicamente la opinión del equipo directivo.', 'Una cifra sin fuente ni periodo de medición.']],
  ['law-80-1993-review-unit', 'contratacion_estatal', '¿Qué expresa el principio de planeación antes de seleccionar un proveedor?', 'Definir la necesidad, analizar alternativas y soportar la decisión con estudios previos.', ['Elegir primero al proveedor y justificar después.', 'Omitir estudios si el proveedor es conocido.', 'Contratar sin establecer la necesidad pública.']],
  ['nist-correlation-review-unit', 'datos_y_analitica', '¿Qué puede concluirse de una correlación entre dos variables?', 'Que existe asociación estadística, pero no necesariamente causalidad.', ['Que una variable causa siempre a la otra.', 'Que los datos son representativos de toda población.', 'Que no se requiere revisar la calidad de los datos.']],
  ['cdc-data-analysis-review-unit', 'datos_y_analitica', '¿Qué riesgo introduce analizar solo los casos que lograron responder una encuesta?', 'Sesgo de selección, porque quienes responden pueden diferir de quienes no responden.', ['Mayor validez automática del resultado.', 'Eliminación completa del error de medición.', 'Causalidad demostrada por el tamaño de la muestra.']],
  ['missouri-db-integrity-review-unit', 'software_e_interoperabilidad', '¿Qué protege la integridad referencial en una base de datos?', 'Que las relaciones entre registros respeten las claves y no apunten a filas inexistentes.', ['Que todos los usuarios tengan permisos de administrador.', 'Que una transacción nunca pueda fallar.', 'Que los datos se almacenen sin ningún esquema.']],
  ['nist-acid-review-unit', 'software_e_interoperabilidad', '¿Qué significa atomicidad en una transacción?', 'Que sus operaciones se confirman como una unidad o se revierten completamente.', ['Que cada usuario puede modificar cualquier tabla.', 'Que los datos se envían sin autenticación.', 'Que una consulta siempre tarda el mismo tiempo.']],
  ['nist-least-privilege-review-unit', 'infraestructura_nube_y_ciberseguridad', '¿Qué exige el principio de mínimo privilegio?', 'Conceder solo los permisos necesarios para una función y durante el tiempo requerido.', ['Otorgar permisos globales para facilitar el soporte.', 'Usar una cuenta compartida para todo el equipo.', 'Conservar permisos indefinidos aunque cambie la función.']],
  ['ncsc-cloud-security-review-unit', 'infraestructura_nube_y_ciberseguridad', '¿Cuál es una práctica adecuada para proteger secretos en servicios cloud?', 'Usar un gestor de secretos, identidades de servicio y rotación controlada.', ['Guardar claves en el código fuente público.', 'Enviar contraseñas por correo sin cifrado.', 'Usar la misma clave permanente en todos los ambientes.']],
  ['homeoffice-api-review-unit', 'software_e_interoperabilidad', '¿Qué debe acompañar un cambio incompatible en una API?', 'Un contrato versionado, comunicación del cambio y pruebas de compatibilidad.', ['Cambiar la respuesta sin modificar documentación.', 'Eliminar las pruebas para acelerar el despliegue.', 'Obligar a todos los consumidores a adivinar el nuevo contrato.']],
  ['cisa-ransomware-review-unit', 'infraestructura_nube_y_ciberseguridad', '¿Cuál es una prioridad inicial ante un incidente de ransomware?', 'Contener la propagación, preservar evidencia y activar el plan de respuesta.', ['Borrar inmediatamente todos los registros.', 'Pagar sin investigar ni contener.', 'Reconectar los equipos afectados a la red principal.']],
  ['law-1437-2011-art-11', 'gestion_publica_y_mipg', '¿Cuándo debe declararse impedido un servidor público?', 'Cuando exista conflicto entre el interés general de la función y un interés particular y directo.', ['Cuando el trámite sea largo aunque no haya interés personal.', 'Solo cuando exista una orden escrita del superior.', 'Siempre que el ciudadano no comparta la decisión.']],
  ['law-1437-2011-art-12', 'gestion_publica_y_mipg', '¿Qué ocurre con la actuación cuando se tramita un impedimento?', 'La actuación se suspende hasta que la autoridad competente decida el impedimento.', ['Debe continuar sin registrar el conflicto.', 'Se archiva automáticamente sin decisión.', 'La decide el mismo servidor impedido.']],
  ['law-1952-2019-review-unit', 'derecho_disciplinario', '¿Qué deber funcional se relaciona con cumplir la Constitución y la ley?', 'Observar la Constitución, las leyes, los reglamentos y los manuales aplicables al servicio.', ['Cumplir únicamente instrucciones verbales.', 'Priorizar la conveniencia personal sobre la norma.', 'Aplicar reglas privadas por encima de la ley.']],
  ['codigo-integridad-review-unit', 'competencias_comportamentales', '¿Qué conducta refleja honestidad en el servicio público?', 'Comunicar información veraz y reconocer oportunamente un error.', ['Ocultar el error para proteger la imagen del equipo.', 'Modificar una cifra sin dejar trazabilidad.', 'Presentar como propio un resultado ajeno.']],
  ['dnp-public-innovation-review-unit', 'competencias_comportamentales', '¿Qué enfoque es coherente con la innovación pública centrada en usuarios?', 'Comprender el problema, prototipar y aprender mediante pruebas controladas.', ['Implementar una solución definitiva sin validar necesidades.', 'Copiar una solución sin analizar el contexto.', 'Medir éxito solo por la cantidad de reuniones.']],
  ['pgn-call-121-2026-v3-profile', 'datos_y_analitica', 'Según la ficha v3 de la convocatoria 121, ¿qué enfoque técnico es pertinente?', 'Analítica de datos y sistemas de información dentro del perfil descrito.', ['Únicamente litigio internacional.', 'Exclusivamente protocolo diplomático.', 'Solo gestión cultural sin componente tecnológico.']],
  ['pgn-call-126-2026-v3-profile', 'software_e_interoperabilidad', 'Según la ficha v3 de la convocatoria 126, ¿qué bloque técnico aparece documentado?', 'Ciclo de vida de software, sistemas de información y redes.', ['Solo archivo histórico sin sistemas.', 'Únicamente contratación artística.', 'Exclusivamente atención presencial.']],
  ['pgn-call-127-2026-v3-profile', 'infraestructura_nube_y_ciberseguridad', 'Según la ficha v3 de la convocatoria 127, ¿qué conjunto técnico está documentado?', 'Infraestructura, redes, nube y seguridad de la información.', ['Solo contabilidad financiera.', 'Únicamente ceremonial institucional.', 'Exclusivamente derecho de familia.']],
  ['decreto-815-2018-review-unit', 'competencias_comportamentales', '¿Qué conducta corresponde a una competencia profesional de análisis?', 'Examinar información con criterios objetivos y comunicar prioridades al responsable.', ['Decidir por rumores sin revisar datos.', 'Ocultar riesgos para evitar preguntas.', 'Cambiar prioridades sin informar a quien coordina.']]
]

const templates = [
  (card) => card[2],
  (card) => `En un caso relacionado con la fuente, ¿cuál actuación es la más consistente?`,
  (card) => `Para aplicar correctamente este criterio, ¿qué opción debe preferirse?`
]

const questions = []
let sequence = 26
for (const card of cards) {
  const [unitId, topicId, stem, correct, distractors] = card
  const unit = unitsById.get(unitId)
  if (!unit) throw new Error(`Unidad inexistente: ${unitId}`)
  for (let variant = 0; variant < 3; variant += 1) {
    const id = `PGN-EXP-${String(sequence).padStart(4, '0')}`
    sequence += 1
    const texts = [correct, ...distractors]
    const rotation = (variant + sequence) % 4
    const ordered = texts.map((_, index) => texts[(index + rotation) % 4])
    const options = ordered.map((text, index) => ({
      id: ['A', 'B', 'C', 'D'][index],
      text,
      rationale: index === ordered.indexOf(correct)
        ? 'Es la opción que coincide con la unidad verificable citada.'
        : 'No coincide con el alcance de la unidad verificable citada.'
    }))
    const correctOptionId = options.find((option) => option.text === correct).id
    questions.push({
      id,
      status: 'needs_review',
      moduleId: topicId === 'procuraduria_y_estado' || topicId === 'gestion_publica_y_mipg' || topicId === 'atencion_transparencia_y_datos' || topicId === 'gestion_documental' || topicId === 'derecho_disciplinario' || topicId === 'competencias_comportamentales' || topicId === 'contratacion_estatal' ? 'comun' : 'tecnico',
      topicId,
      secondaryTopicIds: [],
      questionType: variant === 0 ? 'conceptual' : 'application',
      difficulty: variant + 2,
      stem: variant === 0 ? stem : templates[variant](card),
      options,
      correctOptionId,
      explanation: `La respuesta se deriva del contenido de la unidad ${unit.id}. La pertinencia y la redacción de esta versión requieren revisión independiente antes de su publicación.`,
      references: [{
        sourceId: unit.sourceId,
        sourceUnitId: unit.id,
        locator: unit.locator,
        supports: 'correct_answer'
      }],
      targetCallIds: unit.targetCallIds,
      createdMethod: 'ai_draft',
      reviews: [],
      validFrom: null,
      tags: ['expansion-draft', 'web-informed']
    })
  }
}

await writeFile(resolve(root, 'dataset/content/questions/expansion-draft.json'), `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
console.log(`Generadas ${questions.length} preguntas de expansión en needs_review.`)
