# AetherAvia Production Readiness Checker (PowerShell)
# Run this script before deploying to production

param(
    [switch]$Detailed = $false
)

Write-Host "🔍 AetherAvia Production Readiness Check" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

$Errors = 0
$Warnings = 0

# Function to check environment variable
function Test-EnvVar {
    param(
        [string]$VarName,
        [string]$VarValue,
        [bool]$Required = $true
    )
    
    $PlaceholderPatterns = @("your-", "placeholder", "example", "change-me", "update-this", "replace-with")
    
    if ([string]::IsNullOrEmpty($VarValue)) {
        if ($Required) {
            Write-Host "❌ ERROR: $VarName is not set" -ForegroundColor Red
            $script:Errors++
        } else {
            Write-Host "⚠️  WARNING: $VarName is not set (optional)" -ForegroundColor Yellow
            $script:Warnings++
        }
        return $false
    }
    
    # Check for placeholder values
    foreach ($pattern in $PlaceholderPatterns) {
        if ($VarValue -like "*$pattern*") {
            Write-Host "❌ ERROR: $VarName contains placeholder value: $VarValue" -ForegroundColor Red
            $script:Errors++
            return $false
        }
    }
    
    Write-Host "✅ $VarName is properly configured" -ForegroundColor Green
    return $true
}

# Function to check file exists
function Test-FileExists {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        Write-Host "✅ $FilePath exists" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ ERROR: $FilePath not found" -ForegroundColor Red
        $script:Errors++
        return $false
    }
}

# Load production environment variables
Write-Host ""
Write-Host "Checking Environment Configuration..." -ForegroundColor White
Write-Host "-------------------------------------" -ForegroundColor White

$EnvFile = ".env.production"
if (-not (Test-Path $EnvFile)) {
    Write-Host "❌ ERROR: $EnvFile file not found" -ForegroundColor Red
    $Errors++
    exit 1
}

# Parse environment file
$EnvVars = @{}
Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $EnvVars[$matches[1]] = $matches[2]
    }
}

# Check critical environment variables
Write-Host ""
Write-Host "Security and Authentication:" -ForegroundColor White
Test-EnvVar "MONGODB_URI" $EnvVars["MONGODB_URI"] $true
Test-EnvVar "NEXTAUTH_SECRET" $EnvVars["NEXTAUTH_SECRET"] $true
Test-EnvVar "NEXTAUTH_URL" $EnvVars["NEXTAUTH_URL"] $true

Write-Host ""
Write-Host "Payment Configuration:" -ForegroundColor White
Test-EnvVar "RAZORPAY_KEY_ID" $EnvVars["RAZORPAY_KEY_ID"] $true
Test-EnvVar "RAZORPAY_KEY_SECRET" $EnvVars["RAZORPAY_KEY_SECRET"] $true
Test-EnvVar "NEXT_PUBLIC_RAZORPAY_KEY_ID" $EnvVars["NEXT_PUBLIC_RAZORPAY_KEY_ID"] $true

Write-Host ""
Write-Host "Email Configuration:" -ForegroundColor White
Test-EnvVar "SMTP_HOST" $EnvVars["SMTP_HOST"] $true
Test-EnvVar "SMTP_PORT" $EnvVars["SMTP_PORT"] $true
Test-EnvVar "SMTP_USER" $EnvVars["SMTP_USER"] $true
Test-EnvVar "SMTP_PASS" $EnvVars["SMTP_PASS"] $true
Test-EnvVar "SMTP_FROM" $EnvVars["SMTP_FROM"] $true

Write-Host ""
Write-Host "Cloud Services:" -ForegroundColor White
Test-EnvVar "CLOUDINARY_CLOUD_NAME" $EnvVars["CLOUDINARY_CLOUD_NAME"] $true
Test-EnvVar "CLOUDINARY_API_KEY" $EnvVars["CLOUDINARY_API_KEY"] $true
Test-EnvVar "CLOUDINARY_API_SECRET" $EnvVars["CLOUDINARY_API_SECRET"] $true

Write-Host ""
Write-Host "Branding:" -ForegroundColor White
Test-EnvVar "NEXT_PUBLIC_BRAND_NAME" $EnvVars["NEXT_PUBLIC_BRAND_NAME"] $false
Test-EnvVar "NEXT_PUBLIC_SITE_URL" $EnvVars["NEXT_PUBLIC_SITE_URL"] $false

