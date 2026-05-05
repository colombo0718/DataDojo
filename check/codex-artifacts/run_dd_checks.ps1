$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$artifactDir = Join-Path $PSScriptRoot 'artifacts'
$staticOut = Join-Path $artifactDir 'dd-static-results.json'
$browserOut = Join-Path $artifactDir 'dd-browser-results.json'
$port = 4173
$url = "http://127.0.0.1:$port"

New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null

Write-Host "[1/3] Running static checks..."
node (Join-Path $PSScriptRoot 'dd_static_check.cjs') $staticOut | Out-Host

$server = $null
try {
  Write-Host "[2/3] Starting local static server on $url ..."
  $server = Start-Process -FilePath 'python' `
    -ArgumentList '-m', 'http.server', $port, '--bind', '127.0.0.1' `
    -WorkingDirectory $repoRoot `
    -WindowStyle Hidden `
    -PassThru

  Start-Sleep -Seconds 2

  Write-Host "[3/3] Running browser checks..."
  node (Join-Path $PSScriptRoot 'dd_browser_check.cjs') $url $browserOut | Out-Host
}
finally {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -Force
  }
}
