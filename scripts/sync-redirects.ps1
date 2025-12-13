param(
  [switch]$Apply
)

$Root = Resolve-Path (Join-Path $PSScriptRoot '..')
$Threads = Join-Path $Root 'threads_h'

$rules = @(
  @{ regex='^hoodie-.*\.html$'; target='hoodies' },
  @{ regex='^camiseta-.*\.html$'; target='camisetas' },
  @{ regex='^pantalon-.*\.html$'; target='pantalones' }
)

Write-Host "$(if($Apply){'APPLY MODE'}else{'DRY RUN'}): scanning $Threads"

$files = Get-ChildItem -Path $Threads -File -Filter '*.html' -ErrorAction SilentlyContinue

$actions = @()

foreach($f in $files){
  foreach($r in $rules){
    if($f.Name -match $r.regex){
      $targetDir = Join-Path $Threads $r.target
      $targetPath = Join-Path $targetDir $f.Name
      if(-not (Test-Path $targetPath)){
        $actions += @{ type='mkdir'; dir=$targetDir }
        $actions += @{ type='move'; from=$f.FullName; to=$targetPath }
        $rel = [System.IO.Path]::GetRelativePath((Split-Path $f.FullName -Parent), $targetPath) -replace '\\','/'
        $actions += @{ type='redirect'; path=$f.FullName; targetRel=$rel }
      } else {
        $rel = [System.IO.Path]::GetRelativePath((Split-Path $f.FullName -Parent), $targetPath) -replace '\\','/'
        $actions += @{ type='redirect-only'; path=$f.FullName; targetRel=$rel }
      }
    }
  }
}

if($actions.Count -eq 0){ Write-Host 'No actions required.'; exit 0 }

Write-Host 'Planned actions:'
foreach($a in $actions){
  $left = $null
  if($a.from){ $left = $a.from } elseif($a.path){ $left = $a.path } elseif($a.dir){ $left = $a.dir }
  $right = ''
  if($a.to){ $right = '-> ' + $a.to } elseif($a.targetRel){ $right = '-> ' + $a.targetRel }
  Write-Host (' - {0} {1} {2}' -f $a.type, $left, $right)
}

if(-not $Apply){ Write-Host "Run `.\sync-redirects.ps1 -Apply` to perform these changes.`n"; exit 0 }

foreach($a in $actions){
  try{
    switch($a.type){
      'mkdir' { if(-not (Test-Path $a.dir)){ New-Item -ItemType Directory -Path $a.dir | Out-Null; Write-Host 'mkdir' $a.dir } }
      'move' { Move-Item -LiteralPath $a.from -Destination $a.to -Force; Write-Host 'moved' $a.from '->' $a.to }
      'redirect' { $html = "<!doctype html><html lang='es'><head><meta charset='utf-8'><meta http-equiv='refresh' content='0; url=$($a.targetRel)'><title>Redirigiendo…</title></head><body>La página se movió. <a href='$($a.targetRel)'>Haz clic aquí</a>.</body></html>"; Set-Content -LiteralPath $a.path -Value $html -Force; Write-Host 'wrote redirect' $a.path }
      'redirect-only' { $html = "<!doctype html><html lang='es'><head><meta charset='utf-8'><meta http-equiv='refresh' content='0; url=$($a.targetRel)'><title>Redirigiendo…</title></head><body>La página se movió. <a href='$($a.targetRel)'>Haz clic aquí</a>.</body></html>"; Set-Content -LiteralPath $a.path -Value $html -Force; Write-Host 'wrote redirect' $a.path }
    }
  }catch{
    Write-Warning "Error applying action: $_"
  }
}

Write-Host 'Completed.'
