import React from 'react';
import { config } from './config/environment';

// Simple test without complex dependencies
test('environment variables are configured', () => {
  // Test that environment variables are accessible
  expect(process.env.REACT_APP_ENVIRONMENT).toBeDefined();
  expect(process.env.REACT_APP_DEFAULT_LOCALE).toBeDefined();
  expect(process.env.REACT_APP_RTL_SUPPORT).toBeDefined();
});

test('API configuration is correctly loaded', () => {
  // Test that config loads properly, not specific URLs
  expect(config.API_BASE_URL).toBeDefined();
  expect(config.BACKEND_URL).toBeDefined();
  expect(config.API_BASE_URL).toContain('/api');
});

test('Hebrew locale is configured', () => {
  expect(process.env.REACT_APP_DEFAULT_LOCALE).toBe('he-IL');
});

test('RTL support is enabled', () => {
  expect(process.env.REACT_APP_RTL_SUPPORT).toBe('true');
});
