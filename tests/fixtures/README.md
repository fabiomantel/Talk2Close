# Test Fixtures

This directory contains test data and fixtures for E2E testing.

## Test Audio File

The E2E tests require a test audio file for file upload and analysis testing. 

### Required File
- `small-test.mp3` - A small test file for upload testing

### Setup Instructions

1. **Create a test audio file** (if you don't have one):
   ```bash
   # Option 1: Use a sample Hebrew audio file
   # Download or create a 30-60 second Hebrew audio file
   
   # Option 2: Create a test file using text-to-speech
   # You can use online TTS services to generate Hebrew audio
   
   # Option 3: Use a placeholder file for testing
   # Create an empty MP3 file for basic upload testing
   ```

2. **Place the file in this directory**:
   ```bash
   cp your-test-audio.mp3 tests/fixtures/small-test.mp3
   ```

3. **Verify the file**:
   ```bash
   ls -la tests/fixtures/small-test.mp3
   ```

### File Requirements

- **Format**: MP3, WAV, M4A, AAC, or OGG
- **Duration**: 30-60 seconds (for realistic testing)
- **Language**: Hebrew (for proper testing of Hebrew transcription)
- **Size**: < 50MB (to stay within upload limits)
- **Content**: Sales call conversation (for realistic analysis testing)

### Alternative Test Files

If you don't have a Hebrew sales call recording, you can:

1. **Use a placeholder file** for basic upload testing:
   ```bash
   # Create a minimal test file
   echo "test" > tests/fixtures/small-test.mp3
   ```

2. **Skip file upload tests** by running specific phases:
   ```bash
   ./scripts/e2e-test.sh --manual --phase infrastructure
   ./scripts/e2e-test.sh --manual --phase functionality
   ```

3. **Use development environment** with mock data:
   ```bash
   ./scripts/e2e-test.sh --manual --env development
   ```

## Test Data

### Customer Test Data
The E2E tests use the following test customer data:
- Name: ישראל כהן
- Phone: 050-1234567
- Email: test@example.com

### Expected Test Results
When running the full E2E workflow, you should expect:
- File upload success
- Customer creation in database
- Sales call record creation
- Audio transcription (if Hebrew audio provided)
- Scoring calculation
- Analysis results

## Troubleshooting

### File Upload Issues
- Ensure the test audio file exists and is readable
- Check file format is supported (MP3, WAV, M4A, AAC, OGG)
- Verify file size is within limits (< 50MB)

### Analysis Issues
- Hebrew audio files work best for realistic testing
- Analysis may take 30-60 seconds to complete
- Check OpenAI API key is configured for transcription

### Environment Issues
- Ensure backend and frontend URLs are correct
- Check network connectivity to deployment URLs
- Verify all required dependencies are installed (curl, jq, bc)
