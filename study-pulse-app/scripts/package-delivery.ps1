param(
  [Parameter(Mandatory = $true)][string]$OutputPath
)

$ErrorActionPreference = 'Stop'
$repoRoot = (git -C $PSScriptRoot rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Execute dentro do repositorio StudyPulse.' }
$outputFull = [IO.Path]::GetFullPath($OutputPath)
if (Test-Path -LiteralPath $outputFull) { throw "O pacote ja existe: $outputFull. Use outro destino para preservar a versao anterior." }

# A lista Git evita copiar dependencias, ambientes e diretorios locais alheios.
$tracked = @(git -C $repoRoot -c core.quotepath=false ls-files)
$new = @(git -C $repoRoot -c core.quotepath=false ls-files --others --exclude-standard) |
  Where-Object { $_ -match '^(entrega-ihc/|study-pulse-app/(src/|tests/|scripts/|supabase/))' }
$files = @($tracked + $new) | Sort-Object -Unique | Where-Object {
  $_ -notmatch '(^|/)(node_modules|\.git|\.expo|\.maestri|\.claude|\.idea|\.npm-cache-inspect|__pycache__|dist|web-build|\.temp|\.branches)(/|$)' -and
  $_ -notmatch '(^|/)\.env($|\.)' -and
  $_ -notmatch '\.(zip|log|pyc|backup)$' -and
  $_ -notmatch '(^|/)(PROJECT_INSTRUCTIONS\.md|studypulse-artifact\.md)$' -and
  $_ -notmatch '^entrega-ihc/(privado|renders|\.qa|tmp)/' -and
  (Test-Path -LiteralPath (Join-Path $repoRoot $_) -PathType Leaf)
}
# .env.example e apenas a configuracao publica de desenvolvimento local.
if (Test-Path -LiteralPath (Join-Path $repoRoot 'study-pulse-app/.env.example')) {
  $files += 'study-pulse-app/.env.example'
}
$files = @($files | Sort-Object -Unique)
$stage = Join-Path ([IO.Path]::GetTempPath()) ('studypulse-delivery-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $stage | Out-Null
$manifest = @()
foreach ($relative in $files) {
  $source = Join-Path $repoRoot $relative
  $target = Join-Path $stage $relative
  New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
  Copy-Item -LiteralPath $source -Destination $target
  $manifest += [ordered]@{ path = $relative; sha256 = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant() }
}
$metadata = [ordered]@{
  project = 'StudyPulse'
  generatedAt = [DateTimeOffset]::Now.ToString('o')
  sourceCommit = (git -C $repoRoot rev-parse HEAD).Trim()
  sourceBranch = (git -C $repoRoot branch --show-current).Trim()
  includesWorkingChanges = [bool](@(git -C $repoRoot status --porcelain --untracked-files=no).Count)
  humanValidation = 'Consultar entrega-ihc: resultados P1/P2 e aceite devem conter observacoes reais antes do envio.'
  files = $manifest
}
$json = $metadata | ConvertTo-Json -Depth 6
[IO.File]::WriteAllText((Join-Path $stage 'MANIFESTO_ENTREGA.json'), $json, [Text.UTF8Encoding]::new($false))
New-Item -ItemType Directory -Path (Split-Path -Parent $outputFull) -Force | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory($stage, $outputFull, [IO.Compression.CompressionLevel]::Optimal, $false)
Write-Output "ZIP: $outputFull"
Write-Output "Arquivos de origem: $($files.Count)"
Write-Output "SHA256: $((Get-FileHash -LiteralPath $outputFull -Algorithm SHA256).Hash)"
Write-Output "Copia de montagem preservada: $stage"
