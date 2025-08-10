# CI/CD Pipeline Documentation

This directory contains the GitHub Actions workflows for automated testing and deployment.

## 📋 Workflows

### 1. PR Checks (`pr-checks.yml`)
**Trigger**: Pull requests to `main` or `develop` branches

**What it does**:
- ✅ Runs backend unit tests
- ✅ Runs frontend component tests
- ✅ Performs TypeScript compilation check
- ✅ Builds the frontend application
- ✅ Runs security audit (npm audit)
- ✅ Comments on PR with results

**Duration**: ~3-5 minutes

### 2. Full CI/CD Pipeline (`ci.yml`)
**Trigger**: Pull requests and pushes to `main` or `develop` branches

**What it does**:
- ✅ All PR checks above
- ✅ Multi-node version testing (18.x, 20.x)
- ✅ Integration tests
- ✅ Test coverage reporting
- ✅ Build artifacts upload
- ✅ Comprehensive security scanning

**Duration**: ~8-12 minutes

## 🔧 Configuration

### Environment Variables
The workflows use the following environment variables:

**Backend**:
- `NODE_ENV`: test
- `DATABASE_URL`: file:./test.db

**Frontend**:
- `CI`: true
- `REACT_APP_API_BASE_URL`: http://localhost:3000/api
- `REACT_APP_BACKEND_URL`: http://localhost:3000

### Node.js Versions
- **PR Checks**: Node.js 20.x only
- **Full CI**: Node.js 18.x and 20.x (matrix testing)

## 🚀 How It Works

### For Pull Requests
1. **Automatic Trigger**: When a PR is opened or updated
2. **Parallel Jobs**: Quick checks and security audit run simultaneously
3. **Status Check**: Results are posted as a comment on the PR
4. **Branch Protection**: PR cannot be merged until all checks pass

### For Main Branch
1. **Full Pipeline**: Complete CI/CD pipeline runs
2. **Artifacts**: Build artifacts are uploaded for deployment
3. **Coverage**: Test coverage reports are generated

## 📊 Status Checks

The following status checks must pass before merging:

- **Quick Checks**: Backend tests, frontend tests, TypeScript, build
- **Security Audit**: npm audit for both backend and frontend

## 🔍 Troubleshooting

### Common Issues

1. **Tests Failing Locally but Passing in CI**
   - Check environment variables
   - Ensure database is properly set up
   - Verify all dependencies are installed

2. **Frontend Build Failing**
   - Check TypeScript compilation errors
   - Verify all imports are correct
   - Ensure environment variables are set

3. **Security Audit Failing**
   - Run `npm audit` locally to see vulnerabilities
   - Update dependencies or add resolutions
   - Consider using `npm audit --fix`

### Local Testing

To test the CI workflow locally:

```bash
# Backend tests
npm test

# Frontend tests
cd frontend && npm test -- --watchAll=false

# TypeScript check
cd frontend && npx tsc --noEmit

# Build
cd frontend && npm run build

# Security audit
npm audit --audit-level=high
cd frontend && npm audit --audit-level=high
```

## 🔒 Security

- **Dependency Scanning**: Automatic npm audit on every PR
- **Branch Protection**: Prevents force pushes and deletions
- **Required Reviews**: At least one approval required
- **Status Checks**: Must pass before merging

## 📈 Metrics

The CI pipeline provides:
- Test execution time
- Coverage reports
- Build artifacts
- Security vulnerability reports

## 🛠️ Customization

### Adding New Tests
1. Add test files to `tests/` directory
2. Update `package.json` test script if needed
3. Tests will automatically run in CI

### Modifying Workflows
1. Edit the `.yml` files in this directory
2. Test changes by creating a PR
3. Monitor the Actions tab for results

### Environment Variables
Add new environment variables in the workflow files:
```yaml
env:
  NEW_VAR: value
```

## 📞 Support

If you encounter issues with the CI pipeline:
1. Check the Actions tab in GitHub
2. Review the workflow logs
3. Test locally to reproduce the issue
4. Create an issue with detailed information
