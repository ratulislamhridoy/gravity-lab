$bkashUrl = "https://www.logo.wine/a/logo/BKash/BKash-Icon-Logo.wine.svg"
$nagadUrl = "https://www.logo.wine/a/logo/Nagad/Nagad-Logo.wine.svg"

$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

Invoke-WebRequest -Uri $bkashUrl -OutFile "d:\softower making\Gravity Ai\bkash.svg" -Headers $headers -TimeoutSec 15
Invoke-WebRequest -Uri $nagadUrl -OutFile "d:\softower making\Gravity Ai\nagad.svg" -Headers $headers -TimeoutSec 15

Write-Output "completed download"
