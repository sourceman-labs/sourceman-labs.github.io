import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
config({ path: join(rootDir, '.env') });

/**
 * Safely retrieves a required environment variable.
 * Throws an error if the variable is not set.
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];

  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please ensure ${key} is set in your .env file or environment.\n` +
      `See .env.example for required variables.`
    );
  }

  return value.trim();
}

/**
 * Safely retrieves an optional environment variable.
 * Returns the default value if the variable is not set.
 */
export function getOptionalEnv(key: string, defaultValue: string): string {
  const value = process.env[key];
  return value && value.trim() !== '' ? value.trim() : defaultValue;
}
