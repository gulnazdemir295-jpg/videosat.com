#!/bin/bash
# Pre-commit security check script

echo "🔍 Güvenlik kontrolü yapılıyor..."

# Check for AWS keys
if git diff --cached | grep -i "AKIA"; then
    echo "❌ AWS Access Key bulundu! Commit edilmedi."
    exit 1
fi

# Check for GitHub tokens
if git diff --cached | grep -E "ghp_|gho_|ghu_"; then
    echo "❌ GitHub Token bulundu! Commit edilmedi."
    exit 1
fi

# Check for .env files
if git diff --cached --name-only | grep "\.env$"; then
    echo "❌ .env dosyası bulundu! Commit edilmedi."
    exit 1
fi

# Check for private keys
if git diff --cached --name-only | grep -E "\.key$|\.pem$|\.p12$"; then
    echo "❌ Private key dosyası bulundu! Commit edilmedi."
    exit 1
fi

echo "✅ Güvenlik kontrolü başarılı!"
exit 0
