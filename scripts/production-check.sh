#!/bin/bash

# AetherAvia Production Readiness Checker
# Run this script before deploying to production

echo "🔍 AetherAvia Production Readiness Check"
echo "======================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check if environment variable is set and not placeholder
check_env_var() {
    local var_name=$1
    local var_value=$2
    local is_required=$3
    local placeholder_patterns=("your-" "placeholder" "example" "change-me" "update-this" "replace-with")
    
    if [ -z "$var_value" ]; then
        if [ "$is_required" = "true" ]; then
            echo -e "${RED}❌ ERROR: $var_name is not set${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠️  WARNING: $var_name is not set (optional)${NC}"
            ((WARNINGS++))
        fi
        return 1
    fi
    
    # Check for placeholder values
    for pattern in "${placeholder_patterns[@]}"; do
        if [[ "$var_value" == *"$pattern"* ]]; then
            echo -e "${RED}❌ ERROR: $var_name contains placeholder value: $var_value${NC}"
            ((ERRORS++))
            return 1
        fi
    done
    
    echo -e "${GREEN}✅ $var_name is properly configured${NC}"
    return 0
}

# Function to check file exists
check_file() {
    local file_path=$1
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}✅ $file_path exists${NC}"
        return 0
    else
        echo -e "${RED}❌ ERROR: $file_path not found${NC}"
        ((ERRORS++))
        return 1
    fi
}

echo ""
echo "📋 Checking Environment Configuration..."
echo "-------------------------------------"

# Load production environment file
if [ -f ".env.production" ]; then
    source .env.production
else
    echo -e "${RED}❌ ERROR: .env.production file not found${NC}"
    ((ERRORS++))
    exit 1
fi

# Check critical environment variables
echo ""
echo "🔐 Security & Authentication:"
check_env_var "MONGODB_URI" "$MONGODB_URI" "true"
check_env_var "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET" "true"
check_env_var "NEXTAUTH_URL" "$NEXTAUTH_URL" "true"

echo ""
echo "💳 Payment Configuration:"
check_env_var "RAZORPAY_KEY_ID" "$RAZORPAY_KEY_ID" "true"
check_env_var "RAZORPAY_KEY_SECRET" "$RAZORPAY_KEY_SECRET" "true"
check_env_var "NEXT_PUBLIC_RAZORPAY_KEY_ID" "$NEXT_PUBLIC_RAZORPAY_KEY_ID" "true"

echo ""
echo "📧 Email Configuration:"
check_env_var "SMTP_HOST" "$SMTP_HOST" "true"
check_env_var "SMTP_PORT" "$SMTP_PORT" "true"
check_env_var "SMTP_USER" "$SMTP_USER" "true"
check_env_var "SMTP_PASS" "$SMTP_PASS" "true"
check_env_var "SMTP_FROM" "$SMTP_FROM" "true"

echo ""
echo "☁️ Cloud Services:"
check_env_var "CLOUDINARY_CLOUD_NAME" "$CLOUDINARY_CLOUD_NAME" "true"
check_env_var "CLOUDINARY_API_KEY" "$CLOUDINARY_API_KEY" "true"
check_env_var "CLOUDINARY_API_SECRET" "$CLOUDINARY_API_SECRET" "true"

echo ""
echo "🏷️ Branding:"
check_env_var "NEXT_PUBLIC_BRAND_NAME" "$NEXT_PUBLIC_BRAND_NAME" "false"
check_env_var "NEXT_PUBLIC_SITE_URL" "$NEXT_PUBLIC_SITE_URL" "false"

echo ""
echo "📦 File Structure Check..."
echo "-------------------------"

# Check critical files
check_file "package.json"
check_file "next.config.mjs"
check_file "lib/analytics/cancellation.ts"
check_file "lib/notifications/cancellation-template.ts"
check_file "app/api/admin/analytics/cancellations/route.ts"
check_file "app/api/orders/[id]/cancel/route.ts"

echo ""
echo "🏗️ Build Test..."
echo "---------------"

# Test build process
echo "Running production build test..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Production build successful${NC}"
else
    echo -e "${RED}❌ ERROR: Production build failed${NC}"
    echo "Run 'npm run build' for detailed error information"
    ((ERRORS++))
fi

echo ""
echo "🔧 TypeScript Check..."
echo "--------------------"

# Check TypeScript compilation
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: TypeScript check not available or failed${NC}"
    echo "Consider adding 'type-check' script to package.json"
    ((WARNINGS++))
fi

echo ""
echo "📊 Analytics & Notifications Test..."
echo "----------------------------------"

# Check if cancellation analytics files are properly structured
if [ -f "lib/analytics/cancellation.ts" ]; then
    if grep -q "class CancellationAnalytics" "lib/analytics/cancellation.ts"; then
        echo -e "${GREEN}✅ Cancellation analytics class found${NC}"
    else
        echo -e "${RED}❌ ERROR: CancellationAnalytics class not found${NC}"
        ((ERRORS++))
    fi
fi

# Check if email templates are properly configured
if [ -f "lib/notifications/cancellation-template.ts" ]; then
    if grep -q "generateCancellationEmailTemplate" "lib/notifications/cancellation-template.ts"; then
        echo -e "${GREEN}✅ Cancellation email template function found${NC}"
    else
        echo -e "${RED}❌ ERROR: Email template function not found${NC}"
        ((ERRORS++))
    fi
fi

echo ""
echo "🚀 Performance Check..."
echo "---------------------"

# Check if bundle analyzer is available (optional)
if npm list --depth=0 @next/bundle-analyzer > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Bundle analyzer available for performance monitoring${NC}"
else
    echo -e "${YELLOW}⚠️  INFO: Bundle analyzer not installed (optional)${NC}"
fi

echo ""
echo "📈 Final Report"
echo "=============="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 PRODUCTION READY! All checks passed.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  PRODUCTION READY with warnings: $WARNINGS warning(s) found.${NC}"
    echo -e "${YELLOW}   Consider addressing warnings before deployment.${NC}"
    exit 0
else
    echo -e "${RED}❌ NOT PRODUCTION READY: $ERRORS error(s) and $WARNINGS warning(s) found.${NC}"
    echo -e "${RED}   Please fix all errors before deploying to production.${NC}"
    echo ""
    echo "Common fixes:"
    echo "1. Update SMTP credentials in .env.production"
    echo "2. Ensure all API keys are properly configured"
    echo "3. Verify NEXTAUTH_URL matches your production domain"
    echo "4. Test email functionality with real SMTP credentials"
    exit 1
fi
