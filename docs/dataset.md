# Dataset documental — Fase 0

## Propósito

Este conjunto reúne material verificable para diseñar posteriormente el banco de
preguntas de Mérito PGN. En la fase 0 los documentos se conservan como insumos;
todavía no se extraen unidades normativas ni se aprueban preguntas.

El inventario canónico está en `dataset/catalog/source-inventory.json`. Puede
regenerarse con `npm run dataset:inventory`; el comando falla si falta alguno de
los archivos declarados.

## Procedencia

Los archivos fueron incorporados desde el repositorio privado
`concursoProcuraduria`:

- registro e índice de normatividad;
- Resolución 076 de 2026;
- compilado de convocatorias y fichas 121, 126 y 127;
- definición del producto y planes de preparación;
- diagnóstico inicial con 25 preguntas.

Las rutas originales se guardan únicamente como trazabilidad documental. No se
incluyen archivos de perfil, análisis, postulación, hoja de vida, COPNIA,
salario, datos de contacto ni convalidación.

## Jerarquía de fuentes

- **Nivel A:** reglas, fichas, guías y comunicaciones oficiales específicas del
  Concurso PGN 2026.
- **Nivel B:** Constitución, leyes, decretos y contenidos oficiales aplicables a
  los temas evaluables.
- **Nivel C:** material educativo institucional útil para explicar o practicar.
- **Nivel D:** cursos, páginas e influencers. Sirven para descubrir temas o
  comparar funciones, pero no respaldan una respuesta.

No se copiarán preguntas, videos, PDFs ni explicaciones de bancos comerciales.
Toda futura pregunta publicable deberá apoyarse en una fuente A o B vigente y en
un localizador verificable.

## Estados de inventario

- `copied_pending_review`: archivo incorporado, pendiente de revisión de
  contenido o vigencia.
- `reference`: documento interno de diseño o preparación, no fuente normativa.
- `seed_unapproved`: preguntas de diagnóstico aún sin transformación ni
  contraste individual.
- `pending_download`: fuente identificada por URL, pero no disponible como
  archivo local.

Los estados futuros de pregunta serán `draft_ai`, `validated_assisted`,
`needs_review`, `rejected` y `retired`. Ninguna pregunta de esta fase tiene el
estado `validated_assisted`.

## Transformación futura

La fase 1 definirá:

- `Source`: autoridad, URL, versión, vigencia, hash y revisión;
- `SourceUnit`: fragmento verificable con artículo, página o sección;
- `Question`: enunciado, cuatro opciones, clave, explicaciones, citas, temas y
  estado editorial.

La fase 2 transformará el diagnóstico en borradores, localizará su respaldo y
aplicará dos revisiones asistidas independientes. Esas actividades están fuera
del alcance autorizado de la fase 0.

## Publicación y privacidad

Los documentos están bajo `dataset/raw/`, fuera de `public/`. Vite solo publica
archivos importados por la aplicación y el contenido de `public/`; por tanto, el
dataset documental no debe copiarse ni importarse desde el frontend.

El indicador `public: false` del inventario es una regla editorial, no un control
de acceso. La validación final debe inspeccionar `dist/` antes de cualquier
despliegue.

