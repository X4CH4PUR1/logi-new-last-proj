<#
.SYNOPSIS
  Serves this folder over HTTP for local development.

.DESCRIPTION
  The site is made of ES modules, which browsers refuse to load from file://
  for security reasons. So it needs a web server — any web server — and this
  is a dependency-free one built on .NET's HttpListener, for machines without
  Node.js or Python installed.

  It serves static files only. There is no build step to run: what is in this
  folder is exactly what GitHub Pages will serve.

.PARAMETER Port
  Port to listen on. Default 8080.

.PARAMETER NoBrowser
  Do not open a browser window on start.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tools\serve.ps1
  powershell -ExecutionPolicy Bypass -File tools\serve.ps1 -Port 3000
#>

[CmdletBinding()]
param(
  [int]$Port = 8080,
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$prefix = "http://localhost:$Port/"

$mime = @{
  '.html'  = 'text/html; charset=utf-8'
  '.js'    = 'text/javascript; charset=utf-8'
  '.mjs'   = 'text/javascript; charset=utf-8'
  '.css'   = 'text/css; charset=utf-8'
  '.json'  = 'application/json; charset=utf-8'
  '.svg'   = 'image/svg+xml'
  '.woff2' = 'font/woff2'
  '.woff'  = 'font/woff'
  '.png'   = 'image/png'
  '.jpg'   = 'image/jpeg'
  '.jpeg'  = 'image/jpeg'
  '.webp'  = 'image/webp'
  '.gif'   = 'image/gif'
  '.ico'   = 'image/x-icon'
  '.txt'   = 'text/plain; charset=utf-8'
  '.md'    = 'text/markdown; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
} catch {
  Write-Host ''
  Write-Host "Could not listen on $prefix" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor DarkGray
  Write-Host ''
  Write-Host 'Try a different port:  tools\serve.ps1 -Port 8081' -ForegroundColor Yellow
  Write-Host 'Or run this once from an elevated prompt to grant permission:' -ForegroundColor Yellow
  Write-Host "  netsh http add urlacl url=$prefix user=$env:USERNAME" -ForegroundColor DarkGray
  exit 1
}

Write-Host ''
Write-Host '  LOGIMOTORS  ' -ForegroundColor Black -BackgroundColor Yellow -NoNewline
Write-Host "  serving $root"
Write-Host "  -> $prefix" -ForegroundColor Cyan
Write-Host '  Ctrl+C to stop' -ForegroundColor DarkGray
Write-Host ''

if (-not $NoBrowser) { Start-Process $prefix | Out-Null }

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    try {
      # Strip the query string and decode, then resolve inside $root only.
      $relative = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }

      $full = Join-Path $root $relative
      $resolved = [System.IO.Path]::GetFullPath($full)

      # Refuse anything that escapes the served directory.
      if (-not $resolved.StartsWith([System.IO.Path]::GetFullPath($root), [System.StringComparison]::OrdinalIgnoreCase)) {
        $response.StatusCode = 403
        $response.Close()
        continue
      }

      if (Test-Path $resolved -PathType Container) {
        $resolved = Join-Path $resolved 'index.html'
      }

      if (-not (Test-Path $resolved -PathType Leaf)) {
        $response.StatusCode = 404
        $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 - $relative")
        $response.ContentType = 'text/plain; charset=utf-8'
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.Close()
        Write-Host ("  404  " + $relative) -ForegroundColor DarkRed
        continue
      }

      $ext = [System.IO.Path]::GetExtension($resolved).ToLower()
      $type = $mime[$ext]
      if (-not $type) { $type = 'application/octet-stream' }

      $bytes = [System.IO.File]::ReadAllBytes($resolved)
      $response.ContentType = $type
      $response.Headers.Add('Cache-Control', 'no-cache, no-store, must-revalidate')
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      $response.Close()
      Write-Host ("  200  " + $relative) -ForegroundColor DarkGray
    } catch {
      try {
        $response.StatusCode = 500
        $response.Close()
      } catch { }
      Write-Host ("  500  " + $_.Exception.Message) -ForegroundColor Red
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
  Write-Host ''
  Write-Host '  server stopped' -ForegroundColor DarkGray
}
