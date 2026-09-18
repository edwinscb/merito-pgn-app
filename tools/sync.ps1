# sync.ps1
# Copia la FUENTE ÚNICA (shared/) a los archivos que cada CLI lee.
# Editas shared/, corres este script, y los tres quedan sincronizados.
#
# Uso:  cd tools ; .\sync.ps1
#
# Genera:
#   AGENTS.md                 -> lo leen Codex Y Claude Code (estandar comun)
#   CLAUDE.md                 -> apunta a AGENTS.md (para Claude)
#   .kiro/steering/*.md       -> varios archivos por tema (recomendacion Kiro)
#
# Principios (validados con las guias oficiales 2026):
#   - Archivos cortos: reglas, no meta-instrucciones para el humano.
#   - Indice, no copia: se listan agentes/skills y su ruta; la IA abre el
#     archivo concreto cuando lo necesita.
#   - El encabezado de shared/comportamiento.md (lo de arriba del marcador
#     <!-- SYNC:INICIO -->) NO se copia.
#
# NO edites los archivos generados a mano: se sobrescriben en cada sync.

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$shared = Join-Path $root "shared"
$marca = "<!-- ARCHIVO GENERADO por tools/sync.ps1 desde shared/. NO editar a mano. Edita shared/ y vuelve a correr el sync. -->"

if (-not (Test-Path $shared)) {
  Write-Error "No encuentro la carpeta shared/ en $root"
  exit 1
}

# --- 1. Reglas de comportamiento: solo lo que esta debajo del marcador ---
$rawComp = Get-Content (Join-Path $shared "comportamiento.md") -Raw
$sep = "<!-- SYNC:INICIO -->"
if ($rawComp -match [regex]::Escape($sep)) {
  $comportamiento = ($rawComp -split [regex]::Escape($sep), 2)[1].Trim()
} else {
  # Sin marcador: se copia entero (compatibilidad hacia atras)
  $comportamiento = $rawComp.Trim()
}

# --- 2. Indice de agentes y skills (nombre + cuando usarlo), no el contenido ---
# Lee el frontmatter YAML linea por linea (mas fiable que una regex): toma
# 'description', soporta bloque '>' y se detiene en la siguiente clave YAML.
function Resumen-Archivo($ruta) {
  $lineas = Get-Content $ruta
  $desc = ""

  if ($lineas.Count -gt 0 -and $lineas[0].Trim() -eq '---') {
    $i = 1
    while ($i -lt $lineas.Count -and $lineas[$i].Trim() -ne '---') {
      if ($lineas[$i] -match '^description:\s*(.*)$') {
        $resto = $matches[1].Trim()
        if ($resto -eq '>' -or $resto -eq '|' -or $resto -eq '') {
          # Bloque: consumir solo lineas indentadas siguientes
          $i++
          $partes = @()
          while ($i -lt $lineas.Count -and $lineas[$i] -match '^[ \t]+\S') {
            $partes += $lineas[$i].Trim()
            $i++
          }
          $desc = ($partes -join ' ')
        } else {
          $desc = $resto
        }
        break
      }
      $i++
    }
  }

  if (-not $desc) {
    $h = ($lineas | Where-Object { $_ -match '^#\s+' } | Select-Object -First 1)
    if ($h) { $desc = ($h -replace '^#\s*', '').Trim() }
  }
  if (-not $desc) { $desc = [System.IO.Path]::GetFileNameWithoutExtension($ruta) }

  # Acortar a la primera frase para que el indice quede escaneable
  $desc = $desc.Trim()
  if ($desc.Length -gt 160) {
    $corte = $desc.IndexOf('. ')
    if ($corte -gt 30 -and $corte -lt 200) { $desc = $desc.Substring(0, $corte + 1) }
    else { $desc = $desc.Substring(0, 157) + "..." }
  }
  return $desc
}

function Indice-Carpeta($dir, $titulo, $rutaRel) {
  if (-not (Test-Path $dir)) { return "" }
  $archivos = Get-ChildItem $dir -Filter *.md | Sort-Object Name
  if ($archivos.Count -eq 0) { return "" }
  $out = "`n`n## $titulo`n`n"
  $out += "Abre el archivo correspondiente en ``$rutaRel`` cuando lo necesites:`n`n"
  foreach ($f in $archivos) {
    $resumen = Resumen-Archivo $f.FullName
    $out += "- **$($f.Name)** — $resumen`n"
  }
  return $out
}

$idxAgentes = Indice-Carpeta (Join-Path $shared "agentes") "Agentes disponibles" "shared/agentes/"
$idxSkills  = Indice-Carpeta (Join-Path $shared "skills")  "Skills disponibles"  "shared/skills/"

# --- 3. Contenido comun para AGENTS.md ---
$agentsMd = @"
$marca

$comportamiento
$idxAgentes
$idxSkills
"@

$agentsPath = Join-Path $root "AGENTS.md"
$agentsMd | Set-Content $agentsPath -Encoding UTF8

# --- 4. CLAUDE.md apunta a AGENTS.md (Claude tambien lee AGENTS.md) ---
$claudeMd = @"
$marca

# Contexto para Claude Code

Las reglas, agentes y skills de este proyecto viven en ``AGENTS.md`` (estandar
comun). Lee ese archivo como fuente de verdad.

Ver: [AGENTS.md](./AGENTS.md)
"@
$claudePath = Join-Path $root "CLAUDE.md"
$claudeMd | Set-Content $claudePath -Encoding UTF8

# --- 5. Kiro: varios steering por tema (recomendacion oficial) ---
$kiroDir = Join-Path $root ".kiro\steering"
New-Item -ItemType Directory -Force -Path $kiroDir | Out-Null

# Limpieza: borrar generados previos para no dejar huerfanos
Get-ChildItem $kiroDir -Filter *.md -ErrorAction SilentlyContinue | Remove-Item -Force

# 5a. Comportamiento
@"
$marca

$comportamiento
"@ | Set-Content (Join-Path $kiroDir "comportamiento.md") -Encoding UTF8

# 5b. Agentes (indice)
if ($idxAgentes) {
@"
$marca

# Agentes
$idxAgentes
"@ | Set-Content (Join-Path $kiroDir "agentes.md") -Encoding UTF8
}

# 5c. Skills (indice)
if ($idxSkills) {
@"
$marca

# Skills
$idxSkills
"@ | Set-Content (Join-Path $kiroDir "skills.md") -Encoding UTF8
}

Write-Output "Sincronizado desde shared/ ->"
Write-Output "  $agentsPath   (Codex + Claude)"
Write-Output "  $claudePath   (apunta a AGENTS.md)"
Write-Output "  $kiroDir\comportamiento.md | agentes.md | skills.md  (Kiro por tema)"
Write-Output ""
Write-Output "Recuerda: edita solo shared/. Estos archivos se regeneran."
