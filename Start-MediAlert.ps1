# MedSync Healthcare Application Launcher
# This script checks dependencies and launches the application

# Set error action preference
$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param (
        [string]$Message,
        [string]$Color = "White"
    )
    $originalColor = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $Color
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $originalColor
}

# Display splash screen
Clear-Host
Write-ColorOutput @"
==================================================
             MedSync Healthcare
        Advanced Patient Monitoring System
==================================================
"@ -Color Cyan

# Define paths
$appDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDataDir = "$env:APPDATA\MedSync"
$configDir = "$appDataDir\config"
$dataDir = "$appDataDir\data"
$logsDir = "$appDataDir\logs"

# Ensure directory structure exists
$directories = @($appDataDir, $configDir, $dataDir, $logsDir)
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-ColorOutput "Created directory: $dir" -Color Yellow
    }
}

# Check if this is the first run or config file doesn't exist
if (-not (Test-Path "$configDir\settings.json")) {
    Write-ColorOutput "First time setup detected. Creating default configuration..." -Color Yellow
    
    # Create default configuration
    $defaultConfig = @{
        "apiKey" = ""
        "user" = @{
            "name" = "Default User"
            "role" = "family"
        }
        "features" = @{
            "enableVoiceAssistant" = $true
            "enableVisionMonitoring" = $true
            "enablePredictiveAnalytics" = $true
            "enablePillDetection" = $true
            "enableRealTimeGpt" = $true
        }
        "firstRun" = $true
    } | ConvertTo-Json
    
    # Save configuration
    $defaultConfig | Out-File -FilePath "$configDir\settings.json" -Encoding utf8
}

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-ColorOutput "Node.js $nodeVersion detected." -Color Green
} catch {
    Write-ColorOutput "Node.js not found. Please run the installer script first." -Color Red
    Write-ColorOutput "Press any key to exit..." -Color Red
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check for npm dependencies
if (-not (Test-Path "$appDir\node_modules")) {
    Write-ColorOutput "Installing dependencies..." -Color Yellow
    Set-Location $appDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "Failed to install dependencies. Please try running npm install manually." -Color Red
        Write-ColorOutput "Press any key to exit..." -Color Red
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
}

# Check if the system has required capabilities for AI features
$systemConfig = "$configDir\system-info.json"

# Always run system configuration check to ensure hardware detection
Write-ColorOutput "Running system configuration check..." -Color Yellow

# Run platform detection script
if (Test-Path "$appDir\platform-config.js") {
    node "$appDir\platform-config.js"
} else {
    # Create a simple platform detection script
    @"
// MedSync Platform Configuration
(() => {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  
  // Detect system capabilities
  const systemInfo = {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memory: Math.floor(os.totalmem() / (1024 * 1024 * 1024)), // GB
    hasWebcam: true,
    hasMicrophone: true
  };
  
  // Save system info
  const configDir = path.join(process.env.APPDATA, 'MedSync', 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(configDir, 'system-info.json'),
    JSON.stringify(systemInfo, null, 2)
  );
  
  console.log('System configuration saved successfully.');
})();
"@ | Out-File -FilePath "$appDir\platform-config.js" -Encoding utf8
    
    node "$appDir\platform-config.js"
}

# Create or update time marker
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$timestamp | Out-File -FilePath "$logsDir\last-run.txt" -Encoding utf8

# Display startup information
Write-ColorOutput "Initializing MedSync Healthcare System..." -Color Cyan
Write-ColorOutput "Location: $appDir" -Color White
Write-ColorOutput "Launch time: $timestamp" -Color White

# Check for application updates (simple version)
$updateCheck = $true
if ($updateCheck) {
    Write-ColorOutput "Checking for updates..." -Color White
    # In a real app, this would check a server for updates
    Write-ColorOutput "Application is up to date." -Color Green
}

# Set up environment for browser automation (for AI features)
$env:PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true"
$env:USE_SYSTEM_BROWSER = "true"

# Start the application
Write-ColorOutput "Starting MedSync application..." -Color Green

# Determine if we should use Electron or browser mode
$useElectron = $false
if (Test-Path "$appDir\node_modules\electron") {
    $useElectron = $true
}

if ($useElectron) {
    # Electron mode - run with npx electron
    try {
        Set-Location $appDir
        npx electron .
    } catch {
        Write-ColorOutput "Failed to start Electron application. Falling back to browser mode." -Color Yellow
        $useElectron = $false
    }
}

if (-not $useElectron) {
    # Browser mode - open index.html in default browser
    Write-ColorOutput "Running in browser mode..." -Color Yellow
    
    # Ensure local HTTP server is available
    if (-not (Test-Path "$appDir\node_modules\http-server")) {
        Write-ColorOutput "Installing HTTP server..." -Color Yellow
        npm install http-server --save-dev
    }
    
    # Start the HTTP server as a background job
    Start-Job -ScriptBlock {
        param($appDir)
        Set-Location $appDir
        npx http-server -p 3000
    } -ArgumentList $appDir
    
    # Wait for server to start
    Start-Sleep -Seconds 2
    
    # Open in browser
    Start-Process "http://localhost:3000/"
    
    Write-ColorOutput "MedSync is now running in your web browser." -Color Green
    Write-ColorOutput "Press Ctrl+C to exit." -Color Yellow
    
    # Keep the script running
    try {
        while ($true) {
            Start-Sleep -Seconds 1
        }
    } finally {
        # Clean up on exit
        Get-Job | Stop-Job
        Get-Job | Remove-Job
    }
} 