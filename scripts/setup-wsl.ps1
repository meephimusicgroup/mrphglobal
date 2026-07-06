# MRPH Global setup for Windows (requires WSL)
# Run in PowerShell as Administrator for first-time WSL install:
#   wsl --install -d Ubuntu
# Reboot, then in Ubuntu:
#   bash /mnt/c/Users/marte/OneDrive/Desktop/mrphglobal/scripts/bootstrap-wsl.sh
#   cd ~/mrphglobal && ignite chain serve

Write-Host "MRPH Global requires WSL (Ubuntu) for Ignite CLI." -ForegroundColor Yellow
Write-Host ""
Write-Host "Steps:"
Write-Host "  1. PowerShell as Administrator: wsl --install -d Ubuntu"
Write-Host "  2. Reboot Windows"
Write-Host "  3. In Ubuntu (copy OUT of OneDrive, then build):"
Write-Host "     bash /mnt/c/Users/marte/OneDrive/Desktop/mrphglobal/scripts/bootstrap-wsl.sh"
Write-Host "     cd ~/mrphglobal"
Write-Host "     ignite chain serve"
Write-Host ""

if (Get-Command wsl -ErrorAction SilentlyContinue) {
    $wslList = wsl -l -v 2>$null
    if ($LASTEXITCODE -eq 0 -and $wslList -match "Ubuntu") {
        Write-Host "WSL Ubuntu detected. Running bootstrap-wsl.sh..." -ForegroundColor Green
        wsl -d Ubuntu bash -lc "bash /mnt/c/Users/marte/OneDrive/Desktop/mrphglobal/scripts/bootstrap-wsl.sh"
    } else {
        Write-Host "WSL not installed. Run: wsl --install -d Ubuntu" -ForegroundColor Red
    }
} else {
    Write-Host "WSL command not available." -ForegroundColor Red
}
