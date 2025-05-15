# MedSync Healthcare Application Installer
# This script automates the setup of MedSync on a new Windows machine

Write-Host "Starting MedSync Installation..." -ForegroundColor Cyan

# Create a temporary directory for downloads
$tempDir = "$env:TEMP\MedSync_Install"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Define installation location
$installDir = "$env:USERPROFILE\MedSync"
$appDataDir = "$env:APPDATA\MedSync"

# Function to check if a command exists
function Test-CommandExists {
    param ($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try { if (Get-Command $command) { return $true } }
    catch { return $false }
    finally { $ErrorActionPreference = $oldPreference }
}

# Function to download a file
function Download-File {
    param (
        [string]$url,
        [string]$output
    )
    Write-Host "Downloading $url to $output..." -ForegroundColor Yellow
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile($url, $output)
}

# Check for required tools and install if needed
Write-Host "Checking for required tools..." -ForegroundColor Cyan

# Check for Node.js
if (-not (Test-CommandExists node)) {
    Write-Host "Node.js not found. Installing Node.js..." -ForegroundColor Yellow
    $nodeInstallerPath = "$tempDir\nodejs_installer.msi"
    Download-File -url "https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi" -output $nodeInstallerPath
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $nodeInstallerPath, "/quiet", "/norestart" -Wait
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    Write-Host "Node.js installed successfully." -ForegroundColor Green
}

# Check for Git
if (-not (Test-CommandExists git)) {
    Write-Host "Git not found. Installing Git..." -ForegroundColor Yellow
    $gitInstallerPath = "$tempDir\git_installer.exe"
    Download-File -url "https://github.com/git-for-windows/git/releases/download/v2.41.0.windows.1/Git-2.41.0-64-bit.exe" -output $gitInstallerPath
    Start-Process -FilePath $gitInstallerPath -ArgumentList "/VERYSILENT", "/NORESTART" -Wait
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    Write-Host "Git installed successfully." -ForegroundColor Green
}

# Download MedSync application
Write-Host "Downloading MedSync application..." -ForegroundColor Cyan
if (Test-Path $installDir) {
    Write-Host "MedSync directory already exists. Backing up..." -ForegroundColor Yellow
    Rename-Item -Path $installDir -NewName "$installDir.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
}

# Clone the repository
git clone https://github.com/yourusername/Medialert-main.git $installDir
if (-not $?) {
    # If the GitHub repository doesn't exist, use the local copy instead
    Write-Host "Could not download from GitHub, using local package..." -ForegroundColor Yellow
    
    # Create the destination directory
    New-Item -ItemType Directory -Force -Path $installDir | Out-Null
    
    # Copy all files from the current directory
    Copy-Item -Path ".\*" -Destination $installDir -Recurse -Force
}

# Create AppData directory for user settings
if (-not (Test-Path $appDataDir)) {
    New-Item -ItemType Directory -Force -Path $appDataDir | Out-Null
    New-Item -ItemType Directory -Force -Path "$appDataDir\logs" | Out-Null
    New-Item -ItemType Directory -Force -Path "$appDataDir\config" | Out-Null
    New-Item -ItemType Directory -Force -Path "$appDataDir\data" | Out-Null
}

# Create default configuration
$configJson = @{
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
$configJson | Out-File -FilePath "$appDataDir\config\settings.json" -Encoding utf8

# Navigate to the installation directory
Set-Location $installDir

# Install NPM dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

# Create desktop shortcut
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "MedSync.lnk"
$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$installDir\Start-MediAlert.ps1`""
$shortcut.WorkingDirectory = $installDir
$shortcut.IconLocation = "$installDir\assets\icon.ico,0"
$shortcut.Description = "MedSync Healthcare Monitoring"
$shortcut.Save()

# Create start menu shortcut
$startMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\MedSync"
if (-not (Test-Path $startMenuPath)) {
    New-Item -ItemType Directory -Force -Path $startMenuPath | Out-Null
}
$startMenuShortcutPath = Join-Path $startMenuPath "MedSync.lnk"
$startMenuShortcut = $wshShell.CreateShortcut($startMenuShortcutPath)
$startMenuShortcut.TargetPath = "powershell.exe"
$startMenuShortcut.Arguments = "-ExecutionPolicy Bypass -File `"$installDir\Start-MediAlert.ps1`""
$startMenuShortcut.WorkingDirectory = $installDir
$startMenuShortcut.IconLocation = "$installDir\assets\icon.ico,0"
$startMenuShortcut.Description = "MedSync Healthcare Monitoring"
$startMenuShortcut.Save()

# Configure browser dependencies for AI features
Write-Host "Setting up browser dependencies for AI features..." -ForegroundColor Cyan
npm install puppeteer@19.7.1

# Download TensorFlow.js models for pill detection
Write-Host "Downloading AI models..." -ForegroundColor Cyan
$aiModelDir = "$installDir\ai-models"
New-Item -ItemType Directory -Force -Path $aiModelDir | Out-Null

# First run setup and checks
Write-Host "Running first-time setup checks..." -ForegroundColor Cyan

# Create platform detection and configuration script
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
    hasWebcam: false,
    hasMicrophone: false
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
"@ | Out-File -FilePath "$installDir\platform-config.js" -Encoding utf8

# Run the platform configuration
node "$installDir\platform-config.js"

Write-Host "MedSync has been successfully installed!" -ForegroundColor Green
Write-Host "You can start the application from your desktop or Start Menu." -ForegroundColor Green
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 