Write-Host "`n📦 File Structure Check..." -ForegroundColor White
Write-Host "-------------------------" -ForegroundColor White

# Check critical files
$CriticalFiles = @(
    "package.json",
    "next.config.mjs",
    "lib\analytics\cancellation.ts",
    "lib\notifications\cancellation-template.ts",
    "app\api\admin\analytics\cancellations\route.ts",
    "app\api\orders\[id]\cancel\route.ts"
)

foreach ($file in $CriticalFiles) {
    Test-FileExists $file
}

Write-Host "`n🏗️ Build Test..." -ForegroundColor White
Write-Host "---------------" -ForegroundColor White

# Test build process
Write-Host "Running production build test..." -ForegroundColor White
try {
    $buildOutput = & npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Production build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ ERROR: Production build failed" -ForegroundColor Red
        if ($Detailed) {
            Write-Host "Build output:" -ForegroundColor Yellow
            Write-Host $buildOutput -ForegroundColor Yellow
        }
        $Errors++
    }
} catch {
    Write-Host "❌ ERROR: Could not run build test" -ForegroundColor Red
    $Errors++
}

Write-Host "`n📊 Analytics & Notifications Test..." -ForegroundColor White
Write-Host "----------------------------------" -ForegroundColor White

# Check cancellation analytics
if (Test-Path "lib\analytics\cancellation.ts") {
    $content = Get-Content "lib\analytics\cancellation.ts" -Raw
    if ($content -match "class CancellationAnalytics") {
        Write-Host "✅ Cancellation analytics class found" -ForegroundColor Green
    } else {
        Write-Host "❌ ERROR: CancellationAnalytics class not found" -ForegroundColor Red
        $Errors++
    }
}

# Check email templates
if (Test-Path "lib\notifications\cancellation-template.ts") {
    $content = Get-Content "lib\notifications\cancellation-template.ts" -Raw
    if ($content -match "generateCancellationEmailTemplate") {
        Write-Host "✅ Cancellation email template function found" -ForegroundColor Green
    } else {
        Write-Host "❌ ERROR: Email template function not found" -ForegroundColor Red
        $Errors++
    }
}

Write-Host "`n🔧 Additional Checks..." -ForegroundColor White
Write-Host "--------------------" -ForegroundColor White

# Check package.json scripts
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    
    if ($packageJson.scripts.build) {
        Write-Host "✅ Build script configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: Build script not found in package.json" -ForegroundColor Yellow
        $Warnings++
    }
    
    if ($packageJson.scripts.start) {
        Write-Host "✅ Start script configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: Start script not found in package.json" -ForegroundColor Yellow
        $Warnings++
    }
}

Write-Host "`n📈 Final Report" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan

if ($Errors -eq 0 -and $Warnings -eq 0) {
    Write-Host "🎉 PRODUCTION READY! All checks passed." -ForegroundColor Green
    exit 0
} elseif ($Errors -eq 0) {
    Write-Host "⚠️  PRODUCTION READY with warnings: $Warnings warning(s) found." -ForegroundColor Yellow
    Write-Host "   Consider addressing warnings before deployment." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "❌ NOT PRODUCTION READY: $Errors error(s) and $Warnings warning(s) found." -ForegroundColor Red
    Write-Host "   Please fix all errors before deploying to production." -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Common fixes needed:" -ForegroundColor Yellow
    Write-Host "1. Update SMTP credentials in .env.production" -ForegroundColor White
    Write-Host "2. Replace 'your-gmail-app-password-here' with actual Gmail App Password" -ForegroundColor White
    Write-Host "3. Ensure all API keys are properly configured" -ForegroundColor White
    Write-Host "4. Verify NEXTAUTH_URL matches your production domain" -ForegroundColor White
    Write-Host "5. Test email functionality with real SMTP credentials" -ForegroundColor White
    Write-Host ""
    Write-Host "📧 To set up Gmail App Password:" -ForegroundColor Cyan
    Write-Host "1. Go to Google Account settings" -ForegroundColor White
    Write-Host "2. Security > 2-Step Verification > App passwords" -ForegroundColor White
    Write-Host "3. Generate app password for Mail" -ForegroundColor White
    Write-Host "4. Use this password in SMTP_PASS" -ForegroundColor White
    exit 1
}