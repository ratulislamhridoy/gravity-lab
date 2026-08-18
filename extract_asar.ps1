param (
    [string]$asarPath = "C:\Users\mdrat\Downloads\Pixeva Ai-Setup-1.0.5\resources\app.asar",
    [string]$outDir = "d:\softower making\Gravity Ai\extracted_pixeva"
)

$bytes = [System.IO.File]::ReadAllBytes($asarPath)
$headerJsonSize = [System.BitConverter]::ToUInt32($bytes, 12)
$headerJsonBytes = $bytes[16..(16 + $headerJsonSize - 1)]
$headerJsonText = [System.Text.Encoding]::UTF8.GetString($headerJsonBytes)
$header = $headerJsonText | ConvertFrom-Json
$dataOffset = 16 + $headerJsonSize

function Extract-Node($node, $currentPath) {
    if ($node.files) {
        if (-not (Test-Path $currentPath)) { New-Item -ItemType Directory -Path $currentPath -Force | Out-Null }
        $node.files.psobject.properties | ForEach-Object {
            Extract-Node $_.Value (Join-Path $currentPath $_.Name)
        }
    } else {
        $offset = [long]$node.offset + $dataOffset
        $size = [long]$node.size
        $dir = Split-Path $currentPath -Parent
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
        if ($size -gt 0) {
            $fileBytes = [byte[]]::new($size)
            [Array]::Copy($bytes, $offset, $fileBytes, 0, $size)
            [System.IO.File]::WriteAllBytes($currentPath, $fileBytes)
        } else {
            [System.IO.File]::WriteAllBytes($currentPath, @())
        }
    }
}

Extract-Node $header $outDir
Write-Host "Extraction Complete!"
