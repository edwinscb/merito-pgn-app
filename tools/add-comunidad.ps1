# add-comunidad.ps1
# Guia para traer agentes/skills de la comunidad.
#
# EL GESTOR: vercel-labs/skills (npx skills) es el gestor oficial de skills
# (⭐32k, MIT). Instala skills en Claude Code, Codex, Kiro y 75+ agentes desde
# repos de GitHub. Requiere Node/npm.
#
# --- Skills GENERALES ya integradas al base (copiadas a shared/skills/) ---
#   grill-me     -> entrevista para afilar un plan
#   i-have-adhd  -> salida directa, accion primero
#
# --- Skills de NICHO: NO van al base. Se instalan POR PROYECTO ---
# Cuando un proyecto las necesite, dentro de ese proyecto corre:
#
#   npx skills add czlonkowski/n8n-skills      # solo si el proyecto usa n8n
#   npx skills add vercel-labs/agent-browser   # si el agente debe navegar
#   npx skills add remotion-dev/skills         # si el proyecto usa Remotion
#
# --- Para agregar una skill nueva al BASE (que aplique a casi todo proyecto) ---
#   1. Descarga/lee su SKILL.md de la fuente (audita que no traiga nada raro).
#   2. Copiala a shared/skills/<nombre>.md (autocontenida, en espanol).
#   3. Corre tools/sync.ps1.

Write-Output "Gestor de skills: usa 'npx skills add <owner>/<repo>' dentro del proyecto."
Write-Output "Skills base ya integradas: grill-me, i-have-adhd."
Write-Output "Skills de nicho: instalar por proyecto (ver comentarios de este script)."
