# Experiencia de estudio y dos simuladores

## Decisiones

La portada prioriza General y Sistemas, con Estudiar e Iniciar simulacro. La
navegación contiene Inicio, Preguntas y Progreso; en celular está abajo. No se
exponen fases, IDs internos ni selector de convocatorias. La clasificación de
General usa `comun`; Sistemas usa `tecnico`, incluyendo datos/analítica, software,
bases de datos, interoperabilidad, infraestructura, nube y ciberseguridad.

El usuario ajusta cantidad (1 hasta el total del bloque) y duración (1–240 minutos).
Los valores iniciales son 20 y 30. Las opciones se barajan conservando su ID
original, de modo que la letra de pantalla no determina la calificación. No hay
repeticiones dentro de un intento. Las explicaciones solo aparecen al terminar.

Estudio permite revelar la explicación sin responder; esa acción no inventa un
intento. La confianza es opcional. Guardar, revisar personalmente o reportar un
problema no cambia el estado editorial ni envía información a terceros.

## Persistencia y recuperación

IndexedDB `merito-pgn-progress` pasa de versión 1 a 2: preserva `attempts` y crea
`learning`. El snapshot incluye intentos, marcas y sesiones con su banco y orden
congelados, fecha de inicio y vencimiento absoluto. Al volver se puede continuar;
una sesión vencida se cierra al cargar y queda en Progreso. Un resultado nunca
se reabre por importar un respaldo antiguo del mismo intento.

La exportación v2 incluye todo el progreso. La importación v1 migra intentos y
la v2 combina marcas por fecha e intentos sin duplicados; ante el mismo ID de
sesión prevalece la local. No existe sincronización automática. Si IndexedDB
falla se conserva memoria temporal y se pide exportar antes de cerrar.

## Uso del curso y vacíos

El temario público del [curso de Misión Mérito](https://misionmerito.com/curso/concurso-procuraduria-nivel-profesional-y-asesor/)
orienta el orden de estudio: Estado/Constitución, petición y transparencia,
gestión pública/MIPG y archivos. Derecho disciplinario, contratación,
ofimática y competencias comportamentales requieren ampliar cobertura; no se
presenta el banco como cobertura integral del examen. El bloque Sistemas debe
mantener sus fuentes técnicas oficiales y su revisión específica.

No se necesitó iniciar sesión ni alterar el avance del curso. Toda ampliación
debe producir ejercicios originales y contrastarlos con fuentes oficiales.

## Aceptación y límites

Las pruebas cubren 102 preguntas, separación 46/56, estados visibles, exclusión
de siete semillas, autorización ligada a hashes, barajado/calificación, cambios
de respuestas, navegación, recuperación/vencimiento, migración/exportaciones y
fallo del almacenamiento. La revisión responsive contempla 360, 390, 768 y
1280 píxeles, teclado, contraste y ausencia de desbordamiento horizontal.

La PWA precarga ambos bancos con revisión de contenido. Un despliegue actualiza
la caché de aplicación; los intentos mantienen su propio snapshot. El modo sin
conexión requiere terminar la primera carga y no cubre enlaces externos. Las
102 preguntas disponibles no equivalen a 102 preguntas editorialmente aprobadas.
