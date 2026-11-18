[CmdletBinding()]
param(
  [string]$ApiUrl = 'http://localhost:54321',
  [string]$P1Email = 'p1.demo@studypulse.local',
  [string]$P1Password = 'StudyPulseP1!2026',
  [string]$P2Email = 'p2.demo@studypulse.local',
  [string]$P2Password = 'StudyPulseP2!2026',
  [switch]$IncludeCompletedCheckIns
)

$ErrorActionPreference = 'Stop'

function Get-DotEnvValue {
  param([string]$Path, [string]$Name)
  if (-not (Test-Path -LiteralPath $Path)) { return $null }
  $line = Get-Content -LiteralPath $Path | Where-Object { $_ -match "^$([regex]::Escape($Name))=" } | Select-Object -First 1
  if (-not $line) { return $null }
  return $line.Substring($line.IndexOf('=') + 1).Trim().Trim('"').Trim("'")
}

function Assert-LocalApiUrl {
  param([string]$Url)
  $uri = [Uri]$Url
  $hostName = $uri.DnsSafeHost
  $address = $null
  $isAddress = [Net.IPAddress]::TryParse($hostName, [ref]$address)
  $isPrivate = $hostName -eq 'localhost' -or ($isAddress -and (
    [Net.IPAddress]::IsLoopback($address) -or
    $hostName -match '^10\.' -or
    $hostName -match '^192\.168\.' -or
    $hostName -match '^172\.(1[6-9]|2[0-9]|3[01])\.'
  ))
  if ($uri.Scheme -ne 'http' -or -not $isPrivate) {
    throw 'Este script aceita somente uma API HTTP local ou de rede privada.'
  }
}

function Invoke-JsonApi {
  param(
    [ValidateSet('GET', 'POST')][string]$Method,
    [string]$Uri,
    [hashtable]$Headers,
    [object]$Body
  )
  $request = @{
    Method = $Method
    Uri = $Uri
    Headers = $Headers
    UseBasicParsing = $true
  }
  if ($null -ne $Body) {
    $request.ContentType = 'application/json'
    $request.Body = $Body | ConvertTo-Json -Depth 8 -Compress
  }
  $response = Invoke-WebRequest @request
  if ([string]::IsNullOrWhiteSpace($response.Content)) { return $null }
  return $response.Content | ConvertFrom-Json
}

function New-UserSession {
  param([string]$Email, [string]$Password, [string]$Name, [string]$BaseUrl, [string]$AnonKey)
  $publicHeaders = @{ apikey = $AnonKey }
  try {
    Invoke-JsonApi -Method POST -Uri "$BaseUrl/auth/v1/signup" -Headers $publicHeaders -Body @{
      email = $Email
      password = $Password
      data = @{ name = $Name }
    } | Out-Null
  } catch {
    # A conta pode existir de uma execução anterior. O login abaixo é a validação definitiva.
  }

  $session = Invoke-JsonApi -Method POST -Uri "$BaseUrl/auth/v1/token?grant_type=password" -Headers $publicHeaders -Body @{
    email = $Email
    password = $Password
  }
  if (-not $session.access_token -or -not $session.user.id) {
    throw "Não foi possível abrir a sessão local de $Email."
  }
  return $session
}

function Get-UserHeaders {
  param([object]$Session, [string]$AnonKey, [string]$Prefer = 'return=representation')
  return @{
    apikey = $AnonKey
    Authorization = "Bearer $($Session.access_token)"
    Prefer = $Prefer
  }
}

function Get-Collection {
  param([object]$Value)
  if ($null -eq $Value) { return ,@() }
  return ,@($Value)
}

