---
name: onboarding-repo
description: >
  Procedimiento de solo lectura para que la IA entienda un repositorio nuevo
  antes de tocarlo: qué hace, con qué stack, cómo se levanta, dónde está la
  lógica y qué convenciones REALES usa. Úsala al llegar a un repo desconocido o
  antes del primer cambio en él.
---

# Onboarding de un repo nuevo

## Objetivo
Entender un repositorio desconocido antes de modificarlo, para no romper sus
convenciones ni duplicar lo que ya existe.

## Cuándo aplicarla
Al llegar a un repositorio por primera vez, o antes del primer cambio en uno que
no conoces.

## Alcance: solo lectura
**No instales dependencias, no corras builds, no ejecutes scripts.** Un repo
desconocido puede tener scripts con efectos secundarios. Si hace falta ejecutar
algo, dilo y pásalo al agente `probador`.

---

## Paso 1: la configuración de la raíz

Lee, en este orden, lo que exista:

- `README` — qué dice que es el proyecto (puede estar desactualizado).
- Manifiesto de dependencias: `package.json`, `pyproject.toml`, `pom.xml`,
  `Cargo.toml`, `go.mod`, `*.csproj`.
- Scripts y automatización: sección de scripts, `Makefile`, `justfile`.
- CI: `.github/workflows/`, `.gitlab-ci.yml` — **el CI dice la verdad** sobre
  cómo se construye y valida el proyecto, más que el README.
- Configuración de entorno: `.env.example`, `docker-compose.yml`, `Dockerfile`.

---

## Paso 2: ¿el repo ya tiene reglas para la IA?

Antes de aplicar cualquier criterio propio, busca:

- `AGENTS.md`
- `CLAUDE.md`
- `.kiro/steering/`
- `.cursor/rules/`, `.github/copilot-instructions.md`

**Si existen, esas reglas mandan en este repo.** Léelas y respétalas. No las
sustituyas por el estándar de tu repo base.

---

## Paso 3: mapear la estructura

- Lista las carpetas de primer nivel y di para qué sirve cada una.
- Encuentra el **punto de entrada** (`main`, `index`, `app`, el handler, el
  comando del CLI).
- Localiza dónde vive la **lógica de negocio**, separada de la infraestructura.
- Identifica dónde están las **pruebas** y cómo se nombran.

En un repo grande, no leas todo. Lee la configuración, el punto de entrada y un
módulo representativo. **Di explícitamente qué no leíste.**

---

## Paso 4: detectar las convenciones REALES

No las supongas: míralas en la evidencia.

| Qué | Dónde mirar |
|---|---|
| Nombres de rama | `git branch -a` y las ramas del remoto |
| Estilo de commits | `git log --oneline -30` |
| Rama base real | contra qué se abren los PR, cuál es la default |
| Estilo de código | configuración de linter y formateador |
| Cómo se prueba | scripts de test y el CI |

Lo que hace el repo pesa más que lo que dice su documentación.

---

## Paso 5: riesgos y deuda visible

Anota lo que salte a la vista, sin auditar a fondo:

- Dependencias muy atrasadas o sin fijar.
- Ausencia de pruebas en zonas críticas.
- Secretos o credenciales versionados (ver skill `manejo-secretos`).
- Configuración de producción incompleta.
- Código muerto o duplicado evidente.

---

## Conflicto de convenciones

Si el repo usa algo distinto al estándar de tu repo base (por ejemplo `feature/`
en vez de `feat/`, o squash al fusionar):

1. **No lo cambies.** El repo existente manda.
2. **Advierte la discrepancia** en el informe, en una línea.
3. Sigue la convención del repo mientras trabajes en él.

El estándar del repo base aplica a proyectos que nacen de él, no a repos ajenos
que ya tienen su forma de trabajar.

---

## Formato de salida
1. **Respuesta a lo que se pidió** — contesta primero la solicitud del prompt.
2. **Qué hace el proyecto** — en 2-3 líneas.
3. **Stack** — lenguajes, frameworks, servicios.
4. **Cómo se levanta y se prueba** — los comandos reales, tomados del CI o de
   los scripts.
5. **Estructura** — carpetas de primer nivel y dónde está la lógica principal.
6. **Convenciones detectadas** — ramas, commits, pruebas, estilo.
7. **Riesgos y deuda visible** — lo que salta a la vista.
8. **Qué no revisaste** — explícito.

## Errores comunes
- Creer el README por encima del CI.
- Suponer las convenciones en vez de mirar `git log` y las ramas.
- Instalar o ejecutar cosas en un repo que no conoces.
- Imponer el estándar del repo base en un repo ajeno.
- Decir que entendiste el repo tras leer solo el README.
- Leer todo el código en vez de la configuración y el punto de entrada.
