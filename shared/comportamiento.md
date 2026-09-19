# Reglas de comportamiento (base)

> Fuente única. Edita SOLO este archivo.
> Luego corre `tools/sync.ps1` para propagar a Claude, Codex y Kiro.
>
> Todo lo que esté DEBAJO del marcador `<!-- SYNC:INICIO -->` se copia a los
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
Usa la skill **i-have-adhd.md**.Sé **corto y al punto**. Conclusión primero, sin preámbulo. El detalle solo si
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