function Ensure-Squad {
  param([object]$P1, [object]$P2, [string]$BaseUrl, [string]$AnonKey)
  $p1Headers = Get-UserHeaders -Session $P1 -AnonKey $AnonKey
  $p1Memberships = Get-Collection (Invoke-JsonApi -Method GET -Uri "$BaseUrl/rest/v1/squad_members?select=squad_id&user_id=eq.$($P1.user.id)&limit=1" -Headers $p1Headers)
  if ($p1Memberships.Count -eq 0) {
    $squadId = Invoke-JsonApi -Method POST -Uri "$BaseUrl/rest/v1/rpc/rpc_create_squad" -Headers $p1Headers -Body @{
      squad_name = 'Equipe StudyPulse'
      squad_subtitle = 'Grupo local para demonstração'
      season_end = ([DateTime]::UtcNow.AddDays(30).ToString('o'))
    }
  } else {
    $squadId = $p1Memberships[0].squad_id
  }

  $squads = Get-Collection (Invoke-JsonApi -Method GET -Uri "$BaseUrl/rest/v1/squads?select=id,invite_code,created_by&id=eq.$squadId" -Headers $p1Headers)
  if ($squads.Count -ne 1) { throw 'Não foi possível localizar o squad local.' }
  if ($squads[0].created_by -ne $P1.user.id) { throw 'P1 deve ser criador do grupo de teste. Use contas novas; dados existentes foram preservados.' }

  $p2Headers = Get-UserHeaders -Session $P2 -AnonKey $AnonKey
  $p2Memberships = Get-Collection (Invoke-JsonApi -Method GET -Uri "$BaseUrl/rest/v1/squad_members?select=squad_id&user_id=eq.$($P2.user.id)&limit=1" -Headers $p2Headers)
  if ($p2Memberships.Count -eq 0) {
    Invoke-JsonApi -Method POST -Uri "$BaseUrl/rest/v1/rpc/rpc_join_squad" -Headers $p2Headers -Body @{ code = $squads[0].invite_code } | Out-Null
  } elseif ($p2Memberships[0].squad_id -ne $squadId) {
    throw 'P1 e P2 estão em grupos diferentes. Use contas novas; dados existentes foram preservados.'
  }
  return $squadId
}

function Ensure-Task {
  param([object]$Session, [string]$BaseUrl, [string]$AnonKey, [string]$Today, [string]$Title, [string]$Category, [bool]$Complete)
  $headers = Get-UserHeaders -Session $Session -AnonKey $AnonKey
  $tasks = Get-Collection (Invoke-JsonApi -Method GET -Uri "$BaseUrl/rest/v1/daily_tasks?select=id,title,done&user_id=eq.$($Session.user.id)&task_date=eq.$Today" -Headers $headers)
  $task = $tasks | Where-Object { $_.title -eq $Title } | Select-Object -First 1
  if (-not $task) {
    $created = Get-Collection (Invoke-JsonApi -Method POST -Uri "$BaseUrl/rest/v1/daily_tasks" -Headers $headers -Body @{
      user_id = $Session.user.id
      title = $Title
      category = $Category
      task_date = $Today
    })
    $task = $created[0]
  }
  if ($Complete -and -not $task.done) {
    Invoke-JsonApi -Method POST -Uri "$BaseUrl/rest/v1/rpc/rpc_complete_task" -Headers $headers -Body @{ task_id = $task.id } | Out-Null
  }
}

function Ensure-Goal {
  param([object]$Session, [string]$BaseUrl, [string]$AnonKey, [string]$Title, [string]$Category, [double]$Progress)
  $headers = Get-UserHeaders -Session $Session -AnonKey $AnonKey
  $goals = Get-Collection (Invoke-JsonApi -Method GET -Uri "$BaseUrl/rest/v1/goals?select=id,title&user_id=eq.$($Session.user.id)" -Headers $headers)
  if (-not ($goals | Where-Object { $_.title -eq $Title } | Select-Object -First 1)) {
    $created = Get-Collection (Invoke-JsonApi -Method POST -Uri "$BaseUrl/rest/v1/goals" -Headers $headers -Body @{
      user_id = $Session.user.id
      title = $Title
      category = $Category
      due_date = ([DateTime]::UtcNow.AddDays(14).ToString('yyyy-MM-dd'))
      icon = 'book-open'
    })
    if ($Progress -gt 0) {
      Invoke-JsonApi -Method POST -Uri "$BaseUrl/rest/v1/rpc/rpc_update_goal_progress" -Headers $headers -Body @{
        goal_id = $created[0].id
        new_progress = $Progress
      } | Out-Null
    }
  }
}

