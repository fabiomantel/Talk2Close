import React from 'react';

// Simple test without complex dependencies
test('environment variables are configured', () => {
  // Test that environment variables are accessible
  expect(process.env.REACT_APP_API_BASE_URL).toBeDefined();
  expect(process.env.REACT_APP_ENVIRONMENT).toBeDefined();
  expect(process.env.REACT_APP_DEFAULT_LOCALE).toBeDefined();
  expect(process.env.REACT_APP_RTL_SUPPORT).toBeDefined();
});

test('API base URL is correctly configured', () => {
  expect(process.env.REACT_APP_API_BASE_URL).toBe('http://localhost:3000/api');
});

test('Hebrew locale is configured', () => {
  expect(process.env.REACT_APP_DEFAULT_LOCALE).toBe('he-IL');
});

test('RTL support is enabled', () => {
  expect(process.env.REACT_APP_RTL_SUPPORT).toBe('true');
});
