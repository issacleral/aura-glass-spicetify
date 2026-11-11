# Sube los cambios a GitHub y vacía la caché de jsDelivr.
#
# El Marketplace de Spicetify descarga el tema a través de jsDelivr, que
# guarda la rama main en caché durante horas. Sin este paso, quien instale
# o reinstale el tema seguiría recibiendo la versión anterior.
#
# Uso (desde esta carpeta):  .\publicar.ps1 "Describe el cambio"

param(
  [Parameter(Mandatory = $true)][string]$Mensaje
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  git commit -m $Mensaje
}
git push origin main

$repo = "issacleral/aura-glass-spicetify"
$archivos = "manifest.json", "user.css", "color.ini", "theme.js", "README.md", "preview.png"

Write-Host "Vaciando la caché de jsDelivr..."
foreach ($f in $archivos) {
  $r = Invoke-RestMethod "https://purge.jsdelivr.net/gh/$repo@main/$f"
  Write-Host ("  {0,-14} {1}" -f $f, $r.status)
}

Write-Host ""
Write-Host "Listo. En Spotify basta con reiniciarlo para ver el CSS y el JS nuevos;"
Write-Host "si cambiaste manifest.json, reinstala el tema desde el Marketplace."
