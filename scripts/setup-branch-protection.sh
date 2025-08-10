#!/bin/bash

# Setup Branch Protection Rules for Talk2Close Repository
# This script helps configure branch protection rules using GitHub CLI

set -e

echo "🔒 Setting up Branch Protection Rules for Talk2Close"
echo "=================================================="

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Please install it first: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"

# Function to create branch protection rule
create_branch_protection() {
    local branch=$1
    local repo="fabiomantel/Talk2Close"
    
    echo "🔧 Setting up protection for '$branch' branch..."
    
    # Create branch protection rule
    gh api repos/$repo/branches/$branch/protection \
        --method PUT \
        --field required_status_checks='{"strict":true,"contexts":["Quick Checks","Security Audit"]}' \
        --field enforce_admins=false \
        --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
        --field restrictions=null \
        --field allow_force_pushes=false \
        --field allow_deletions=false \
        --field block_creations=false \
        --field required_conversation_resolution=true \
        --field lock_branch=false \
        --field allow_fork_syncing=true
    
    echo "✅ Protection rules applied to '$branch' branch"
}

# Setup protection for main branch
echo ""
echo "📋 Setting up protection for 'main' branch..."
create_branch_protection "main"

# Setup protection for develop branch (if it exists)
echo ""
echo "📋 Setting up protection for 'develop' branch..."
if gh api repos/fabiomantel/Talk2Close/branches/develop &> /dev/null; then
    create_branch_protection "develop"
else
    echo "⚠️  'develop' branch doesn't exist yet. Protection will be applied when it's created."
fi

echo ""
echo "🎉 Branch protection setup complete!"
echo ""
echo "📋 Summary of protection rules:"
echo "   • Required status checks: Quick Checks, Security Audit"
echo "   • Required PR reviews: 1 approval"
echo "   • No force pushes allowed"
echo "   • No branch deletions allowed"
echo "   • Conversation resolution required"
echo ""
echo "🔍 To verify the setup, visit:"
echo "   https://github.com/fabiomantel/Talk2Close/settings/branches"
echo ""
echo "📚 For more information, see: .github/README.md"
