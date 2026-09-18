<!-- ARCHIVO GENERADO por tools/sync.ps1 desde shared/. NO editar a mano. Edita shared/ y vuelve a correr el sync. -->

` se copia a los
> archivos de las CLIs. Lo de arriba (este encabezado) NO se copia: es solo
> para ti.
>
> **Las reglas NO están numeradas a propósito.** Se referencian por su título
> (ej. "Ante la duda, pregunta"), así agregar, quitar o reordenar una nunca
> rompe una referencia.

<!-- SYNC:INICIO -->

# Reglas de comportamiento

Reglas globales para cualquier IA que trabaje en este proyecto (Claude Code,
Codex, Kiro). Un proyecto puede añadir reglas propias, pero estas son el
estándar por defecto. Se citan por su título, no por número.

## Idioma
Responde siempre en **español**.

## Estilo de respuesta
Sé **corto y al punto**. Conclusión primero, sin preámbulo. El detalle solo si
se pide.

## Ramas de trabajo
La rama base es **`dev`**. Nunca trabajes directo sobre `dev` ni sobre una rama
de entorno. Crea siempre una **subrama desde `dev`** con nombre estándar:

- `feat/<descripcion-corta>` — funcionalidad nueva
- `fix/<descripcion-corta>` — corrección de error
- `chore/<descripcion-corta>` — mantenimiento, config, dependencias
- `docs/<descripcion-corta>` — documentación
- `refactor/<descripcion-corta>` — reestructurar sin cambiar comportamiento

La descripción va en minúsculas y con guiones. Ejemplo: `feat/login-con-google`.

Invariantes:
- **No compactes (squash) commits** al fusionar. El historial se conserva.
- **Pide permiso antes de fusionar** a `dev` o a una rama de entorno.
- Las ramas ya integradas **se eliminan**.
- Los entornos dependen de cada proyecto. Si existen, la promoción es
  `dev → pruebas → prod` y nunca se commitea directo en ellas.

El procedimiento completo (comandos, estándar del PR, promoción entre entornos)
está en la skill `flujo-git`.

> Nota: NO valides checks de PR ni dependas de la infraestructura de PR de
> GitHub. El estándar es el nombre de rama, el commit y el contenido del PR.

## No declares terminado sin verificar
Nunca digas que algo quedó listo basándote en una suposición. **Di qué
verificaste y qué no.** Si no pudiste comprobar algo (no corriste una prueba, no
leíste un archivo, no confirmaste un comportamiento), dilo explícitamente en vez
de presentarlo como hecho.

> Qué agente puede ejecutar pruebas es alcance de cada agente
> (`shared/agentes/`), no una regla global. Ver el agente `probador`.

## Commits
Puedes crear commits sin pedir permiso, siguiendo la convención de commits.

## Plan antes de código
Explica el plan antes de escribir código.
**No des por hecho decisiones del usuario.** Si algo del plan es ambiguo, pide
claridad antes de avanzar.

## Buenas prácticas y simplicidad
Sigue las buenas prácticas del lenguaje y las convenciones del proyecto.
**Prefiere lo simple:** no añadas abstracción, configurabilidad ni capas que la
tarea no pide.

## Honestidad
No inventes. Si no sabes algo o no lo verificaste, dilo claramente.

## Convención de commits
Usa **Conventional Commits**, con el mensaje en **español**:

```
<tipo>: <descripcion en español>
```

Tipos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`.

Ejemplos:
- `feat: agregar login con Google`
- `fix: corregir cálculo de impuestos`
- `docs: actualizar README de instalación`

## Credenciales
Nunca leas ni modifiques archivos de credenciales (`.env`, llaves privadas,
`.aws/*`, `.ssh/*`, tokens). Refiérete a ellos por nombre, nunca por valor.

## Acciones destructivas
Pregunta antes de cualquier acción destructiva o irreversible: borrar datos,
`git reset --hard`, `git push --force`, borrar ramas, eliminar recursos.

## Ante la duda, pregunta y no avances
No des por hecho ninguna decisión del usuario. Si algo no está claro, falta
información, se necesita profundizar, o detectas una incoherencia o
contradicción, **detente y pregunta antes de continuar**. Sin claridad, no
avances. Es preferible una pregunta de más que una suposición equivocada.

## Exige saber con qué agente se trabaja
Antes de empezar una tarea, debes saber con qué agente de `shared/agentes/` vas
a trabajar. Si el usuario no lo indicó:

1. **Detente y pregúntalo.** No elijas por tu cuenta.
2. **Recomienda uno** de los disponibles y di en una línea por qué.
3. Si ninguno aplica, dilo y propón trabajar solo con las reglas base.

Una vez definido, el agente se mantiene durante la sesión hasta que el usuario
lo cambie. No vuelvas a preguntar en cada mensaje.


## Agentes disponibles

Abre el archivo correspondiente en `shared/agentes/` cuando lo necesites:

- **depurador.md** — Diagnostica por qué algo falla y encuentra la causa raíz con evidencia.
- **documentador.md** — Escribe y mantiene documentación mínima y útil: el POR QUÉ, no el qué.
- **escritor-tests.md** — Escribe pruebas nuevas y corrige pruebas mal escritas.
- **explicador.md** — Explica código, errores, decisiones o conceptos en lenguaje llano, por capas y sin escribir nada.
- **general.md** — Agente de trabajo cotidiano para tareas que NO encajan en un especialista: preguntas puntuales, exploración de código, cambios pequeños, dudas de entorno.
- **implementador.md** — Escribe el código de producción a partir de un plan APROBADO, fase por fase, deteniéndose al cerrar cada una.
- **planificador.md** — Diseña el plan antes de implementar: escruta si el contexto y las decisiones alcanzan, interroga lo que falte y entrega un plan por fases auditables.
- **probador.md** — Ejecuta las pruebas y el build del repositorio y reporta resultados reales.
- **refactorizador.md** — Cambia la estructura del código SIN cambiar su comportamiento.
- **revisor-codigo.md** — Revisa código YA ESCRITO y reporta hallazgos sin modificar nada.
- **revisor-pr.md** — Revisa un PR completo: el artefacto (título, descripción, alcance, commits, rama) y el código que trae.



## Skills disponibles

Abre el archivo correspondiente en `shared/skills/` cuando lo necesites:

- **checklist-revision.md** — Checklist concreto para revisar código: qué mirar, ítem por ítem.
- **correr-tests.md** — Procedimiento para descubrir cómo se prueba un proyecto, correr las pruebas (todas o solo las afectadas) y montar un framework si no existe.
- **flujo-git.md** — Flujo completo de git y GitHub: crear la subrama desde dev, commitear con convención, abrir el PR con su estándar, integrar a dev y limpiar.
- **grill-me.md** — Interroga al usuario una pregunta a la vez para afilar un plan o diseño antes de construir.
- **i-have-adhd.md** — Da formato a la salida para actuar de inmediato: la acción primero, pasos numerados, sin relleno ni cortesías.
- **manejo-secretos.md** — Procedimiento para detectar secretos expuestos en el código, actuar cuando ya se filtró uno (rotar primero) y manejar credenciales correctamente por entorno.
- **onboarding-repo.md** — Procedimiento de solo lectura para que la IA entienda un repositorio nuevo antes de tocarlo: qué hace, con qué stack, cómo se levanta, dónde está la lógica y qué convenciones REALES usa.
- **verificacion-web.md** — Verificar visualmente una página o un cambio de frontend con playwright-cli: abrir la URL, tomar snapshot, interactuar, capturar pantalla y leer el resultado desde disco.

