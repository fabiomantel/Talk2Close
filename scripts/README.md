# E2E Testing Scripts

This directory contains comprehensive end-to-end testing scripts for the Hebrew Sales Call Analysis System.

## Overview

The E2E testing infrastructure provides two testing approaches:

1. **Bash Script** (`e2e-test.sh`) - Lightweight, dependency-free testing
2. **Node.js Script** (`e2e-test.js`) - Advanced testing with better error handling and reporting

## Quick Start

### Prerequisites

#### For Bash Script
- `curl` - HTTP client
- `jq` - JSON processor
- `bc` - Basic calculator (for performance calculations)

#### For Node.js Script
- Node.js 18+
- Dependencies: `axios`, `form-data` (installed via npm)

### Basic Usage

#### Using npm scripts (recommended)
```bash
# Quick infrastructure health check
npm run e2e:quick

# Full test suite with performance benchmarks
npm run e2e:full

# Test specific phases
npm run e2e:infrastructure
npm run e2e:functionality
npm run e2e:workflow
npm run e2e:performance
npm run e2e:security
```

#### Using scripts directly
```bash
# Node.js script
node scripts/e2e-test.js --phase infrastructure

# Bash script
./scripts/e2e-test.sh --manual --quick
```

## Test Phases

### 1. Infrastructure Health
Tests basic system availability and connectivity.

**Tests:**
- Backend health check (`/health`)
- API health check (`/api/health`)
- Frontend accessibility
- SSL/HTTPS configuration

**Usage:**
```bash
npm run e2e:infrastructure
# or
node scripts/e2e-test.js --phase infrastructure
```

### 2. Application Functionality
Tests core API endpoints and business logic.

**Tests:**
- Customers API (`/api/customers`)
- Dashboard Stats API (`/api/dashboard/stats`)
- Analysis API (`/api/analyze`)
- Configuration API (`/api/configuration`)

**Usage:**
```bash
npm run e2e:functionality
# or
node scripts/e2e-test.js --phase functionality
```

### 3. End-to-End Workflow
Tests complete user workflows including file upload and analysis.

**Tests:**
- File upload with customer data
- Audio analysis processing
- Results verification

**Requirements:**
- Test audio file: `tests/fixtures/small-test.mp3`

**Usage:**
```bash
npm run e2e:workflow
# or
node scripts/e2e-test.js --phase e2e-workflow
```

### 4. Performance
Tests system performance and response times.

**Tests:**
- Backend response time (< 2s)
- Frontend load time (< 5s)
- API response times (< 2s)
- Load testing (if Apache Bench available)

**Usage:**
```bash
npm run e2e:performance
# or
node scripts/e2e-test.js --phase performance --benchmark
```

### 5. Security
Tests security configurations and protections.

**Tests:**
- HTTPS enforcement
- CORS configuration
- File upload security (malicious file rejection)

**Usage:**
```bash
npm run e2e:security
# or
node scripts/e2e-test.js --phase security
```

## Configuration

### Environment Variables

```bash
# Backend and Frontend URLs
BACKEND_URL=https://talk2close.fly.dev
FRONTEND_URL=https://talk2close.vercel.app

# Test Configuration
TEST_AUDIO_FILE=tests/fixtures/small-test.mp3
PHASE=all
FEATURE=all
ENVIRONMENT=production

# Testing Options
VERBOSE=true
BENCHMARK=true
```

### Command Line Options

#### Node.js Script Options
```bash
--backend-url URL           # Backend URL to test
--frontend-url URL          # Frontend URL to test
--test-audio FILE           # Test audio file path
--phase PHASE               # Test phase: infrastructure, functionality, e2e-workflow, performance, security, all
--feature FEATURE           # Test feature: audio-playback, customer-management, upload-processing, hebrew-display, all
--env ENV                   # Environment: production, staging, development
--verbose                   # Enable verbose output
--benchmark                 # Run performance benchmarks
--help                      # Show help message
```

#### Bash Script Options
```bash
--manual                    # Run manual tests (default)
--backend-url URL           # Backend URL to test
--frontend-url URL          # Frontend URL to test
--test-audio FILE           # Test audio file path
--phase PHASE               # Test phase
--feature FEATURE           # Test feature
--env ENV                   # Environment
--test-data DATA            # Test data: default, custom
--verbose                   # Enable verbose output
--quick                     # Quick health check (infrastructure only)
--benchmark                 # Run performance benchmarks
--report FORMAT             # Report format: text, json, html
--help                      # Show help message
```

## Test Data Setup

### Test Audio File

The E2E workflow tests require a test audio file:

