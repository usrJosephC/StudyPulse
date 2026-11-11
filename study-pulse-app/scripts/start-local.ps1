param(
  [switch]$SkipExpo
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

function Get-ActiveLanAddress {
  $route = Get-NetRoute -DestinationPrefix '0.0.0.0/0' |
    Where-Object { $_.State -eq 'Alive' } |
    Sort-Object RouteMetric, InterfaceMetric |
    Select-Object -First 1

  if (-not $route) {
    throw 'Nenhuma rota IPv4 ativa foi encontrada.'
  }

  $address = Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $route.InterfaceIndex |
    Where-Object { $_.AddressState -eq 'Preferred' -and $_.IPAddress -notlike '169.254.*' } |
    Select-Object -First 1 -ExpandProperty IPAddress

  if (-not $address) {
    throw 'Não foi possível descobrir o IPv4 da rede local.'
  }

  return $address
}

function Update-LocalEnvironment([string]$address) {
  $envPath = Join-Path $projectRoot '.env'
  if (-not (Test-Path -LiteralPath $envPath)) {
    throw 'Arquivo .env não encontrado. Copie .env.example e configure a chave do Supabase.'
  }

  $content = Get-Content -Raw -Encoding utf8 -LiteralPath $envPath
  $urlLine = "EXPO_PUBLIC_SUPABASE_URL=http://${address}:54321"
  if ($content -match '(?m)^EXPO_PUBLIC_SUPABASE_URL=') {
    $content = $content -replace '(?m)^EXPO_PUBLIC_SUPABASE_URL=.*$', $urlLine
  } else {
    $content = $content.TrimEnd() + "`n$urlLine`n"
  }

  [IO.File]::WriteAllText($envPath, $content, [Text.UTF8Encoding]::new($false))
  Write-Host "Supabase local configurado em http://${address}:54321" -ForegroundColor Cyan
}

function Start-DockerIfNeeded {
  docker info *> $null
  if ($LASTEXITCODE -eq 0) { return }

  $dockerDesktop = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
  if (-not (Test-Path -LiteralPath $dockerDesktop)) {
    throw 'Docker Desktop não foi encontrado.'
  }

  Write-Host 'Iniciando Docker Desktop...' -ForegroundColor Yellow
  Start-Process -FilePath $dockerDesktop -WindowStyle Hidden
  for ($attempt = 0; $attempt -lt 18; $attempt++) {
    Start-Sleep -Seconds 5
    docker info *> $null
    if ($LASTEXITCODE -eq 0) { return }
  }

  throw 'Docker Desktop não ficou disponível dentro do tempo esperado.'
}

$lanAddress = Get-ActiveLanAddress
Update-LocalEnvironment $lanAddress
Start-DockerIfNeeded

$localHealthUrl = 'http://127.0.0.1:54321/health'
Write-Host 'Garantindo que o backend Docker Compose esteja iniciado...' -ForegroundColor Cyan
docker-compose up -d
if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel iniciar o Docker Compose. Verifique o Docker Desktop e execute docker-compose logs.' }

$composeRunning = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
  try {
    $localHealth = Invoke-WebRequest -UseBasicParsing -Uri $localHealthUrl -TimeoutSec 3
    if ($localHealth.StatusCode -eq 200) {
      $composeRunning = $true
      break
    }
  } catch {
    Start-Sleep -Seconds 2
  }
}

if (-not $composeRunning) {
  throw 'O gateway Docker Compose nao respondeu em http://127.0.0.1:54321/health apos 60 segundos. Confira docker-compose ps/logs; nao inicie a Supabase CLI junto deste backend.'
}
Write-Host 'Backend Docker Compose pronto.' -ForegroundColor Cyan
$healthUrl = "http://${lanAddress}:54321/auth/v1/health"
$health = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -TimeoutSec 10
if ($health.StatusCode -ne 200) { throw "Supabase não respondeu em $healthUrl." }
Write-Host "Backend acessível pelo celular: $healthUrl" -ForegroundColor Green

if (-not $SkipExpo) {
  Write-Host 'Iniciando Expo em modo LAN...' -ForegroundColor Cyan
  npx expo start --lan
}
