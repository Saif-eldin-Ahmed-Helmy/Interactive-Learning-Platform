$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeRoot = Join-Path $projectRoot '.demo\runtimes'

function Install-PortableRuntime($Name, $Url, $Sha256, $Executable) {
    $destination = Join-Path $runtimeRoot $Name
    $binary = Join-Path $destination $Executable
    if (Test-Path -LiteralPath $binary) { return $binary }
    New-Item -ItemType Directory -Force -Path $destination | Out-Null
    $archive = Join-Path $destination 'download.zip'
    Write-Host "Downloading $Name for this computer (first run only)..."
    Invoke-WebRequest -UseBasicParsing -Uri $Url -OutFile $archive
    if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash -ne $Sha256) {
        throw "The $Name download failed its integrity check. Please run again."
    }
    Expand-Archive -LiteralPath $archive -DestinationPath $destination -Force
    Remove-Item -LiteralPath $archive
    if (!(Test-Path -LiteralPath $binary)) { throw "Could not unpack $Name." }
    return $binary
}

try {
    if (![Environment]::Is64BitOperatingSystem -or $env:PROCESSOR_ARCHITECTURE -eq 'ARM64') {
        throw 'This launcher requires an Intel/AMD 64-bit Windows 10 or 11 computer.'
    }
    $nodeBinary = Install-PortableRuntime 'node' `
        'https://nodejs.org/dist/v22.20.0/node-v22.20.0-win-x64.zip' `
        'bb819d6eb8f5bfda294bbc83a7e4ec6539da67c4233d54b0d655b9248b15e29d' `
        'node-v22.20.0-win-x64\node.exe'
    $mongoBinary = Install-PortableRuntime 'mongodb' `
        'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.16.zip' `
        '34eb6795860e29bdf8e5cc9cb4cbba2c73295a25c60204667029d5f3614fe807' `
        'mongodb-win32-x86_64-windows-8.0.16\bin\mongod.exe'
    $env:PATH = (Split-Path -Parent $nodeBinary) + ';' + $env:PATH
    & $nodeBinary (Join-Path $PSScriptRoot 'demo.cjs') $mongoBinary
    exit $LASTEXITCODE
} catch {
    Write-Host "Startup failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
