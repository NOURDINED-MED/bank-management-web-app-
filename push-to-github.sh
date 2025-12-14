#!/bin/bash

# Script to push BAMS app to GitHub
# This will prompt you for your GitHub credentials

echo "🚀 Pushing BAMS app to GitHub..."
echo ""
echo "Repository: https://github.com/NOURDINED-MED/bank-management-application"
echo ""
echo "⚠️  IMPORTANT: You need to create the repository on GitHub first!"
echo ""
echo "Steps:"
echo "1. Go to: https://github.com/new"
echo "2. Repository name: bank-management-application"
echo "3. Choose Public or Private"
echo "4. DO NOT check 'Initialize with README'"
echo "5. Click 'Create repository'"
echo ""
read -p "Press Enter when you've created the repository..."

echo ""
echo "📤 Pushing code to GitHub..."
echo "You'll be asked for:"
echo "  - Username: NOURDINED-MED"
echo "  - Password: Use a Personal Access Token (not your password)"
echo ""
echo "To get a token: https://github.com/settings/tokens"
echo "  → Generate new token (classic)"
echo "  → Check 'repo' scope"
echo "  → Generate and copy the token"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your code is now on GitHub!"
    echo "📍 URL: https://github.com/NOURDINED-MED/bank-management-application"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "  1. Repository exists on GitHub"
    echo "  2. You used Personal Access Token as password"
    echo "  3. Token has 'repo' permissions"
fi

