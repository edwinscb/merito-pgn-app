# setup.ps1
# Se corre UNA vez despues de clonar el repo base en un proyecto nuevo.
#
#   .\setup.ps1                        -> prepara ESTE proyecto: sync + skills + registro
#   .\setup.ps1 -Revisar               -> estado de las skills instaladas (>30 dias avisa)
#   .\setup.ps1 -Aplicar -Destino <r>  -> copia el base a un proyecto YA EXISTENTE y sincroniza
#
# Registro: skills-instaladas.json (fecha y version de cada skill instalada).

param(
  [switch]$Revisar,
  [switch]$Aplicar,
  [string]$Destino,
  [switch]$Forzar
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$registro = Join-Path $root "skills-instaladas.json"
$diasParaRevisar = 30

# Skills de comunidad que se instalan por proyecto (Forma A: via npx skills)
$skillsComunidad = @(
  @{ nombre = "archify";        repo = "tt-a1i/archify" }
  @{ nombre = "security-audit"; repo = "cloudflare/security-audit-skill" }
)

function Leer-Registro {
  if (Test-Path $registro) { return Get-Content $registro -Raw | ConvertFrom-Json }
  return @{}
}

function Guardar-Registro($obj) {
  $obj | ConvertTo-Json -Depth 5 | Set-Content $registro -Encoding UTF8
}

# ----- MODO APLICAR: llevar el base a un proyecto YA EXISTENTE -----
if ($Aplicar) {
  if (-not $Destino) {
    Write-Error "Falta -Destino. Uso: .\setup.ps1 -Aplicar -Destino 'C:\ruta\proyecto'"
    exit 1
  }
  if (-not (Test-Path $Destino)) {
    Write-Error "El destino no existe: $Destino"
    exit 1
  }
  if (-not (Test-Path (Join-Path $Destino ".git"))) {
    Write-Warning "El destino no parece un repositorio git. Continuo, pero revisa que sea la ruta correcta."
  }

  $yaTiene = Test-Path (Join-Path $Destino "shared")
  if ($yaTiene -and -not $Forzar) {
    Write-Error "El destino ya tiene una carpeta 'shared'. Revisa antes de sobrescribir; usa -Forzar si estas seguro."
    exit 1
  }

  Write-Output "== Aplicando el repo base a: $Destino =="

  # Lo que se copia: la fuente unica, las herramientas, las plantillas y la guia.
  $aCopiar = @("shared", "tools", ".templates")
  foreach ($item in $aCopiar) {
    $origen = Join-Path $root $item
    if (Test-Path $origen) {
      Copy-Item $origen -Destination $Destino -Recurse -Force
      Write-Output "  copiado: $item\"
    }
  }

  # setup.ps1 para que el proyecto pueda re-sincronizar y revisar skills
  Copy-Item (Join-Path $root "setup.ps1") -Destination $Destino -Force
  Write-Output "  copiado: setup.ps1"

  # La guia del base, con nombre que no choque con la documentacion del proyecto
  $guia = Join-Path $root "docs\BASE.md"
  if (Test-Path $guia) {
    $docsDestino = Join-Path $Destino "docs"
    New-Item -ItemType Directory -Force -Path $docsDestino | Out-Null
    Copy-Item $guia -Destination (Join-Path $docsDestino "BASE-IA.md") -Force
    Write-Output "  copiado: docs\BASE-IA.md"
  }

  Write-Output "`n== Sincronizando reglas en el destino =="
  & (Join-Path $Destino "tools\sync.ps1")

  # El destino necesita las mismas exclusiones, o versionara estado local.
  $giDestino = Join-Path $Destino ".gitignore"
  $marcaGi = "# --- Base de configuracion IA (ver docs/BASE-IA.md) ---"
  $reglasGi = @"

$marcaGi
# Estado por-proyecto de las skills de comunidad: no se versiona.
skills-instaladas.json
skills-lock.json
.agents/skills/
.claude/skills/
.kiro/skills/
# Ajustes locales de Kiro CLI (preferencia de la maquina).
# OJO: .kiro/steering/ SI se versiona: lo genera tools/sync.ps1
.kiro/settings/
"@
  if (Test-Path $giDestino) {
    $actual = Get-Content $giDestino -Raw
    if ($actual -notmatch [regex]::Escape($marcaGi)) {
      Add-Content $giDestino $reglasGi
      Write-Output "  .gitignore: reglas del base agregadas"
    } else {
      Write-Output "  .gitignore: ya tenia las reglas del base"
    }
  } else {
    Set-Content $giDestino $reglasGi.TrimStart() -Encoding UTF8
    Write-Output "  .gitignore: creado con las reglas del base"
  }

  Write-Output "`n== Aplicado =="
  Write-Output "Siguientes pasos en el proyecto destino:"
  Write-Output "  1. Revisa el diff y commitea (mensaje en espanol, convencion de commits)."
  Write-Output "  2. Si quieres las skills de comunidad:  .\setup.ps1"
  Write-Output "  3. Edita solo shared\ y vuelve a correr tools\sync.ps1 cuando cambies reglas."
  return
}

# ----- MODO REVISAR -----
if ($Revisar) {
  if (-not (Test-Path $registro)) {
    Write-Output "No hay registro todavia. Corre .\setup.ps1 primero."
    return
  }
  $reg = Leer-Registro
  $hoy = Get-Date
  Write-Output "Skills instaladas:"
  foreach ($p in $reg.PSObject.Properties) {
    $info = $p.Value
    $fecha = [datetime]$info.instalada
    $dias = [int]($hoy - $fecha).TotalDays
    $aviso = if ($dias -ge $diasParaRevisar) { "  <-- REVISAR actualizacion ($dias dias)" } else { "" }
    $ver = if ($info.version) { $info.version } else { "(sin version)" }
    Write-Output ("  - {0}: instalada {1:yyyy-MM-dd} | version {2} | {3} dias{4}" -f $p.Name, $fecha, $ver, $dias, $aviso)
  }
  Write-Output "`nPara actualizar una skill: npx skills add <owner>/<repo> (vuelve a correr setup para re-registrar la fecha)."
  return
}

# ----- MODO SETUP (por defecto) -----
Write-Output "== 1/4 Sincronizando reglas (sync.ps1) =="
& (Join-Path $root "tools\sync.ps1")

Write-Output "`n== 2/4 Instalando skills de comunidad por proyecto =="
$npx = Get-Command npx -ErrorAction SilentlyContinue
if (-not $npx) {
  Write-Warning "No encuentro 'npx' (Node.js). Instala Node y vuelve a correr setup para las skills de comunidad."
} else {
  $reg = Leer-Registro
  foreach ($s in $skillsComunidad) {
    Write-Output "  -> npx skills add $($s.repo) (proyecto, no-interactivo)"
    try {
      # -y no-interactivo; -a agentes objetivo (Claude, Codex, Kiro). Sin -g = por proyecto.
      npx skills add $s.repo -y -a claude-code -a codex -a kiro-cli 2>&1 | Write-Output
      $entrada = @{ repo = $s.repo; instalada = (Get-Date).ToString("o"); version = "" }
      $reg | Add-Member -NotePropertyName $s.nombre -NotePropertyValue $entrada -Force
    } catch {
      Write-Warning "  Fallo instalando $($s.nombre): $_"
    }
  }
  Guardar-Registro $reg
  Write-Output "  Registro actualizado en skills-instaladas.json"
  Write-Output "  (Skills instaladas por-proyecto en .claude/skills, .agents/skills y .kiro/skills)"
}

Write-Output "`n== 3/4 Herramientas opcionales =="
# playwright-cli: solo necesario si el proyecto tiene frontend que verificar.
# No se instala automaticamente (es global y no todo proyecto lo necesita).
$pw = Get-Command playwright-cli -ErrorAction SilentlyContinue
if ($pw) {
  Write-Output "  playwright-cli: instalado (skill 'verificacion-web' disponible)"
} else {
  Write-Output "  playwright-cli: NO instalado."
  Write-Output "    Solo hace falta si este proyecto tiene frontend que verificar."
  Write-Output "    Para instalarlo:  npm install -g @playwright/cli@latest   (requiere Node 20+)"
}

Write-Output "`n== 4/4 Listo =="
Write-Output "Recuerda: crea el README.md de ESTE proyecto (el base no trae README)."
Write-Output "Para ver estado de skills: .\setup.ps1 -Revisar"