function Ensure-CheckIn {
  param([object]$Session, [string]$BaseUrl, [string]$AnonKey, [string]$Today, [int]$Minutes)
  $headers = Get-UserHeaders -Session $Session -AnonKey $AnonKey
  $checkIns = Get-Collection (Invoke-JsonApi -Method GET -Uri "$BaseUrl/rest/v1/check_ins?select=id&user_id=eq.$($Session.user.id)&check_date=eq.$Today" -Headers $headers)
  if ($checkIns.Count -eq 0) {
    Invoke-JsonApi -Method POST -Uri "$BaseUrl/rest/v1/rpc/rpc_check_in" -Headers $headers -Body @{ input_minutes = $Minutes } | Out-Null
  }
}

Assert-LocalApiUrl -Url $ApiUrl
$ApiUrl = $ApiUrl.TrimEnd('/')
$repoRoot = Split-Path -Parent $PSScriptRoot
$anonKey = Get-DotEnvValue -Path (Join-Path $repoRoot '.env') -Name 'EXPO_PUBLIC_SUPABASE_ANON_KEY'
if (-not $anonKey) {
  $anonKey = Get-DotEnvValue -Path (Join-Path $repoRoot '.env.example') -Name 'EXPO_PUBLIC_SUPABASE_ANON_KEY'
}
if (-not $anonKey) { throw 'A chave pública anon local não foi encontrada.' }

Invoke-WebRequest -UseBasicParsing -Uri "$ApiUrl/health" | Out-Null

$p1 = New-UserSession -Email $P1Email -Password $P1Password -Name 'Participante P1' -BaseUrl $ApiUrl -AnonKey $anonKey
$p2 = New-UserSession -Email $P2Email -Password $P2Password -Name 'Participante P2' -BaseUrl $ApiUrl -AnonKey $anonKey
$squadId = Ensure-Squad -P1 $p1 -P2 $p2 -BaseUrl $ApiUrl -AnonKey $anonKey

try { $timeZone = [TimeZoneInfo]::FindSystemTimeZoneById('E. South America Standard Time') }
catch { $timeZone = [TimeZoneInfo]::FindSystemTimeZoneById('America/Sao_Paulo') }
$today = [TimeZoneInfo]::ConvertTimeFromUtc([DateTime]::UtcNow, $timeZone).ToString('yyyy-MM-dd')

Ensure-Goal -Session $p1 -BaseUrl $ApiUrl -AnonKey $anonKey -Title 'Concluir apresentação da Sprint' -Category 'Faculdade' -Progress 0.65
Ensure-Goal -Session $p2 -BaseUrl $ApiUrl -AnonKey $anonKey -Title 'Revisar conteúdos de IHC' -Category 'Estudos' -Progress 0.4
# Deixe o check-in disponivel para a tarefa de P1/P2. A opcao e somente para demonstracoes tecnicas.
if ($IncludeCompletedCheckIns) {
  Ensure-CheckIn -Session $p1 -BaseUrl $ApiUrl -AnonKey $anonKey -Today $today -Minutes 45
  Ensure-CheckIn -Session $p2 -BaseUrl $ApiUrl -AnonKey $anonKey -Today $today -Minutes 30
}
Ensure-Task -Session $p1 -BaseUrl $ApiUrl -AnonKey $anonKey -Today $today -Title 'Validar fluxo de autenticação' -Category 'Projeto' -Complete $true
Ensure-Task -Session $p1 -BaseUrl $ApiUrl -AnonKey $anonKey -Today $today -Title 'Revisar conteúdo da apresentação' -Category 'Faculdade' -Complete $true
Ensure-Task -Session $p1 -BaseUrl $ApiUrl -AnonKey $anonKey -Today $today -Title 'Ensaiar demonstração do aplicativo' -Category 'Faculdade' -Complete $false
Ensure-Task -Session $p2 -BaseUrl $ApiUrl -AnonKey $anonKey -Today $today -Title 'Preparar perguntas técnicas' -Category 'Projeto' -Complete $true
Ensure-Task -Session $p2 -BaseUrl $ApiUrl -AnonKey $anonKey -Today $today -Title 'Revisar protótipo' -Category 'IHC' -Complete $false

Write-Output "Fixtures locais prontas para $today (squad $squadId)."
Write-Output "P1: $P1Email"
Write-Output "P2: $P2Email"
