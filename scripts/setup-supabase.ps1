# Usage (from doora-platform root):
#   .\scripts\setup-supabase.ps1 -Password "your-supabase-db-password"

param(
  [Parameter(Mandatory = $true)]
  [string]$Password
)

$ErrorActionPreference = "Stop"
$ref = "ypcafcutqlqzwahsdbjq"
$encoded = [uri]::EscapeDataString($Password)

$pool = "postgresql://postgres.${ref}:${encoded}@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
$direct = "postgresql://postgres.${ref}:${encoded}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

$root = Split-Path $PSScriptRoot -Parent

$webEnv = @"
DATABASE_URL=$pool
DIRECT_URL=$direct
AUTH_SECRET=doora-dev-secret-change-in-production-32chars
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_REALTIME_URL=http://localhost:3001
NEXT_PUBLIC_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
GROQ_API_KEY=
METERED_API_KEY=
METERED_DOMAIN=dilnukavsis.metered.live

DEV_SKIP_AUTH=false
NEXT_PUBLIC_DEV_SKIP_AUTH=false
"@

$dbEnv = @"
DATABASE_URL=$pool
DIRECT_URL=$direct
"@

$rtEnv = @"
DATABASE_URL=$pool
AUTH_SECRET=doora-dev-secret-change-in-production-32chars
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000
"@

Set-Content -Path "$root\apps\web\.env.local" -Value $webEnv -NoNewline
Set-Content -Path "$root\packages\database\.env" -Value $dbEnv -NoNewline
Set-Content -Path "$root\apps\realtime\.env" -Value $rtEnv -NoNewline

Write-Host "Wrote env files (password URL-encoded for connection strings)"
