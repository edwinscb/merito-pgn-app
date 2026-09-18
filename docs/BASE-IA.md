# Guía del repo base (ia-base-repo)

Guía interna de este repo plantilla. Explica cómo funciona: la fuente única de
reglas, el sync y las convenciones para Claude Code, Codex y Kiro.

> Este repo **no tiene `README.md`** a propósito: un README del base sería ruido
> en el proyecto que lo clona. Esta guía vive aquí, en `docs/BASE.md`.

## Cómo usarlo

1. **Clonar** este repo al empezar un proyecto nuevo.
2. **Correr el setup una vez:** `.\setup.ps1`
   - Sincroniza las reglas a Claude, Codex y Kiro (sync).
   - Instala las skills de comunidad por-proyecto (archify, security-audit) con
     `npx skills add` y registra la fecha de instalación.
   - Avisa si falta `playwright-cli` (opcional, solo para proyectos con
     frontend: `npm install -g @playwright/cli@latest`, requiere Node 20+).
3. Si necesitas ajustar reglas para el proyecto, edita `shared/` y corre el sync.
4. **Crea el `README.md` del proyecto nuevo** desde cero: el del base no existe.

### Revisar si toca actualizar skills

```powershell
.\setup.ps1 -Revisar
```

Muestra qué skills de comunidad hay, cuándo se instalaron, y avisa si pasaron
más de 30 días (heurística para "revisar actualización"). El registro vive en
`skills-instaladas.json` (ignorado por git: es estado del proyecto, no de la
plantilla).

## Estructura

```
shared/                       # FUENTE ÚNICA (lo único que editas)
  comportamiento.md           # reglas globales de la IA
  agentes/                    # un .md por agente
  skills/                     # un .md por skill
tools/
  sync.ps1                    # copia shared/ a los archivos de cada CLI
  add-comunidad.ps1           # traer agentes/skills de la comunidad (WIP)
.templates/                   # plantillas para crear nuevos agentes/skills
CLAUDE.md                     # GENERADO — lo lee Claude Code
AGENTS.md                     # GENERADO — lo lee Codex
.kiro/steering/               # GENERADO — lo lee Kiro
```

## Editar reglas

1. Edita SOLO los archivos dentro de `shared/`.
2. Corre el sync:
   ```powershell
   cd tools
   .\sync.ps1
   ```
3. Los archivos `CLAUDE.md`, `AGENTS.md` y `.kiro/steering/` se regeneran.

> **Nunca edites los archivos generados a mano.** Se sobrescriben.

## Crear un agente o skill nuevo

1. Copia la plantilla de `.templates/agente.md` o `.templates/skill.md`.
2. Renómbralo y colócalo en `shared/agentes/` o `shared/skills/`.
3. Rellena las secciones.
4. Corre `tools/sync.ps1`.

## Convenciones

- **Rama base:** `dev`
- **Subramas:** `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`
- **Commits:** Conventional Commits, en español
- **Idioma de respuesta de la IA:** español