1. **Create test audio file:**
   ```bash
   # Option 1: Use a real Hebrew audio file
   cp your-hebrew-audio.mp3 tests/fixtures/small-test.mp3
   
       # Option 2: Create a placeholder file
    echo "test audio content" > tests/fixtures/small-test.mp3
   ```

2. **File requirements:**
   - Format: MP3, WAV, M4A, AAC, or OGG
   - Size: < 50MB
   - Content: Hebrew audio (for realistic testing)

### Test Customer Data

The tests use the following test customer data:
- Name: ישראל כהן
- Phone: 050-1234567
- Email: test@example.com

## Testing Different Environments

### Production Testing
```bash
# Test against production deployment
npm run e2e:full
```

### Development Testing
```bash
# Test against local development environment
BACKEND_URL=http://localhost:3000 FRONTEND_URL=http://localhost:3001 npm run e2e:functionality
```

### Staging Testing
```bash
# Test against staging environment
BACKEND_URL=https://staging.talk2close.fly.dev FRONTEND_URL=https://staging.talk2close.vercel.app npm run e2e:full
```

## Advanced Usage

### Selective Testing
```bash
# Test only specific features
node scripts/e2e-test.js --phase functionality --feature customer-management

# Test with custom audio file
node scripts/e2e-test.js --test-audio /path/to/custom-audio.mp3

# Test with verbose output
node scripts/e2e-test.js --verbose --phase all
```

### Performance Benchmarking
```bash
# Run performance tests with benchmarks
npm run e2e:performance

# Run full suite with performance testing
npm run e2e:full
```

### Custom Test Data
```bash
# Use custom test data
node scripts/e2e-test.js --test-data custom --env development
```

## Troubleshooting

### Common Issues

#### 1. Missing Dependencies
```bash
# Install Node.js dependencies
npm install

# Install system dependencies (macOS)
brew install jq bc

# Install system dependencies (Ubuntu/Debian)
sudo apt-get install jq bc apache2-utils
```

#### 2. Test Audio File Issues
```bash
# Check if test file exists
    ls -la tests/fixtures/small-test.mp3

# Create placeholder file if missing
    echo "test audio content" > tests/fixtures/small-test.mp3
```

#### 3. Network Connectivity Issues
```bash
# Test connectivity to backend
curl -f https://talk2close.fly.dev/health

# Test connectivity to frontend
curl -f https://talk2close.vercel.app
```

#### 4. Permission Issues
```bash
# Make shell script executable
chmod +x scripts/e2e-test.sh
```

### Debug Mode

Enable verbose output for detailed debugging:

```bash
# Node.js script with verbose output
node scripts/e2e-test.js --verbose --phase infrastructure

# Bash script with verbose output
./scripts/e2e-test.sh --manual --verbose --phase infrastructure
```

### Test Results Interpretation

#### Success Indicators
- ✅ All tests pass (100% success rate)
- ✅ Response times within acceptable limits
- ✅ Security tests pass
- ✅ No critical errors

#### Warning Indicators
- ⚠️ Some tests fail but core functionality works
- ⚠️ Performance slightly degraded but acceptable
- ⚠️ Non-critical security issues

#### Failure Indicators
- ❌ Critical infrastructure tests fail
- ❌ Core API endpoints unavailable
- ❌ Security vulnerabilities detected
- ❌ Performance significantly degraded

## Integration with CI/CD

### GitHub Actions Integration
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run e2e:infrastructure
      - run: npm run e2e:functionality
      - run: npm run e2e:security
```

### Post-Deployment Testing
```bash
# Run after deployment completes
npm run e2e:full

# Quick health check
npm run e2e:quick
```

## Best Practices

### 1. Test Regularly
- Run infrastructure tests before deployments
- Run full suite after deployments
- Monitor performance trends over time

### 2. Use Appropriate Test Phases
- Use `infrastructure` for quick health checks
- Use `functionality` for API validation
- Use `e2e-workflow` for complete user journey testing
- Use `performance` for performance monitoring
- Use `security` for security validation

### 3. Monitor Test Results
- Track success rates over time
- Monitor response times
- Address failing tests promptly
- Document test failures and resolutions

### 4. Environment-Specific Testing
- Test against production before going live
- Use staging environment for pre-deployment testing
- Test local development environment during development

## Support

For issues with the E2E testing infrastructure:

1. Check the troubleshooting section above
2. Review test logs and error messages
3. Verify environment configuration
4. Test individual components manually
5. Check system dependencies and connectivity

## Contributing

To add new tests or improve the testing infrastructure:

1. Follow the existing code structure
2. Add appropriate error handling
3. Include verbose logging for debugging
4. Update documentation
5. Test changes thoroughly
